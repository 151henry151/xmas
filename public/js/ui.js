export function showToast(text, ms = 3500) {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.add('hidden'), ms);
}

export function updateHud(profile) {
  document.getElementById('hud-user').textContent = profile.username;
  document.getElementById('hud-cash').textContent = `$${profile.cash ?? 0}`;
  document.getElementById('hud-sales').textContent = `Season sales: ${profile.seasonSales ?? 0} (need 5 for good)`;
  document.getElementById('hud-good').textContent = `Good seasons: ${profile.seasonsGood ?? 0} / 3 → Romp Family`;
  const standLabel = profile.standId || '—';
  document.getElementById('hud-stand').textContent = `Stand: ${standLabel}`;
}

export function openDialog(name, text, choices, onPick) {
  const dlg = document.getElementById('dialog');
  document.getElementById('dialog-name').textContent = name;
  document.getElementById('dialog-text').textContent = text;
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
