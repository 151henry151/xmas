import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getUser, upsertUser, defaultProfile } from './store.js';
import { assignStartStand } from './map.js';
import { normalizeProfile, totalStock, getDayPhase } from './economy.js';
import { TREE_TYPES, UPGRADES } from './economy.js';

const JWT_SECRET = process.env.XMAS_JWT_SECRET || 'xmas-dev-change-in-production';
const JWT_EXPIRY = '7d';

export function register(username, password, sellerId = 'rookie') {
  const key = username.trim().toLowerCase();
  if (!key || key.length < 2) return { error: 'Username too short' };
  if (!password || password.length < 4) return { error: 'Password too short' };
  if (getUser(key)) return { error: 'Username taken' };

  const hash = bcrypt.hashSync(password, 10);
  const profile = defaultProfile(key, sellerId);
  profile.standId = assignStartStand(profile);
  upsertUser(key, { passwordHash: hash, ...profile });
  const token = jwt.sign({ sub: key }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  return { token, profile: publicProfile(profile) };
}

export function login(username, password) {
  const key = username.trim().toLowerCase();
  const user = getUser(key);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { error: 'Invalid username or password' };
  }
  const token = jwt.sign({ sub: key }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  return { token, profile: publicProfile(user) };
}

export function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = getUser(payload.sub);
    if (!user) return null;
    return user;
  } catch {
    return null;
  }
}

export function publicProfile(user) {
  normalizeProfile(user);
  return {
    username: user.username,
    sellerId: user.sellerId,
    standId: user.standId,
    cash: user.cash,
    treesSold: user.treesSold,
    seasonSales: user.seasonSales,
    seasonsPlayed: user.seasonsPlayed,
    seasonsGood: user.seasonsGood,
    reputation: user.reputation,
    unlockedStands: user.unlockedStands || [],
    rompUnlocked: !!user.rompUnlocked,
    stock: user.stock,
    stockTotal: totalStock(user.stock),
    upgrades: user.upgrades,
    day: user.day,
    rentDue: user.rentDue,
    tutorialStep: user.tutorialStep,
    totalEarnings: user.totalEarnings,
    dayPhase: getDayPhase(),
  };
}

export function endSeason(user) {
  normalizeProfile(user);
  const sales = user.seasonSales || 0;
  const good = sales >= 5;
  user.seasonsPlayed = (user.seasonsPlayed || 0) + 1;
  if (good) user.seasonsGood = (user.seasonsGood || 0) + 1;
  if (user.seasonsGood >= 3) {
    user.rompUnlocked = true;
    if (!user.unlockedStands.includes('romp')) user.unlockedStands.push('romp');
    if (!user.unlockedStands.includes('brooklyn')) user.unlockedStands.push('brooklyn');
  }
  user.seasonSales = 0;
  user.cocoaUsed = false;
  user.rentDue = false;
  user.stock = { balsam: 5, douglas: 4, fraser: 2, spruce: 3, noble: 1 };
  user.standId = assignStartStand(user);
  upsertUser(user.username, user);
  return { good, profile: publicProfile(user) };
}

export function metaPayload() {
  return { treeTypes: TREE_TYPES, upgrades: UPGRADES };
}
