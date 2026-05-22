import { apiLogin, apiRegister, apiMeta, connectSocket } from './network.js';
import { GameRenderer } from './game.js';
import { updateHud, openDialog, closeDialog, showDialogReply, showToast } from './ui.js';

const TOKEN_KEY = 'xmas_token';
let profile = null;
let socket = null;
let game = null;
let authTab = 'login';

async function initAuth() {
  const meta = await apiMeta();
  const sel = document.querySelector('#auth-form select[name="sellerId"]');
  sel.innerHTML = meta.sellers.map((s) => `<option value="${s.id}">${s.name} — ${s.desc}</option>`).join('');
}

document.querySelectorAll('#auth-tabs button').forEach((btn) => {
  btn.addEventListener('click', () => {
    authTab = btn.dataset.tab;
    document.querySelectorAll('#auth-tabs button').forEach((b) => b.classList.toggle('active', b === btn));
    document.getElementById('seller-pick').classList.toggle('hidden', authTab !== 'register');
  });
});

document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const username = fd.get('username');
  const password = fd.get('password');
  const errEl = document.getElementById('auth-error');
  errEl.classList.add('hidden');
  const out =
    authTab === 'register'
      ? await apiRegister(username, password, fd.get('sellerId'))
      : await apiLogin(username, password);
  if (out.error) {
    errEl.textContent = out.error;
    errEl.classList.remove('hidden');
    return;
  }
  localStorage.setItem(TOKEN_KEY, out.token);
  startGame(out.token, out.profile);
});

document.getElementById('btn-end-season').addEventListener('click', () => {
  if (socket) socket.emit('endSeason');
});

function startGame(token, prof) {
  profile = prof;
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  updateHud(profile);

  const canvas = document.getElementById('game');
  game = new GameRenderer(canvas);
  game.you.username = profile.username;
  game.you.standId = profile.standId;
  game.onInteract = () => socket?.emit('interact');

  socket = connectSocket(token);
  socket.on('connect', () => socket.emit('join', { token }));
  socket.on('error', (e) => showToast(e.message || 'Error'));
  socket.on('joined', (data) => {
    profile = data.profile;
    updateHud(profile);
    game.setWorld({
      map: data.map.tiles,
      tile: data.map.tile,
      stands: data.stands,
      you: { ...data.you, username: profile.username, standId: profile.standId },
    });
    game.startLoop(socket);
  });
  socket.on('pos', (p) => game.setYou(p));
  socket.on('world', (w) => {
    document.getElementById('player-count').textContent = String(w.players.length);
    game.setOthers(w.players);
  });
  socket.on('message', (m) => showToast(m.text));
  socket.on('battleStart', (p) => showBattle(p.battle));
  socket.on('battleUpdate', (p) => handleBattleUpdate(p));
  socket.on('seasonEnded', (p) => {
    profile = p.profile;
    updateHud(profile);
    showToast(
      p.good
        ? 'Good season! One step closer to Romp Family Christmas Trees.'
        : 'Season ended. Sell more trees next time (5+ for a good season).'
    );
  });
}

function battleName(b) {
  if (b.type === 'vendor') return b.vendor?.name || 'Vendor';
  return b.customer?.name || 'Customer';
}

function showBattle(b) {
  const round = b.round;
  if (!round) return;
  const opening =
    b.type === 'sale' && b.roundIndex === 0
      ? `${b.customer.opening}\n\n${round.text}`
      : round.text;
  openDialog(battleName(b), opening, round.choices, (i) => {
    socket.emit('battleChoice', { index: i });
  });
  const patience = `Patience: ${'♥'.repeat(b.patience)}${'♡'.repeat(Math.max(0, b.maxHp - b.patience))}`;
  document.getElementById('dialog-text').textContent = `${opening}\n\n${patience}`;
}

function handleBattleUpdate(p) {
  if (p.profile) {
    profile = p.profile;
    updateHud(profile);
  }
  if (p.phase === 'won') {
    showDialogReply(
      battleName(p.battle),
      p.reply + (p.battle.earnings ? ` Sold! +$${p.battle.earnings}` : ' You win the exchange!'),
      () => closeDialog()
    );
    if (p.battle.earnings) showToast(`Tree sold! +$${p.battle.earnings}`);
  } else if (p.phase === 'lost') {
    showDialogReply(battleName(p.battle), p.reply + ' They walk away.', () => closeDialog());
  } else if (p.phase === 'continue') {
    showDialogReply(battleName(p.battle), p.reply, () => {
      showBattle(p.battle);
    });
  }
}

(async () => {
  await initAuth();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      const res = await fetch(`${window.location.pathname.startsWith('/xmas') ? '/xmas' : ''}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        startGame(token, data.profile);
        return;
      }
    } catch {
      /* login fresh */
    }
    localStorage.removeItem(TOKEN_KEY);
  }
})();
