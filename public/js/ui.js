export function showToast(text, ms = 3500) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.add('hidden'), ms);
}

export function appendChat(entry) {
  const log = document.getElementById('chat-log');
  if (!log) return;
  const line = document.createElement('div');
  line.className = 'chat-line';
  line.innerHTML = `<strong>${escapeHtml(entry.user)}</strong> ${escapeHtml(entry.text)}`;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
  while (log.children.length > 30) log.removeChild(log.firstChild);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function updateHud(profile, meta = {}) {
  document.getElementById('hud-user').textContent = profile.username;
  document.getElementById('hud-cash').textContent = `$${profile.cash ?? 0}`;
  document.getElementById('hud-sales').textContent = `Season: ${profile.seasonSales ?? 0}/5+ · Rep ${profile.reputation ?? 0}`;
  document.getElementById('hud-good').textContent = `Good seasons ${profile.seasonsGood ?? 0}/3 → Romp Family`;
  const stand = (meta.stands || []).find((s) => s.id === profile.standId);
  document.getElementById('hud-stand').textContent = stand ? `${stand.shortName || stand.name}` : profile.standId;
  document.getElementById('hud-stock').textContent = formatStock(profile.stock);
  document.getElementById('hud-day').textContent = `Day ${profile.day ?? 1}${profile.rentDue ? ' · RENT DUE' : ''}`;
  if (profile.dayPhase) {
    document.getElementById('hud-phase').textContent = profile.dayPhase.label || profile.dayPhase.id;
  }
  renderUpgrades(profile, meta.upgrades || []);
  renderTutorial(profile);
}

function formatStock(stock) {
  if (!stock) return 'Stock: 0';
  const parts = Object.entries(stock)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${k.slice(0, 1).toUpperCase()}${k.slice(1, 4)}:${n}`);
  return parts.length ? `Stock: ${parts.join(' ')}` : 'Stock: empty — restock!';
}

function renderUpgrades(profile, catalog) {
  const el = document.getElementById('upgrade-list');
  if (!el) return;
  el.innerHTML = '';
  for (const u of catalog) {
    const owned = profile.upgrades?.[u.id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'upgrade-btn' + (owned ? ' owned' : '');
    btn.disabled = !!owned;
    btn.textContent = owned ? `✓ ${u.name}` : `${u.name} ($${u.cost})`;
    btn.title = u.desc;
    btn.dataset.id = u.id;
    el.appendChild(btn);
  }
}

const TUTORIAL = [
  'Welcome! You work a NYC tree lot. Walk with WASD.',
  'Go to your stand (gold outline) and press E to sell.',
  'Pick dialog choices to lower customer skepticism to zero.',
  'Restock ($175) when inventory runs low. Pay rent when due.',
  'End season after 5+ sales for a good season. Three goods unlock Romp Family on Jane St.',
];

function renderTutorial(profile) {
  const box = document.getElementById('tutorial-box');
  if (!box) return;
  const step = profile.tutorialStep ?? 0;
  if (step >= TUTORIAL.length) {
    box.classList.add('hidden');
    return;
  }
  box.classList.remove('hidden');
  document.getElementById('tutorial-text').textContent = TUTORIAL[step];
}

export function openDialog(name, text, choices, onPick, extra = '') {
  const dlg = document.getElementById('dialog');
  document.getElementById('dialog-name').textContent = name;
  document.getElementById('dialog-text').textContent = text + (extra ? `\n\n${extra}` : '');
  const box = document.getElementById('dialog-choices');
  box.innerHTML = '';
  document.getElementById('dialog-close').classList.add('hidden');
  if (choices?.length) {
    choices.forEach((c, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = c.label;
      btn.addEventListener('click', () => onPick(i));
      box.appendChild(btn);
    });
  }
  dlg.classList.remove('hidden');
}

export function closeDialog() {
  document.getElementById('dialog').classList.add('hidden');
}

export function showDialogReply(name, reply, onClose) {
  openDialog(name, reply, []);
  const close = document.getElementById('dialog-close');
  close.classList.remove('hidden');
  close.onclick = () => {
    closeDialog();
    onClose?.();
  };
}

export function resistanceBar(battle) {
  const pct = Math.round((battle.resistance / battle.maxResistance) * 100);
  const filled = Math.round((1 - battle.resistance / battle.maxResistance) * 10);
  return `Skepticism ${pct}% ${'█'.repeat(filled)}${'░'.repeat(10 - filled)}`;
}
