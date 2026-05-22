import http from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { verifyToken, login, register, publicProfile, endSeason } from './auth.js';
import { upsertUser, getUser } from './store.js';
import { MAP, MAP_W, MAP_H, TILE_SIZE, STANDS, standSpawnWorld, getStand, isWalkable, tileAt } from './map.js';
import { SELLERS, pickVendor } from './characters.js';
import { startSaleBattle, startVendorBattle, getCurrentRound, applyChoice } from './battles.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3334;
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true } });

app.use(express.json({ limit: '32kb' }));
app.use(express.static(join(__dirname, '../public')));

/** @type {Map<string, { socketId: string, x: number, y: number, username: string, standId: string, sellerId: string, battle: object|null, facing: string }>} */
const online = new Map();

function broadcastWorld() {
  const players = [...online.values()].map((p) => ({
    username: p.username,
    x: p.x,
    y: p.y,
    standId: p.standId,
    sellerId: p.sellerId,
    facing: p.facing,
    inBattle: !!p.battle,
  }));
  io.emit('world', { players, stands: STANDS, mapSize: { w: MAP_W, h: MAP_H, tile: TILE_SIZE } });
}

function spawnForUser(user) {
  const pos = standSpawnWorld(user.standId);
  return { x: pos.x, y: pos.y, facing: 'down' };
}

app.post('/api/register', (req, res) => {
  const { username, password, sellerId } = req.body || {};
  const out = register(username, password, sellerId);
  if (out.error) return res.status(400).json(out);
  res.json(out);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const out = login(username, password);
  if (out.error) return res.status(401).json(out);
  res.json(out);
});

app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ profile: publicProfile(user) });
});

app.get('/api/meta', (_req, res) => {
  res.json({ sellers: SELLERS, stands: STANDS });
});

io.on('connection', (socket) => {
  let me = null;

  socket.on('join', ({ token }) => {
    const user = verifyToken(token);
    if (!user) {
      socket.emit('error', { message: 'Login required' });
      return;
    }
    for (const [sid, p] of online) {
      if (p.username === user.username && sid !== socket.id) {
        online.delete(sid);
      }
    }
    const spawn = spawnForUser(user);
    me = {
      socketId: socket.id,
      username: user.username,
      standId: user.standId,
      sellerId: user.sellerId,
      x: spawn.x,
      y: spawn.y,
      facing: spawn.facing,
      battle: null,
    };
    online.set(socket.id, me);
    socket.emit('joined', {
      profile: publicProfile(user),
      you: { x: me.x, y: me.y, standId: me.standId },
      map: { w: MAP_W, h: MAP_H, tile: TILE_SIZE, tiles: MAP },
      stands: STANDS,
      sellers: SELLERS,
    });
    broadcastWorld();
  });

  socket.on('move', ({ dx, dy }) => {
    if (!me || me.battle) return;
    const speed = 3;
    let nx = me.x + dx * speed;
    let ny = me.y + dy * speed;
    const tx = nx / TILE_SIZE;
    const ty = ny / TILE_SIZE;
    if (!isWalkable(tileAt(tx, ty))) return;
    me.x = nx;
    me.y = ny;
    if (Math.abs(dx) > Math.abs(dy)) me.facing = dx > 0 ? 'right' : 'left';
    else if (dy !== 0) me.facing = dy > 0 ? 'down' : 'up';
    socket.emit('pos', { x: me.x, y: me.y, facing: me.facing });
    broadcastWorld();
  });

  socket.on('interact', () => {
    if (!me || me.battle) return;
    const user = getUser(me.username);
    const stand = STANDS.find((s) => {
      const wx = s.tileX * TILE_SIZE;
      const wy = s.tileY * TILE_SIZE;
      return Math.abs(me.x - wx) < TILE_SIZE * 3 && Math.abs(me.y - wy) < TILE_SIZE * 3;
    });
    if (!stand) {
      socket.emit('message', { text: 'Nothing to interact with here. Head to a tree stand (green lots).' });
      return;
    }
    if (stand.boss && !(user.rompUnlocked || (user.seasonsGood || 0) >= 3)) {
      socket.emit('message', {
        text: 'Romp Family Christmas Trees hires veterans only. Win 3 good seasons elsewhere first.',
      });
      return;
    }
    if (stand.id !== user.standId && !stand.boss) {
      const vendor = pickVendor(stand.id);
      me.battle = startVendorBattle(vendor);
      socket.emit('battleStart', { battle: serializeBattle(me.battle) });
      return;
    }
    const seller = SELLERS.find((s) => s.id === user.sellerId) || SELLERS[0];
    me.battle = startSaleBattle(stand, seller.bonus);
    socket.emit('battleStart', { battle: serializeBattle(me.battle) });
  });

  socket.on('battleChoice', ({ index }) => {
    if (!me?.battle) return;
    const result = applyChoice(me.battle, index);
    if (result.error) return;
    const payload = {
      reply: result.reply,
      phase: result.phase,
      battle: serializeBattle(me.battle),
    };
    if (result.phase === 'won' && me.battle.type === 'sale') {
      const user = getUser(me.username);
      user.cash = (user.cash || 0) + me.battle.earnings;
      user.treesSold = (user.treesSold || 0) + 1;
      user.seasonSales = (user.seasonSales || 0) + 1;
      user.reputation = (user.reputation || 0) + 1;
      upsertUser(user.username, user);
      payload.profile = publicProfile(user);
    }
    if (result.phase === 'won' || result.phase === 'lost') {
      me.battle = null;
    }
    socket.emit('battleUpdate', payload);
    broadcastWorld();
  });

  socket.on('endSeason', () => {
    if (!me) return;
    const user = getUser(me.username);
    const out = endSeason(user);
    me.standId = user.standId;
    const spawn = spawnForUser(user);
    me.x = spawn.x;
    me.y = spawn.y;
    socket.emit('seasonEnded', out);
    broadcastWorld();
  });

  socket.on('disconnect', () => {
    online.delete(socket.id);
    broadcastWorld();
  });
});

function serializeBattle(b) {
  const round = getCurrentRound(b);
  return {
    type: b.type,
    customer: b.customer,
    vendor: b.vendor,
    patience: b.patience,
    maxHp: b.maxHp,
    roundIndex: b.roundIndex,
    won: b.won,
    lost: b.lost,
    earnings: b.earnings,
    round,
  };
}

server.listen(PORT, () => {
  console.log(`xmas game listening on ${PORT}`);
});
