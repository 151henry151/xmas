import { getStand } from './map.js';

export const TREE_TYPES = [
  { id: 'balsam', name: 'Balsam', cost: 18, tag: 'budget' },
  { id: 'douglas', name: 'Douglas Fir', cost: 24, tag: 'family' },
  { id: 'fraser', name: 'Fraser Fir', cost: 38, tag: 'premium' },
  { id: 'spruce', name: 'Blue Spruce', cost: 32, tag: 'classic' },
  { id: 'noble', name: 'Noble Fir', cost: 45, tag: 'premium' },
];

export const UPGRADES = [
  { id: 'heater', name: 'Propane Heater', cost: 90, desc: 'Customers linger (+1 persuasion).' },
  { id: 'sign', name: 'Neon OPEN Sign', cost: 140, desc: '+1 sale bonus permanently.' },
  { id: 'lights', name: 'String Lights', cost: 200, desc: '+15% sale price.' },
  { id: 'cocoa', name: 'Cider Stand', cost: 60, desc: 'One free patience boost per season.' },
];

export const RESTOCK_BUNDLE = { trees: 10, cost: 175 };

export const DAY_PHASES = [
  { id: 'morning', label: 'Morning', priceMult: 0.95, spawn: 1 },
  { id: 'lunch', label: 'Lunch Rush', priceMult: 1.1, spawn: 1.4 },
  { id: 'evening', label: 'Evening', priceMult: 1.05, spawn: 1.2 },
  { id: 'night', label: 'Late Night', priceMult: 1.2, spawn: 0.7 },
];

let globalPhaseIndex = 0;
let phaseEndsAt = Date.now() + 90_000;

export function tickDayPhase() {
  if (Date.now() < phaseEndsAt) return DAY_PHASES[globalPhaseIndex];
  globalPhaseIndex = (globalPhaseIndex + 1) % DAY_PHASES.length;
  phaseEndsAt = Date.now() + 90_000;
  return DAY_PHASES[globalPhaseIndex];
}

export function getDayPhase() {
  return tickDayPhase();
}

export function normalizeProfile(user) {
  if (user.stock == null) user.stock = { balsam: 4, douglas: 3, fraser: 1, spruce: 2, noble: 0 };
  if (!user.upgrades) user.upgrades = {};
  if (user.day == null) user.day = 1;
  if (user.rentDue == null) user.rentDue = false;
  if (user.cocoaUsed == null) user.cocoaUsed = false;
  if (user.tutorialStep == null) user.tutorialStep = 0;
  if (user.totalEarnings == null) user.totalEarnings = 0;
  if (!user.unlockedStands) user.unlockedStands = ['times', 'union', 'grand', 'washington', 'columbus'];
  return user;
}

export function totalStock(stock) {
  return Object.values(stock || {}).reduce((a, n) => a + (n || 0), 0);
}

export function sellerBonus(user) {
  const sellers = { rookie: 0, hustler: 1, charmer: 1, expert: 2 };
  let b = sellers[user.sellerId] || 0;
  if (user.upgrades?.sign) b += 1;
  if (user.upgrades?.heater) b += 1;
  return b;
}

export function priceMultiplier(user, stand) {
  let m = 1;
  const phase = getDayPhase();
  m *= phase.priceMult;
  m *= stand?.traffic || 1;
  if (user.upgrades?.lights) m *= 1.15;
  m += Math.min(0.25, (user.reputation || 0) * 0.02);
  return m;
}

export function restock(user) {
  normalizeProfile(user);
  if ((user.cash || 0) < RESTOCK_BUNDLE.cost) return { error: 'Not enough cash ($175 needed)' };
  user.cash -= RESTOCK_BUNDLE.cost;
  user.stock.balsam = (user.stock.balsam || 0) + 4;
  user.stock.douglas = (user.stock.douglas || 0) + 3;
  user.stock.fraser = (user.stock.fraser || 0) + 2;
  user.stock.spruce = (user.stock.spruce || 0) + 1;
  return { ok: true };
}

export function buyUpgrade(user, upgradeId) {
  normalizeProfile(user);
  const up = UPGRADES.find((u) => u.id === upgradeId);
  if (!up) return { error: 'Unknown upgrade' };
  if (user.upgrades[upgradeId]) return { error: 'Already owned' };
  if ((user.cash || 0) < up.cost) return { error: `Need $${up.cost}` };
  user.cash -= up.cost;
  user.upgrades[upgradeId] = true;
  return { ok: true };
}

export function payRent(user) {
  normalizeProfile(user);
  const stand = getStand(user.standId);
  const rent = stand?.rent || 30;
  if ((user.cash || 0) < rent) return { error: `Rent is $${rent} — earn more sales first` };
  user.cash -= rent;
  user.rentDue = false;
  user.day = (user.day || 1) + 1;
  return { ok: true, rent };
}

export function consumeTree(user, treeId) {
  normalizeProfile(user);
  if (!user.stock[treeId] || user.stock[treeId] <= 0) return false;
  user.stock[treeId] -= 1;
  return true;
}

export function pickTreeForSale(user, customer) {
  normalizeProfile(user);
  const pref = customer.prefer || 'family';
  const order = {
    budget: ['balsam', 'douglas', 'spruce', 'fraser', 'noble'],
    premium: ['noble', 'fraser', 'spruce', 'douglas', 'balsam'],
    family: ['douglas', 'spruce', 'balsam', 'fraser', 'noble'],
    classic: ['spruce', 'douglas', 'fraser', 'balsam', 'noble'],
  }[pref] || ['douglas', 'balsam', 'spruce'];
  for (const id of order) {
    if ((user.stock[id] || 0) > 0) return TREE_TYPES.find((t) => t.id === id);
  }
  for (const t of TREE_TYPES) {
    if ((user.stock[t.id] || 0) > 0) return t;
  }
  return null;
}
