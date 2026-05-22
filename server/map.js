/** Manhattan-style tile map */
export const TILE = {
  STREET: 0,
  BUILDING: 1,
  PARK: 2,
  WATER: 3,
  STAND: 4,
  PLAZA: 5,
  BRIDGE: 6,
  SIDEWALK: 7,
};
export const TILE_SIZE = 16;
export const MAP_W = 112;
export const MAP_H = 144;

const AVENUES = [10, 22, 34, 46, 58, 70, 82, 94];
const STREETS_EVERY = 5;

function makeBaseMap() {
  const m = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(TILE.BUILDING));

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < 7; x++) m[y][x] = TILE.WATER;
    for (let x = MAP_W - 5; x < MAP_W; x++) m[y][x] = TILE.WATER;
  }

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 7; x < MAP_W - 5; x++) {
      if (m[y][x] === TILE.WATER) continue;
      m[y][x] = TILE.SIDEWALK;
    }
  }

  for (const ax of AVENUES) {
    for (let y = 0; y < MAP_H; y++) {
      for (let dx = 0; dx < 2; dx++) {
        if (ax + dx < MAP_W - 5) m[y][ax + dx] = TILE.STREET;
      }
    }
  }

  for (let y = 0; y < MAP_H; y += STREETS_EVERY) {
    for (let x = 7; x < MAP_W - 5; x++) m[y][x] = TILE.STREET;
  }

  // Central Park
  carveRect(m, 44, 32, 28, 22, TILE.PARK);
  // Washington Square
  carveRect(m, 32, 88, 14, 12, TILE.PARK);
  // Times Square plaza
  carveRect(m, 52, 48, 10, 8, TILE.PLAZA);
  // Columbus Circle
  carveRect(m, 38, 28, 12, 10, TILE.PLAZA);
  // Hudson River Park
  carveRect(m, 7, 24, 4, 96, TILE.PARK);
  // Brooklyn Bridge approach
  carveRect(m, 88, 108, 14, 6, TILE.BRIDGE);

  return m;
}

function carveRect(m, x, y, w, h, tile) {
  for (let ty = y; ty < y + h && ty < MAP_H; ty++) {
    for (let tx = x; tx < x + w && tx < MAP_W; tx++) {
      if (m[ty][tx] !== TILE.WATER) m[ty][tx] = tile;
    }
  }
}

export const MAP = makeBaseMap();

export const LANDMARKS = [
  { id: 'central_park', name: 'Central Park', tileX: 52, tileY: 40 },
  { id: 'times_sq', name: 'Times Square', tileX: 56, tileY: 52 },
  { id: 'wash_sq', name: 'Washington Square', tileX: 38, tileY: 94 },
  { id: 'columbus', name: 'Columbus Circle', tileX: 44, tileY: 32 },
  { id: 'hudson', name: 'Hudson River Park', tileX: 8, tileY: 70 },
  { id: 'brooklyn', name: 'Brooklyn Bridge', tileX: 94, tileY: 110 },
];

export const STREET_LABELS = [
  { text: '8th Ave', tileX: 10, tileY: 100, vertical: true },
  { text: 'Broadway', tileX: 46, tileY: 55, vertical: true },
  { text: 'Jane St', tileX: 12, tileY: 102, vertical: false },
  { text: '42nd St', tileX: 48, tileY: 50, vertical: false },
  { text: '14th St', tileX: 40, tileY: 72, vertical: false },
  { text: 'Houston St', tileX: 36, tileY: 90, vertical: false },
  { text: '59th St', tileX: 42, tileY: 30, vertical: false },
];

