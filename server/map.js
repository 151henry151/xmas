/** Simplified Manhattan-style tile map (0=street, 1=building, 2=park, 3=water, 4=stand pad) */
export const TILE = { STREET: 0, BUILDING: 1, PARK: 2, WATER: 3, STAND: 4 };
export const TILE_SIZE = 20;
export const MAP_W = 96;
export const MAP_H = 128;

function makeBaseMap() {
  const m = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(TILE.BUILDING));
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < 6; x++) m[y][x] = TILE.WATER;
  }
  for (let y = 0; y < MAP_H; y += 4) {
    for (let x = 6; x < MAP_W; x++) m[y][x] = TILE.STREET;
  }
  for (let x = 6; x < MAP_W; x += 4) {
    for (let y = 0; y < MAP_H; y++) m[y][x] = TILE.STREET;
  }
  // Central Park block
  for (let y = 28; y < 52; y++) {
    for (let x = 38; x < 58; x++) m[y][x] = TILE.PARK;
  }
  // Washington Square
  for (let y = 72; y < 82; y++) {
    for (let x = 30; x < 42; x++) m[y][x] = TILE.PARK;
  }
  // Hudson River Park strip
  for (let y = 10; y < MAP_H - 8; y++) {
    for (let x = 6; x < 10; x++) if (m[y][x] !== TILE.WATER) m[y][x] = TILE.PARK;
  }
  return m;
}

export const MAP = makeBaseMap();

export function isWalkable(tile) {
  return tile === TILE.STREET || tile === TILE.PARK || tile === TILE.STAND;
}

export function tileAt(x, y) {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return TILE.BUILDING;
  return MAP[ty][tx];
}

export function worldToTile(wx, wy) {
  return { x: Math.floor(wx / TILE_SIZE), y: Math.floor(wy / TILE_SIZE) };
}

export function tileToWorld(tx, ty) {
  return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
}

/** Jane St & 8th Ave area — west village */
export const STANDS = [
  {
    id: 'romp',
    name: 'Romp Family Christmas Trees',
    corner: 'Jane St & 8th Ave',
    tileX: 14,
    tileY: 98,
    boss: true,
    unlockSeasons: 3,
  },
  {
    id: 'times',
    name: 'Times Square Tree Depot',
    corner: '7th Ave & W 45th St',
    tileX: 54,
    tileY: 42,
    boss: false,
    unlockSeasons: 0,
  },
  {
    id: 'union',
    name: 'Union Square Greens',
    corner: 'Union Square W',
    tileX: 46,
    tileY: 64,
    boss: false,
    unlockSeasons: 0,
  },
  {
    id: 'columbus',
    name: 'Columbus Circle Pines',
    corner: 'Broadway & W 59th St',
    tileX: 42,
    tileY: 26,
    boss: false,
    unlockSeasons: 0,
  },
  {
    id: 'brooklyn',
    name: 'Brooklyn Bridge Lots',
    corner: 'Pearl St & Frankfort St',
    tileX: 70,
    tileY: 88,
    boss: false,
    unlockSeasons: 1,
  },
  {
    id: 'grand',
    name: 'Grand Central Spruces',
    corner: 'Lexington & E 42nd St',
    tileX: 58,
    tileY: 38,
    boss: false,
    unlockSeasons: 0,
  },
  {
    id: 'washington',
    name: 'Washington Square Firs',
    corner: 'Washington Sq Park',
    tileX: 36,
    tileY: 76,
    boss: false,
    unlockSeasons: 0,
  },
];

for (const s of STANDS) {
  MAP[s.tileY][s.tileX] = TILE.STAND;
  MAP[s.tileY][s.tileX + 1] = TILE.STAND;
  MAP[s.tileY + 1][s.tileX] = TILE.STAND;
}

export function getStand(id) {
  return STANDS.find((s) => s.id === id);
}

export function standSpawnWorld(standId) {
  const s = getStand(standId) || STANDS[1];
  return tileToWorld(s.tileX + 1, s.tileY + 1);
}

export function assignStartStand(profile) {
  const good = profile.seasonsGood || 0;
  if (good >= 3) return 'romp';
  const pool = STANDS.filter((s) => !s.boss && good >= s.unlockSeasons);
  const idx = [...profile.username].reduce((a, c) => a + c.charCodeAt(0), 0) % pool.length;
  return pool[idx].id;
}
