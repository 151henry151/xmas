import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { verifyToken, login, register, publicProfile, endSeason, metaPayload } from './auth.js';
import { getUser, upsertUser } from './store.js';
import {
  STANDS,
  standSpawnWorld,
  findStandNear,
  mapPayload,
  TILE_SIZE,
  tileAt,
  isWalkable,
} from './map.js';
import { SELLERS, pickCustomer, pickVendor } from './characters.js';
import { startSaleBattle, startVendorBattle, getCurrentRound, applyChoice } from './battles.js';
import {
  sellerBonus,
  priceMultiplier,
  restock,
  buyUpgrade,
  payRent,
  consumeTree,
  pickTreeForSale,
  getDayPhase,
  totalStock,
} from './economy.js';
import { tickNpcs, getNpcs } from './npcs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3334;
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true } });

app.use(express.json({ limit: '32kb' }));
app.use(express.static(join(__dirname, '../public')));

/** @type {Map<string, object>} */
const online = new Map();
const chatLog = [];
const MAX_CHAT = 40;

function pushChat(username, text) {
  const entry = { user: username, text: text.slice(0, 120), at: Date.now() };
  chatLog.push(entry);
  if (chatLog.length > MAX_CHAT) chatLog.shift();
  io.emit('chat', entry);
}

function worldPayload() {
  return {
    players: [...online.values()].map((p) => ({
      username: p.username,
      x: p.x,
      y: p.y,
      standId: p.standId,
      sellerId: p.sellerId,
      facing: p.facing,
      inBattle: !!p.battle,
    })),
    stands: STANDS,
    npcs: getNpcs(),
    dayPhase: getDayPhase(),
    mapSize: { w: mapPayload().w, h: mapPayload().h, tile: TILE_SIZE },
    chat: chatLog.slice(-15),
  };
}

function broadcastWorld() {
  io.emit('world', worldPayload());
}

function serializeBattle(b) {
  const round = getCurrentRound(b);
  return {
    type: b.type,
    customer: b.customer,
    vendor: b.vendor,
    tree: b.tree,
    resistance: b.resistance,
    maxResistance: b.maxResistance,
    roundIndex: b.roundIndex,
    won: b.won,
    lost: b.lost,
    earnings: b.earnings,
    basePrice: b.basePrice,
    round,
  };
}

function findPlayerAtStand(standId) {
  for (const p of online.values()) {
    if (p.standId === standId && !p.battle) {
      const stand = STANDS.find((s) => s.id === standId);
      if (!stand) continue;
      const c = { x: (stand.tileX + 2) * TILE_SIZE, y: (stand.tileY + 2) * TILE_SIZE };
      if (Math.hypot(p.x - c.x, p.y - c.y) < TILE_SIZE * 5) return p;
    }
  }
  return null;
}

app.post('/api/register', (req, res) => {
  const out = register(req.body?.username, req.body?.password, req.body?.sellerId);
  if (out.error) return res.status(400).json(out);
  res.json(out);
});

app.post('/api/login', (req, res) => {
  const out = login(req.body?.username, req.body?.password);
  if (out.error) return res.status(401).json(out);
  res.json(out);
});

app.get('/api/me', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ profile: publicProfile(user) });
});

app.get('/api/meta', (_req, res) => {
  res.json({ sellers: SELLERS, stands: STANDS, ...metaPayload() });
});

setInterval(() => {
  tickNpcs();
  broadcastWorld();
}, 2000);

