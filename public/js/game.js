const TILE_STYLE = {
  0: { fill: '#5c6b7a', stroke: '#4a5568' },
  1: { fill: '#2d3748', stroke: '#1a202c' },
  2: { fill: '#276749', stroke: '#1b4332' },
  3: { fill: '#2b6cb0', stroke: '#2c5282' },
  4: { fill: '#22543d', stroke: '#48bb78' },
  5: { fill: '#744210', stroke: '#d69e2e' },
  6: { fill: '#4a5568', stroke: '#ecc94b' },
  7: { fill: '#4a5568', stroke: '#718096' },
};

const SELLER_COLORS = {
  rookie: '#f6ad55',
  hustler: '#fc8181',
  charmer: '#f687b3',
  expert: '#68d391',
};

export class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.map = null;
    this.labels = [];
    this.landmarks = [];
    this.tileSize = 16;
    this.stands = [];
    this.npcs = [];
    this.you = { x: 0, y: 0, facing: 'down' };
    this.others = [];
    this.keys = {};
    this.moveSent = 0;
    this.onInteract = null;
    this.nearStand = null;
    this.snowflakes = Array.from({ length: 80 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 0.5 + Math.random() * 1.5,
    }));
    this.time = 0;
    window.addEventListener('keydown', (e) => this.onKey(e, true));
    window.addEventListener('keyup', (e) => this.onKey(e, false));
  }

  onKey(e, down) {
    const k = e.key.toLowerCase();
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', 't'].includes(k)) {
      e.preventDefault();
    }
    if (k === 'e' && down && this.onInteract) {
      this.onInteract();
      return;
    }
    if (k === 't' && down && this.onChat) {
      this.onChat();
      return;
    }
    this.keys[k] = down;
  }

  setWorld({ map, tile, stands, labels, landmarks, you }) {
    this.map = map;
    this.tileSize = tile;
    this.stands = stands || [];
    this.labels = labels || [];
    this.landmarks = landmarks || [];
    if (you) this.you = { ...this.you, ...you };
  }

  setNpcs(npcs) {
    this.npcs = npcs || [];
  }

  setYou(pos) {
    this.you = { ...this.you, ...pos };
  }

  setOthers(players) {
    this.others = players.filter((p) => p.username !== this.you.username);
  }

  tick(socket) {
    this.time += 0.016;
    let dx = 0;
    let dy = 0;
    if (this.keys.w || this.keys.arrowup) dy -= 1;
    if (this.keys.s || this.keys.arrowdown) dy += 1;
    if (this.keys.a || this.keys.arrowleft) dx -= 1;
    if (this.keys.d || this.keys.arrowright) dx += 1;
    if (dx !== 0 || dy !== 0) {
      const now = Date.now();
      if (now - this.moveSent > 45 && socket) {
        socket.emit('move', { dx, dy });
        this.moveSent = now;
      }
    }
    this.updateNearStand();
    this.draw();
  }

  updateNearStand() {
    this.nearStand = null;
    let best = Infinity;
    for (const s of this.stands) {
      const cx = (s.tileX + 2) * this.tileSize;
      const cy = (s.tileY + 2) * this.tileSize;
      const d = Math.hypot(this.you.x - cx, this.you.y - cy);
      if (d < this.tileSize * 6 && d < best) {
        best = d;
        this.nearStand = s;
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ts = this.tileSize;
    const camX = this.you.x - w / 2;
    const camY = this.you.y - h / 2;

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0c1220');
    g.addColorStop(1, '#141c2b');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    this.drawSnow(w, h);

    if (!this.map?.length) return;

    const startTx = Math.max(0, Math.floor(camX / ts) - 1);
    const startTy = Math.max(0, Math.floor(camY / ts) - 1);
    const endTx = Math.min(this.map[0].length, startTx + Math.ceil(w / ts) + 3);
    const endTy = Math.min(this.map.length, startTy + Math.ceil(h / ts) + 3);

    for (let ty = startTy; ty < endTy; ty++) {
      for (let tx = startTx; tx < endTx; tx++) {
        const t = this.map[ty][tx];
        const st = TILE_STYLE[t] || TILE_STYLE[1];
        const px = tx * ts - camX;
        const py = ty * ts - camY;
        ctx.fillStyle = st.fill;
        ctx.fillRect(px, py, ts, ts);
        ctx.strokeStyle = st.stroke;
        ctx.strokeRect(px + 0.5, py + 0.5, ts - 1, ts - 1);
        if (t === 4) this.drawTreeLot(ctx, px, py, ts);
        if (t === 5) {
          ctx.fillStyle = 'rgba(255,215,0,0.15)';
          ctx.fillRect(px, py, ts, ts);
        }
      }
    }

    for (const lm of this.landmarks) {
      const lx = lm.tileX * ts - camX;
      const ly = lm.tileY * ts - camY;
      if (lx > -200 && lx < w + 200 && ly > -40 && ly < h + 40) {
        ctx.fillStyle = 'rgba(244,211,94,0.85)';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(lm.name, lx, ly);
      }
    }

    for (const s of this.stands) {
      const sx = s.tileX * ts - camX;
      const sy = s.tileY * ts - camY;
      if (sx < -80 || sy < -80 || sx > w + 80 || sy > h + 80) continue;
      const isYours = s.id === this.you.standId;
      const isNear = this.nearStand?.id === s.id;
      ctx.strokeStyle = s.boss ? '#fc8181' : isYours ? '#f6e05e' : '#48bb78';
      ctx.lineWidth = isNear ? 3 : 1;
      ctx.strokeRect(sx, sy, ts * 4, ts * 3);
      if (isYours) {
        ctx.fillStyle = 'rgba(246,224,94,0.25)';
        ctx.fillRect(sx, sy, ts * 4, ts * 3);
      }
      ctx.fillStyle = '#fff';
      ctx.font = '9px sans-serif';
      ctx.fillText(s.shortName || s.name, sx + 2, sy - 4);
    }

    for (const n of this.npcs) {
      this.drawNpc(n, camX, camY);
    }
    for (const p of this.others) {
      this.drawPlayer(p, camX, camY, false);
    }
    this.drawPlayer(this.you, camX, camY, true);

    this.drawMinimap(w, h);
    this.drawPrompt(w, h);
  }

  drawTreeLot(ctx, px, py, ts) {
    for (let i = 0; i < 3; i++) {
      const tx = px + 4 + i * (ts - 2);
      const ty = py + ts - 4;
      ctx.fillStyle = '#276749';
      ctx.beginPath();
      ctx.moveTo(tx, ty - ts * 0.6);
      ctx.lineTo(tx - 5, ty);
      ctx.lineTo(tx + 5, ty);
      ctx.fill();
      ctx.fillStyle = '#4a3728';
      ctx.fillRect(tx - 2, ty, 4, 4);
    }
  }

  drawSnow(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (const f of this.snowflakes) {
      f.y += 0.002 * f.s;
      if (f.y > 1) f.y = 0;
      const x = (f.x * w + this.time * 20 * f.s) % w;
      const y = f.y * h;
      ctx.fillRect(x, y, f.s, f.s);
    }
  }

  drawNpc(n, camX, camY) {
    const px = n.x - camX;
    const py = n.y - camY;
    if (px < -20 || py < -20 || px > this.canvas.width + 20 || py > this.canvas.height + 20) return;
    this.ctx.fillStyle = '#a0aec0';
    this.ctx.beginPath();
    this.ctx.arc(px, py, 5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawPlayer(p, camX, camY, isYou) {
    const ctx = this.ctx;
    const px = p.x - camX;
    const py = p.y - camY;
    const color = isYou ? SELLER_COLORS[p.sellerId] || '#f6ad55' : '#63b3ed';
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(px - 8, py - 12, 16, 6);
    const off = { up: [0, -5], down: [0, 5], left: [-5, 0], right: [5, 0] };
    const [ox, oy] = off[p.facing] || off.down;
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(px + ox - 2, py + oy - 2, 4, 4);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = isYou ? 'bold 10px sans-serif' : '9px sans-serif';
    ctx.fillText(isYou ? 'You' : p.username, px - 24, py - 16);
    if (p.inBattle) {
      ctx.fillStyle = '#fc8181';
      ctx.font = '8px sans-serif';
      ctx.fillText('SELLING', px - 16, py + 18);
    }
  }

  drawMinimap(w, h) {
    if (!this.map?.length) return;
    const mw = 100;
    const mh = 70;
    const mx = w - mw - 10;
    const my = h - mh - 10;
    const ctx = this.ctx;
    const scaleX = mw / this.map[0].length;
    const scaleY = mh / this.map.length;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#f4d35e';
    ctx.strokeRect(mx, my, mw, mh);
    for (let ty = 0; ty < this.map.length; ty += 2) {
      for (let tx = 0; tx < this.map[0].length; tx += 2) {
        const t = this.map[ty][tx];
        ctx.fillStyle = TILE_STYLE[t]?.fill || '#333';
        ctx.fillRect(mx + tx * scaleX, my + ty * scaleY, scaleX * 2, scaleY * 2);
      }
    }
    const px = mx + (this.you.x / this.tileSize) * scaleX;
    const py = my + (this.you.y / this.tileSize) * scaleY;
    ctx.fillStyle = '#f6ad55';
    ctx.fillRect(px - 2, py - 2, 4, 4);
  }

  drawPrompt(w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, w, 36);
    const stand = this.stands.find((s) => s.id === this.you.standId);
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.fillText(stand ? `${stand.name} · ${stand.corner}` : 'NYC', 10, 16);
    if (this.nearStand) {
      ctx.fillStyle = '#f4d35e';
      ctx.fillText(`[E] ${this.nearStand.id === this.you.standId ? 'Sell trees' : 'Talk to vendor'}`, 10, 30);
    } else {
      ctx.fillStyle = '#8ba3bc';
      ctx.fillText('Walk to a 🎄 lot · [T] chat', 10, 30);
    }
  }

  startLoop(socket) {
    const loop = () => {
      this.tick(socket);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