export const STANDS = [
  {
    id: 'romp',
    name: 'Romp Family Christmas Trees',
    shortName: 'Romp Family',
    corner: 'Jane St & 8th Ave',
    tileX: 12,
    tileY: 104,
    boss: true,
    unlockSeasons: 3,
    rent: 45,
    traffic: 1.2,
  },
  {
    id: 'times',
    name: 'Times Square Tree Depot',
    shortName: 'Times Sq',
    corner: '7th Ave & W 45th',
    tileX: 54,
    tileY: 52,
    boss: false,
    unlockSeasons: 0,
    rent: 35,
    traffic: 1.5,
  },
  {
    id: 'union',
    name: 'Union Square Greens',
    shortName: 'Union Sq',
    corner: 'Union Square W',
    tileX: 46,
    tileY: 74,
    boss: false,
    unlockSeasons: 0,
    rent: 28,
    traffic: 1.3,
  },
  {
    id: 'columbus',
    name: 'Columbus Circle Pines',
    shortName: 'Columbus',
    corner: 'Broadway & W 59th',
    tileX: 42,
    tileY: 30,
    boss: false,
    unlockSeasons: 0,
    rent: 32,
    traffic: 1.1,
  },
  {
    id: 'brooklyn',
    name: 'Brooklyn Bridge Lots',
    shortName: 'Bk Bridge',
    corner: 'Pearl & Frankfort',
    tileX: 90,
    tileY: 106,
    boss: false,
    unlockSeasons: 1,
    rent: 22,
    traffic: 1.0,
  },
  {
    id: 'grand',
    name: 'Grand Central Spruces',
    shortName: 'Grand Central',
    corner: 'Lexington & E 42nd',
    tileX: 60,
    tileY: 48,
    boss: false,
    unlockSeasons: 0,
    rent: 38,
    traffic: 1.4,
  },
  {
    id: 'washington',
    name: 'Washington Square Firs',
    shortName: 'Wash Sq',
    corner: 'Washington Sq Park',
    tileX: 34,
    tileY: 90,
    boss: false,
    unlockSeasons: 0,
    rent: 25,
    traffic: 1.25,
  },
];

for (const s of STANDS) {
  for (let dy = 0; dy < 3; dy++) {
    for (let dx = 0; dx < 4; dx++) {
      MAP[s.tileY + dy][s.tileX + dx] = TILE.STAND;
    }
  }
}

export function isWalkable(tile) {
  return (
    tile === TILE.STREET ||
    tile === TILE.PARK ||
    tile === TILE.STAND ||
    tile === TILE.PLAZA ||
    tile === TILE.BRIDGE ||
    tile === TILE.SIDEWALK
  );
}

export function tileAt(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return TILE.BUILDING;
  return MAP[ty][tx];
}

export function worldToTile(wx, wy) {
  return { x: Math.floor(wx / TILE_SIZE), y: Math.floor(wy / TILE_SIZE) };
}

export function tileToWorld(tx, ty) {
  return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
}

export function getStand(id) {
  return STANDS.find((s) => s.id === id);
}

export function standCenterWorld(stand) {
  return tileToWorld(stand.tileX + 2, stand.tileY + 2);
}

export function standSpawnWorld(standId) {
  const s = getStand(standId) || STANDS[1];
  return tileToWorld(s.tileX + 2, s.tileY + 3);
}

export function findStandNear(wx, wy, radiusTiles = 5) {
  let best = null;
  let bestD = Infinity;
  for (const s of STANDS) {
    const c = standCenterWorld(s);
    const d = Math.hypot(wx - c.x, wy - c.y);
    if (d < radiusTiles * TILE_SIZE && d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

export function assignStartStand(profile) {
  const good = profile.seasonsGood || 0;
  if (good >= 3 && profile.rompUnlocked) return 'romp';
  const pool = STANDS.filter((s) => !s.boss && good >= s.unlockSeasons);
  const idx = [...profile.username].reduce((a, c) => a + c.charCodeAt(0), 0) % pool.length;
  return pool[idx].id;
}

export function mapPayload() {
  return {
    w: MAP_W,
    h: MAP_H,
    tile: TILE_SIZE,
    tiles: MAP,
    landmarks: LANDMARKS,
    labels: STREET_LABELS,
  };
}
