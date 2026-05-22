export function apiBase() {
  const p = window.location.pathname;
  if (p.startsWith('/xmas')) return '/xmas';
  return '';
}

export function socketPath() {
  const p = window.location.pathname;
  if (p.startsWith('/xmas')) return '/xmas/socket.io';
  return '/socket.io';
}

export async function apiRegister(username, password, sellerId) {
  const res = await fetch(`${apiBase()}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, sellerId }),
  });
  return res.json();
}

export async function apiLogin(username, password) {
  const res = await fetch(`${apiBase()}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function apiMeta() {
  const res = await fetch(`${apiBase()}/api/meta`);
  return res.json();
}

export function connectSocket(token) {
  const ioFn = window.io;
  if (!ioFn) throw new Error('Socket.IO not loaded');
  return ioFn({
    path: socketPath(),
    transports: ['websocket', 'polling'],
    auth: { token },
  });
}
