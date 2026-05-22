import { MAP_W, MAP_H, TILE_SIZE, TILE, tileAt, isWalkable } from './map.js';

const WALKERS = [
  { sprite: 'couple', label: 'Couple' },
  { sprite: 'student', label: 'Student' },
  { sprite: 'worker', label: 'Office worker' },
  { sprite: 'tourist', label: 'Tourist' },
  { sprite: 'dog', label: 'Dog walker' },
];

/** @type {Array<{ id: string, x: number, y: number, facing: string, sprite: string, label: string }>} */
let walkers = [];

function randWalkable() {
  for (let i = 0; i < 40; i++) {
    const tx = 8 + Math.floor(Math.random() * (MAP_W - 16));
    const ty = 8 + Math.floor(Math.random() * (MAP_H - 16));
    if (isWalkable(tileAt(tx, ty))) {
      return { x: tx * TILE_SIZE + TILE_SIZE / 2, y: ty * TILE_SIZE + TILE_SIZE / 2 };
    }
  }
  return { x: 200, y: 200 };
}

export function initNpcs(count = 18) {
  walkers = [];
  for (let i = 0; i < count; i++) {
    const w = WALKERS[i % WALKERS.length];
    const pos = randWalkable();
    walkers.push({
      id: `npc_${i}`,
      x: pos.x,
      y: pos.y,
      facing: 'down',
      sprite: w.sprite,
      label: w.label,
    });
  }
}

export function tickNpcs() {
  for (const n of walkers) {
    if (Math.random() > 0.65) continue;
    const dirs = [
      { dx: 0, dy: -1, f: 'up' },
      { dx: 0, dy: 1, f: 'down' },
      { dx: -1, dy: 0, f: 'left' },
      { dx: 1, dy: 0, f: 'right' },
    ];
    const d = dirs[Math.floor(Math.random() * dirs.length)];
    const nx = n.x + d.dx * TILE_SIZE * 0.5;
    const ny = n.y + d.dy * TILE_SIZE * 0.5;
    const tx = Math.floor(nx / TILE_SIZE);
    const ty = Math.floor(ny / TILE_SIZE);
    if (isWalkable(tileAt(tx, ty))) {
      n.x = nx;
      n.y = ny;
      n.facing = d.f;
    }
  }
  return walkers;
}

export function getNpcs() {
  return walkers;
}

initNpcs();
