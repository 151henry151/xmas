const TILE_COLORS = {
  0: '#4a5568',
  1: '#2d3748',
  2: '#276749',
  3: '#2c5282',
  4: '#22543d',
};

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.map = null;
    this.tileSize = 20;
    this.stands = [];
    this.you = { x: 0, y: 0, facing: 'down' };
    this.others = [];
    this.keys = {};
    this.moveSent = 0;
    this.onMove = null;
    this.onInteract = null;
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
  }

  onKey(e, down) {
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e'].includes(k)) {
      e.preventDefault();
    }
    if (k === 'e' && down && this.onInteract) {
      this.onInteract();
      return;
    }
    this.keys[k] = down;
  }

  setWorld({ map, tile, stands, you }) {
    this.map = map;
    this.tileSize = tile;
    this.stands = stands || [];
    if (you) this.you = { ...this.you, ...you };
  }

  setYou(pos) {
    this.you = { ...this.you, ...pos };
  }

  setOthers(players) {
    this.others = players.filter((p) => p.username !== this.you.username);
  }

  tick(socket) {
    let dx = 0;
    let dy = 0;
    if (this.keys.w || this.keys.arrowup) dy -= 1;
    if (this.keys.s || this.keys.arrowdown) dy += 1;
    if (this.keys.a || this.keys.arrowleft) dx -= 1;
    if (this.keys.d || this.keys.arrowright) dx += 1;
    if (dx !== 0 || dy !== 0) {
      const now = Date.now();
      if (now - this.moveSent > 50 && socket) {
        socket.emit('move', { dx, dy });
        this.moveSent = now;
      }
    }
    this.draw();
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ts = this.tileSize;
    const camX = this.you.x - w / 2;
    const camY = this.you.y - h / 2;

    ctx.fillStyle = '#0a0e12';
    ctx.fillRect(0, 0, w, h);

    if (!this.map?.length) return;

    const startTx = Math.max(0, Math.floor(camX / ts));
    const startTy = Math.max(0, Math.floor(camY / ts));
    const endTx = Math.min(this.map[0].length, startTx + Math.ceil(w / ts) + 2);
    const endTy = Math.min(this.map.length, startTy + Math.ceil(h / ts) + 2);

    for (let ty = startTy; ty < endTy; ty++) {
      for (let tx = startTx; tx < endTx; tx++) {
        const t = this.map[ty][tx];
        ctx.fillStyle = TILE_COLORS[t] ?? '#333';
        ctx.fillRect(tx * ts - camX, ty * ts - camY, ts, ts);
        if (t === 4) {
          ctx.fillStyle = '#48bb78';
          ctx.fillRect(tx * ts - camX + 2, ty * ts - camY + 2, ts - 4, ts - 4);
        }
      }
    }

    for (const s of this.stands) {
      const sx = s.tileX * ts - camX;
      const sy = s.tileY * ts - camY;
      ctx.fillStyle = s.boss ? '#c41e3a' : '#2f855a';
      ctx.fillRect(sx, sy, ts * 2, ts * 2);
      ctx.fillStyle = '#fff';
      ctx.font = '9px sans-serif';
      ctx.fillText('🎄', sx + 4, sy + 12);
    }

    for (const p of this.others) {
      this.drawPlayer(p.x, p.y, p.facing, '#63b3ed', p.username, camX, camY);
    }
    this.drawPlayer(this.you.x, this.you.y, this.you.facing, '#f6ad55', 'You', camX, camY);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, w, 28);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    const stand = this.stands.find((s) => s.id === this.you.standId);
    ctx.fillText(stand ? `${stand.name}` : 'NYC', 8, 18);
  }

  drawPlayer(x, y, facing, color, label, camX, camY) {
    const ctx = this.ctx;
    const px = x - camX;
    const py = y - camY;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a202c';
    const off = { up: [0, -4], down: [0, 4], left: [-4, 0], right: [4, 0] };
    const [ox, oy] = off[facing] || off.down;
    ctx.fillRect(px + ox - 2, py + oy - 2, 4, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '10px sans-serif';
    ctx.fillText(label, px - 20, py - 14);
  }

  startLoop(socket) {
    const loop = () => {
      this.tick(socket);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
