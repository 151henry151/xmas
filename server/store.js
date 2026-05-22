import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../data');
const USERS_FILE = join(DATA_DIR, 'users.json');

function ensureData() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(USERS_FILE)) writeFileSync(USERS_FILE, '{}', 'utf8');
}

export function loadUsers() {
  ensureData();
  try {
    return JSON.parse(readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export function saveUsers(users) {
  ensureData();
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

export function getUser(username) {
  const users = loadUsers();
  return users[username.toLowerCase()] || null;
}

export function upsertUser(username, data) {
  const users = loadUsers();
  const key = username.toLowerCase();
  users[key] = { ...users[key], ...data, username: key };
  saveUsers(users);
  return users[key];
}

export function defaultProfile(username, sellerId = 'rookie') {
  return {
    username: username.toLowerCase(),
    sellerId,
    standId: null,
    cash: 50,
    treesSold: 0,
    seasonSales: 0,
    seasonsPlayed: 0,
    seasonsGood: 0,
    reputation: 0,
    unlockedStands: ['times', 'union', 'grand', 'washington'],
    rompUnlocked: false,
  };
}