io.on('connection', (socket) => {
  let me = null;

  socket.on('join', ({ token }) => {
    const user = verifyToken(token);
    if (!user) {
      socket.emit('error', { message: 'Login required' });
      return;
    }
    for (const [sid, p] of online) {
      if (p.username === user.username && sid !== socket.id) online.delete(sid);
    }
    const spawn = standSpawnWorld(user.standId);
    me = {
      socketId: socket.id,
      username: user.username,
      standId: user.standId,
      sellerId: user.sellerId,
      x: spawn.x,
      y: spawn.y,
      facing: 'down',
      battle: null,
    };
    online.set(socket.id, me);
    socket.emit('joined', {
      profile: publicProfile(user),
      you: { x: me.x, y: me.y, standId: me.standId },
      map: mapPayload(),
      stands: STANDS,
      sellers: SELLERS,
      ...metaPayload(),
      chat: chatLog.slice(-15),
    });
    broadcastWorld();
  });

  socket.on('move', ({ dx, dy }) => {
    if (!me || me.battle) return;
    const speed = 2.8;
    const nx = me.x + dx * speed;
    const ny = me.y + dy * speed;
    if (!isWalkable(tileAt(Math.floor(nx / TILE_SIZE), Math.floor(ny / TILE_SIZE)))) return;
    me.x = nx;
    me.y = ny;
    if (Math.abs(dx) > Math.abs(dy)) me.facing = dx > 0 ? 'right' : 'left';
    else if (dy !== 0) me.facing = dy > 0 ? 'down' : 'up';
    socket.emit('pos', { x: me.x, y: me.y, facing: me.facing });
    broadcastWorld();
  });

  socket.on('chat', ({ text }) => {
    if (!me || !text) return;
    pushChat(me.username, String(text).trim());
  });

  socket.on('restock', () => {
    if (!me) return;
    const user = getUser(me.username);
    const out = restock(user);
    if (out.error) {
      socket.emit('message', { text: out.error });
      return;
    }
    upsertUser(user.username, user);
    socket.emit('profile', { profile: publicProfile(user) });
    socket.emit('message', { text: 'Wholesale delivery arrived — trees restocked!' });
  });

  socket.on('buyUpgrade', ({ id }) => {
    if (!me) return;
    const user = getUser(me.username);
    const out = buyUpgrade(user, id);
    if (out.error) {
      socket.emit('message', { text: out.error });
      return;
    }
    upsertUser(user.username, user);
    socket.emit('profile', { profile: publicProfile(user) });
    socket.emit('message', { text: 'Upgrade installed at your lot.' });
  });

  socket.on('payRent', () => {
    if (!me) return;
    const user = getUser(me.username);
    const out = payRent(user);
    if (out.error) {
      socket.emit('message', { text: out.error });
      return;
    }
    upsertUser(user.username, user);
    socket.emit('profile', { profile: publicProfile(user) });
    socket.emit('message', { text: `Rent paid ($${out.rent}). Day ${user.day} begins.` });
  });

  socket.on('tutorialAdvance', () => {
    if (!me) return;
    const user = getUser(me.username);
    user.tutorialStep = Math.min(5, (user.tutorialStep || 0) + 1);
    upsertUser(user.username, user);
    socket.emit('profile', { profile: publicProfile(user) });
  });

  socket.on('interact', () => {
    if (!me || me.battle) return;
    const user = getUser(me.username);
    const stand = findStandNear(me.x, me.y);
    if (!stand) {
      socket.emit('message', { text: 'Walk to a tree lot (🎄 on the map) and press E.' });
      return;
    }

    if (stand.boss && !(user.rompUnlocked || (user.seasonsGood || 0) >= 3)) {
      socket.emit('message', {
        text: 'Romp Family Christmas Trees — veterans only. Earn 3 good seasons (5+ sales each) first.',
      });
      return;
    }

    const atOwn = stand.id === user.standId || (stand.boss && user.standId === 'romp');

    if (!atOwn) {
      const rival = findPlayerAtStand(stand.id);
      if (rival && rival.username !== me.username) {
        socket.emit('message', {
          text: `${rival.username} is working this lot — say hi in chat (T)!`,
        });
        return;
      }
      me.battle = startVendorBattle(pickVendor(stand.id));
      socket.emit('battleStart', { battle: serializeBattle(me.battle) });
      return;
    }

    if (user.rentDue) {
      socket.emit('message', { text: 'Pay rent in the sidebar before selling (Rent button).' });
      return;
    }

    if (totalStock(user.stock) <= 0) {
      socket.emit('message', { text: 'Out of trees! Press Restock in the sidebar ($175).' });
      return;
    }

    const customer = pickCustomer(stand.id, stand.boss);
    const tree = pickTreeForSale(user, customer);
    if (!tree) {
      socket.emit('message', { text: 'No matching trees in stock — restock or change inventory.' });
      return;
    }

    const bonus = sellerBonus(user);
    const mult = priceMultiplier(user, stand);
    me.battle = startSaleBattle(stand, bonus, tree, mult);
    me.battle.customer = customer;
    socket.emit('battleStart', { battle: serializeBattle(me.battle) });
  });

  socket.on('battleChoice', ({ index }) => {
    if (!me?.battle) return;
    const user = getUser(me.username);
    let bonus = sellerBonus(user);
    if (user.upgrades?.cocoa && !user.cocoaUsed && me.battle.type === 'sale') {
      bonus += 1;
      user.cocoaUsed = true;
    }
    const result = applyChoice(me.battle, index, bonus);
    if (result.error) return;

    const payload = {
      reply: result.reply,
      phase: result.phase,
      battle: serializeBattle(me.battle),
      delta: result.delta,
    };

    if (result.phase === 'won' && me.battle.type === 'sale') {
      consumeTree(user, me.battle.tree.id);
      user.cash = (user.cash || 0) + me.battle.earnings;
      user.treesSold = (user.treesSold || 0) + 1;
      user.seasonSales = (user.seasonSales || 0) + 1;
      user.reputation = (user.reputation || 0) + 1;
      user.totalEarnings = (user.totalEarnings || 0) + me.battle.earnings;
      if (user.tutorialStep < 3) user.tutorialStep = 3;
      if (user.seasonSales >= 3 && user.tutorialStep < 4) user.tutorialStep = 4;
      if (user.seasonSales > 0 && user.seasonSales % 6 === 0) user.rentDue = true;
      upsertUser(user.username, user);
      payload.profile = publicProfile(user);
    }

    if (result.phase === 'won' && me.battle.type === 'vendor') {
      user.reputation = (user.reputation || 0) + (me.battle.repGain || 1);
      upsertUser(user.username, user);
      payload.profile = publicProfile(user);
    }

    if (result.phase === 'won' || result.phase === 'lost') me.battle = null;
    socket.emit('battleUpdate', payload);
    broadcastWorld();
  });

  socket.on('endSeason', () => {
    if (!me) return;
    const user = getUser(me.username);
    const out = endSeason(user);
    me.standId = user.standId;
    const spawn = standSpawnWorld(user.standId);
    me.x = spawn.x;
    me.y = spawn.y;
    if (out.good) user.rentDue = false;
    else user.rentDue = true;
    upsertUser(user.username, user);
    socket.emit('seasonEnded', { ...out, profile: publicProfile(user) });
    broadcastWorld();
  });

  socket.on('disconnect', () => {
    online.delete(socket.id);
    broadcastWorld();
  });
});

server.listen(PORT, () => {
  console.log(`xmas game listening on ${PORT}`);
});
