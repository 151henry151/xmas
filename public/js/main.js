import { apiLogin, apiRegister, apiMeta, connectSocket } from './network.js';
import { GameRenderer } from './game.js';
import {
  updateHud,
  openDialog,
  closeDialog,
  showDialogReply,
  showToast,
  appendChat,
  resistanceBar,
} from './ui.js';

const TOKEN_KEY = 'xmas_token';
let profile = null;
let meta = { stands: [], upgrades: [] };
let socket = null;
let game = null;
let authTab = 'login';

async function initAuth() {
  meta = await apiMeta();
  const sel = document.querySelector('#auth-form select[name="sellerId"]');
  sel.innerHTML = meta.sellers
    .map((s) => `<option value="${s.id}">${s.name} — ${s.desc}</option>`)
    .join('');
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
  const errEl = document.getElementById('auth-error');
  errEl.classList.add('hidden');
  const out =
    authTab === 'register'
      ? await apiRegister(fd.get('username'), fd.get('password'), fd.get('sellerId'))
      : await apiLogin(fd.get('username'), fd.get('password'));
  if (out.error) {
    errEl.textContent = out.error;
    errEl.classList.remove('hidden');
    return;
  }
  localStorage.setItem(TOKEN_KEY, out.token);
  startGame(out.token, out.profile);
});

document.getElementById('btn-end-season').addEventListener('click', () => {
  if (confirm('End this season? You need 5+ sales for a good season.')) socket?.emit('endSeason');
});
document.getElementById('btn-restock').addEventListener('click', () => socket?.emit('restock'));
document.getElementById('btn-rent').addEventListener('click', () => socket?.emit('payRent'));
document.getElementById('btn-tutorial').addEventListener('click', () => socket?.emit('tutorialAdvance'));

document.getElementById('upgrade-list')?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-id]');
  if (btn && !btn.disabled) socket?.emit('buyUpgrade', { id: btn.dataset.id });
});

document.getElementById('chat-send')?.addEventListener('click', sendChat);
document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendChat();
});

function sendChat() {
  const input = document.getElementById('chat-input');
  const text = input?.value?.trim();
  if (!text || !socket) return;
  socket.emit('chat', { text });
  input.value = '';
}

function startGame(token, prof) {
  profile = prof;
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  updateHud(profile, meta);

  const canvas = document.getElementById('game');
  game = new GameRenderer(canvas);
  game.you.username = profile.username;
  game.you.standId = profile.standId;
  game.you.sellerId = profile.sellerId;
  game.onInteract = () => socket?.emit('interact');
  game.onChat = () => document.getElementById('chat-input')?.focus();

  socket = connectSocket(token);
  socket.on('connect', () => socket.emit('join', { token }));
  socket.on('error', (e) => showToast(e.message || 'Error'));
  socket.on('joined', (data) => {
    meta = { stands: data.stands, upgrades: data.upgrades };
    profile = data.profile;
    updateHud(profile, meta);
    game.setWorld({
      map: data.map.tiles,
      tile: data.map.tile,
      stands: data.stands,
      labels: data.map.labels,
      landmarks: data.map.landmarks,
      you: { ...data.you, username: profile.username, standId: profile.standId, sellerId: profile.sellerId },
    });
    (data.chat || []).forEach(appendChat);
    game.startLoop(socket);
  });
  socket.on('profile', (p) => {
    profile = p.profile;
    updateHud(profile, meta);
  });
  socket.on('pos', (p) => game.setYou(p));
  socket.on('world', (w) => {
    document.getElementById('player-count').textContent = String(w.players.length);
    game.setOthers(w.players);
    game.setNpcs(w.npcs);
    if (w.dayPhase) {
      profile = { ...profile, dayPhase: w.dayPhase };
      document.getElementById('hud-phase').textContent = w.dayPhase.label;
    }
  });
  socket.on('chat', (entry) => appendChat(entry));
  socket.on('message', (m) => showToast(m.text));
  socket.on('battleStart', (p) => showBattle(p.battle));
  socket.on('battleUpdate', (p) => handleBattleUpdate(p));
  socket.on('seasonEnded', (p) => {
    profile = p.profile;
    updateHud(profile, meta);
    const msg = p.good
      ? `Good season! (${profile.seasonsGood}/3 toward Romp Family)`
      : 'Season ended — aim for 5+ sales next time.';
    showToast(msg);
    if (p.profile.rentDue) showToast('Rent is due before your next sales push.');
  });
}

function battleName(b) {
  if (b.type === 'vendor') return b.vendor?.name || 'Vendor';
  return b.customer?.name || 'Customer';
}

function showBattle(b) {
  const round = b.round;
  if (!round) return;
  let text = round.text;
  if (b.type === 'sale' && b.roundIndex === 0) {
    text = `${b.customer.opening}\n\n${round.text}`;
    if (b.tree) text += `\n\n[Showing: ${b.tree.name} — target ~$${b.basePrice}]`;
  }
  const extra = resistanceBar(b);
  openDialog(battleName(b), text, round.choices, (i) => socket.emit('battleChoice', { index: i }), extra);
}

function handleBattleUpdate(p) {
  if (p.profile) {
    profile = p.profile;
    updateHud(profile, meta);
    if (profile.tutorialStep === 2) socket?.emit('tutorialAdvance');
  }
  const hint = p.delta > 0 ? ' (good pitch!)' : p.delta < 0 ? ' (backfired)' : '';
  if (p.phase === 'won') {
    const earn = p.battle.earnings ? ` Sold! +$${p.battle.earnings}` : ' Respect earned.';
    showDialogReply(battleName(p.battle), p.reply + earn + hint, () => closeDialog());
    if (p.battle.earnings) showToast(`+$${p.battle.earnings} · ${profile.seasonSales} season sales`);
  } else if (p.phase === 'lost') {
    showDialogReply(battleName(p.battle), p.reply + ' They walk away.' + hint, () => closeDialog());
  } else if (p.phase === 'continue') {
    showDialogReply(battleName(p.battle), p.reply + hint, () => showBattle(p.battle));
  }
}

(async () => {
  await initAuth();
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      const base = window.location.pathname.startsWith('/xmas') ? '/xmas' : '';
      const res = await fetch(`${base}/api/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        meta = await apiMeta();
        startGame(token, data.profile);
        return;
      }
    } catch {
      /* fresh login */
    }
    localStorage.removeItem(TOKEN_KEY);
  }
})();
