import { buildMatrix, createRandom, RES, TIMING } from './matrix';
import type { AnimationPhase, EngineOptions, Fragment, GridShard, Matrix } from './types';

const MIN_SIZE = 120;

// 伪物理参数（dt 毫秒；v 为 px/ms；G 为 px/ms^2）
const PHYS = {
  gravity: 0.0016,
  stickDamp: 0.14, // 卡住瞬间纵向速度骤降
  stickCreep: 0.0004, // 卡住时缓慢蠕动
  tearBoost: 0.05, // 挣脱后纵向突进
  tearSpread: 0.05, // 挣脱后横向撕开
  tearSpin: 0.006, // 挣脱后旋转
  initSpread: 0.012, // 释放瞬间初速差异
  initSpin: 0.0035,
  gridGravity: 0.0014, // 网格碎块重力
  gridRowStep: 115, // 网格断裂从上往下传导
  gridNoise: 240,
  gridSpin: 0.0045,
  gridDrift: 0.02,
};

export class CollapseEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onPhaseChange?: (phase: AnimationPhase) => void;

  private dpr = 1;
  private cssW = 0;
  private cssH = 0;
  private matrix: Matrix | null = null;

  private phase: AnimationPhase = 'idle';
  private elapsed = 0;
  private phaseElapsed = 0; // wall-clock，不受 RAF 节流影响
  private collapseClock = 0;
  private startTime = 0;
  private phaseStart = 0;
  private collapseStart = 0;
  private lastTime = 0;
  private rafId = 0;
  private disposed = false;

  private resizeObserver: ResizeObserver;
  private rand = createRandom(77123);

  constructor(canvas: HTMLCanvasElement, opts: EngineOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    this.ctx = ctx;
    this.onPhaseChange = opts.onPhaseChange;

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(canvas);

    this.startTime = performance.now();
    this.handleResize();
    this.rafId = requestAnimationFrame(this.loop);
  }

  start() {
    if (this.phase !== 'idle') return;
    this.setPhase('activating');
  }

  reset() {
    if (!this.cssW || !this.cssH) return;
    this.matrix = buildMatrix(this.cssW, this.cssH);
    this.collapseClock = 0;
    this.startTime = performance.now();
    this.phase = 'collapsed'; // 绕过 setPhase 同值早退
    this.setPhase('idle');
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.resizeObserver.disconnect();
  }

  private setPhase(p: AnimationPhase) {
    if (this.phase === p) return;
    this.phase = p;
    this.phaseStart = performance.now();
    this.phaseElapsed = 0;
    if (p === 'collapsing') {
      this.collapseStart = this.phaseStart;
      this.collapseClock = 0;
    }
    this.onPhaseChange?.(p);
  }

  private handleResize() {
    const w = Math.round(this.canvas.clientWidth);
    const h = Math.round(this.canvas.clientHeight);
    if (w < MIN_SIZE || h < MIN_SIZE) return;
    if (w === this.cssW && h === this.cssH && this.matrix) return;
    this.cssW = w;
    this.cssH = h;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.matrix = buildMatrix(w, h);
    this.collapseClock = 0;
    this.setPhase('idle');
  }

  private loop = (time: number) => {
    if (this.disposed) return;
    const dt = Math.min(40, time - (this.lastTime || time));
    this.lastTime = time;
    this.elapsed = time - this.startTime;
    this.phaseElapsed = time - this.phaseStart;
    if (this.phase === 'collapsing' || this.phase === 'settling') {
      this.collapseClock = time - this.collapseStart;
    }
    this.update(dt);
    this.draw();
    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    const m = this.matrix;
    if (!m) return;
    switch (this.phase) {
      case 'activating':
        this.updateTremor();
        if (this.phaseElapsed >= TIMING.activating) this.setPhase('collapsing');
        break;
      case 'collapsing':
        this.updateFragments(dt, m);
        if (this.allRested(m) || this.collapseClock >= TIMING.collapseTimeout) this.setPhase('settling');
        break;
      case 'settling':
        this.updateFragments(dt, m);
        if (this.phaseElapsed >= TIMING.settling) this.setPhase('gridFalling');
        break;
      case 'gridFalling':
        if (m.gridShards.length === 0) this.buildGridShards(m);
        this.updateShards(dt, m);
        if (this.phaseElapsed >= TIMING.gridFalling) this.setPhase('collapsed');
        break;
      default:
        break;
    }
  }

  private updateTremor() {
    const m = this.matrix;
    if (!m) return;
    const t = this.phaseElapsed;
    for (const cell of m.cells) {
      if (cell.row > 1) continue;
      const amp = cell.row === 0 ? 1.9 : 0.7;
      for (const f of cell.fragments) {
        f.dx = Math.sin(t * 0.021 + f.pivotX) * amp * 0.6;
        f.dy = Math.sin(t * 0.025 + f.pivotY) * amp;
      }
    }
  }

  private updateFragments(dt: number, m: Matrix) {
    const t = this.collapseClock;
    for (const cell of m.cells) {
      for (const f of cell.fragments) {
        if (f.state === 'rested') continue;
        if (t < f.releaseTime) continue;
        if (f.state === 'placed') {
          f.state = 'falling';
          f.vx += (this.rand() - 0.5) * PHYS.initSpread; // 释放瞬间初速差异（错开）
          f.vrot += (this.rand() - 0.5) * PHYS.initSpin;
        }

        f.vy += PHYS.gravity * f.gravityScale * dt; // 重量/惯性差异
        f.dy += f.vy * dt;
        f.dx += f.vx * dt;
        f.rot += f.vrot * dt;

        const worldY = cell.y + f.pivotY + f.dy;

        // 落地成 debris（保留，不清空）
        const restLine = m.floorY + (this.rand() - 0.5) * cell.size * 0.5;
        if (worldY >= restLine) {
          f.dy = restLine - (cell.y + f.pivotY);
          f.vy = 0;
          f.vx *= 0.25;
          f.vrot *= 0.15;
          f.restRed = Math.min(0.55, f.restRed + 0.12 + this.rand() * 0.1);
          f.state = 'rested';
          continue;
        }

        // 格线摩擦卡顿（多次、差异化）
        if (f.state !== 'stuck' && f.sticksLeft > 0 && worldY >= f.nextStickY) {
          f.state = 'stuck';
          f.vy *= PHYS.stickDamp;
          f.vrot *= 0.5;
          f.strain = 0;
        }
        if (f.state === 'stuck') {
          f.strain += dt;
          f.vy += PHYS.stickCreep * dt;
          if (f.strain >= f.breakFree) {
            f.state = 'falling';
            f.vy += PHYS.tearBoost;
            f.vx += (this.rand() - 0.5) * PHYS.tearSpread; // 撕开横向
            f.vrot += (this.rand() - 0.5) * PHYS.tearSpin;
            f.nextStickY += cell.size;
            f.sticksLeft -= 1;
            f.strain = 0;
          }
        }
      }
    }
  }

  private allRested(m: Matrix): boolean {
    for (const cell of m.cells) {
      for (const f of cell.fragments) if (f.state !== 'rested') return false;
    }
    return true;
  }

  // 进入 gridFalling 时把田字格线网离散成可下落的线段碎块
  private buildGridShards(m: Matrix) {
    const shards: GridShard[] = [];
    // 把一条网格线切成 2 段不等长碎段（中间留断口），各段独立角度/弯折/速度 → 不再是死直线
    const pushSeg = (ax: number, ay: number, bx: number, by: number, baseRed: number) => {
      const mid = 0.5 + (this.rand() - 0.5) * 0.24;
      const gap = 0.05 + this.rand() * 0.05;
      const cuts: Array<[number, number]> = [
        [this.rand() * 0.04, mid - gap],
        [mid + gap, 1 - this.rand() * 0.04],
      ];
      for (const [t0, t1] of cuts) {
        const sax = ax + (bx - ax) * t0;
        const say = ay + (by - ay) * t0;
        const sbx = ax + (bx - ax) * t1;
        const sby = ay + (by - ay) * t1;
        const len = Math.hypot(sbx - sax, sby - say);
        if (len < 1.5) continue;
        const cx = (sax + sbx) / 2;
        const cy = (say + sby) / 2;
        const row = Math.max(0, Math.min(m.rows, Math.round((cy - m.originY) / m.cellSize)));
        shards.push({
          cx,
          cy,
          angle: Math.atan2(sby - say, sbx - sax),
          half: len / 2,
          bend: (this.rand() - 0.5) * len * 0.22, // 断裂弯折
          vx: (this.rand() - 0.5) * PHYS.gridDrift,
          vy: 0,
          vrot: (this.rand() - 0.5) * PHYS.gridSpin,
          state: 'intact',
          fallDelay: Math.max(0, row * PHYS.gridRowStep + this.rand() * PHYS.gridNoise),
          red: baseRed * (0.6 + this.rand() * 0.7),
          row,
        });
      }
    };

    for (const e of m.edges) {
      const red = e.broken ? 0.22 + this.rand() * 0.16 : this.rand() * 0.07;
      pushSeg(e.a.x, e.a.y, e.b.x, e.b.y, red);
    }
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        const n00 = m.nodes[i][j];
        const n01 = m.nodes[i][j + 1];
        const n10 = m.nodes[i + 1][j];
        const n11 = m.nodes[i + 1][j + 1];
        pushSeg((n00.x + n01.x) / 2, (n00.y + n01.y) / 2, (n10.x + n11.x) / 2, (n10.y + n11.y) / 2, this.rand() * 0.06);
        pushSeg((n00.x + n10.x) / 2, (n00.y + n10.y) / 2, (n01.x + n11.x) / 2, (n01.y + n11.y) / 2, this.rand() * 0.06);
      }
    }
    m.gridShards = shards;
  }

  private updateShards(dt: number, m: Matrix) {
    const t = this.phaseElapsed;
    for (const s of m.gridShards) {
      if (s.state === 'rested') continue;
      if (t < s.fallDelay) continue; // 失张/断裂前保持原位
      if (s.state === 'intact') s.state = 'falling';
      s.vy += PHYS.gridGravity * dt;
      s.cy += s.vy * dt;
      s.cx += s.vx * dt;
      s.angle += s.vrot * dt;
      const restLine = m.floorY + (this.rand() - 0.5) * m.cellSize * 0.6;
      if (s.cy >= restLine) {
        s.cy = restLine;
        s.vy = 0;
        s.vrot *= 0.18;
        s.state = 'rested';
      }
    }
  }

  // ---- 绘制 ----
  private draw() {
    const m = this.matrix;
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#040405';
    ctx.fillRect(0, 0, this.cssW, this.cssH);
    if (!m) return;

    const shattered = this.phase === 'gridFalling' || this.phase === 'collapsed';
    if (shattered) this.drawShards(m);
    else this.drawStaticGrid(m);
    if (this.phase === 'idle') this.drawScanline(m);
    this.drawFragments(m);
    this.drawResidue(m);
  }

  private drawStaticGrid(m: Matrix) {
    const ctx = this.ctx;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(214,220,230,0.18)';
    ctx.beginPath();
    for (const e of m.edges) {
      ctx.moveTo(e.a.x, e.a.y);
      ctx.lineTo(e.b.x, e.b.y);
    }
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        const n00 = m.nodes[i][j];
        const n01 = m.nodes[i][j + 1];
        const n10 = m.nodes[i + 1][j];
        const n11 = m.nodes[i + 1][j + 1];
        ctx.moveTo((n00.x + n01.x) / 2, (n00.y + n01.y) / 2);
        ctx.lineTo((n10.x + n11.x) / 2, (n10.y + n11.y) / 2);
        ctx.moveTo((n00.x + n10.x) / 2, (n00.y + n10.y) / 2);
        ctx.lineTo((n01.x + n11.x) / 2, (n01.y + n11.y) / 2);
      }
    }
    ctx.stroke();

    if (this.phase === 'collapsing') {
      const activeRow = Math.min(m.rows, 1 + Math.floor(this.collapseClock / 300));
      const y = m.originY + activeRow * m.cellSize;
      ctx.strokeStyle = 'rgba(214,30,32,0.3)';
      ctx.beginPath();
      ctx.moveTo(m.originX, y);
      ctx.lineTo(m.originX + m.cols * m.cellSize, y);
      ctx.stroke();
    }
  }

  private drawShards(m: Matrix) {
    const ctx = this.ctx;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    // 灰白主体：与静态网格同色同透明（rgba(214,220,230,0.18)）→ 进入碎裂时颜色连续，无突跳
    ctx.strokeStyle = 'rgba(214,220,230,0.18)';
    ctx.beginPath();
    for (const s of m.gridShards) this.traceShard(ctx, s);
    ctx.stroke();
    // 暗红余光：仅在「已开始下落/断裂」的碎段，低透明、随运动从上往下自然浮现（非状态硬切色）
    ctx.strokeStyle = 'rgba(156,46,42,0.12)';
    ctx.beginPath();
    for (const s of m.gridShards) {
      if (s.state === 'intact' || s.red < 0.16) continue;
      this.traceShard(ctx, s);
    }
    ctx.stroke();
  }

  // 轻微弯折的碎段（A → 中点偏移 → B），代替死直线
  private traceShard(ctx: CanvasRenderingContext2D, s: GridShard) {
    const cos = Math.cos(s.angle);
    const sin = Math.sin(s.angle);
    const ax = s.cx - cos * s.half;
    const ay = s.cy - sin * s.half;
    const bx = s.cx + cos * s.half;
    const by = s.cy + sin * s.half;
    const mx = s.cx - sin * s.bend;
    const my = s.cy + cos * s.bend;
    ctx.moveTo(ax, ay);
    ctx.lineTo(mx, my);
    ctx.lineTo(bx, by);
  }

  private drawScanline(m: Matrix) {
    const ctx = this.ctx;
    const p = Math.sin(this.elapsed * 0.0011) * 0.5 + 0.5;
    const y = m.originY + p * m.rows * m.cellSize;
    ctx.strokeStyle = 'rgba(214,30,32,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.originX, y);
    ctx.lineTo(m.originX + m.cols * m.cellSize, y);
    ctx.stroke();
  }

  private drawFragments(m: Matrix) {
    const ctx = this.ctx;
    for (const cell of m.cells) {
      if (cell.fragments.length === 0) continue;
      const u = cell.size / RES;
      const dot = u * 0.82;
      const half = dot / 2;
      for (const f of cell.fragments) {
        this.applyFragmentStyle(f);
        const cos = Math.cos(f.rot);
        const sin = Math.sin(f.rot);
        const bx = cell.x + f.dx;
        const by = cell.y + f.dy;
        ctx.beginPath();
        for (const p of f.pixels) {
          const lx = (p.gx + 0.5) * u;
          const ly = (p.gy + 0.5) * u;
          const ox = lx - f.pivotX;
          const oy = ly - f.pivotY;
          const rx = f.pivotX + ox * cos - oy * sin;
          const ry = f.pivotY + ox * sin + oy * cos;
          ctx.rect(bx + rx - half, by + ry - half, dot, dot);
        }
        ctx.fill();
      }
    }
  }

  private applyFragmentStyle(f: Fragment) {
    let redness = 0;
    if (f.state === 'stuck') redness = Math.min(1, f.strain / f.breakFree) * 0.85;
    else if (f.state === 'rested') redness = f.restRed;
    const alpha = f.state === 'rested' ? 0.52 : 0.92;
    const r = Math.round(226 + (208 - 226) * redness);
    const g = Math.round(228 + (40 - 228) * redness);
    const b = Math.round(232 + (38 - 232) * redness);
    this.ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
  }

  private drawResidue(m: Matrix) {
    if (this.phase !== 'settling' && this.phase !== 'gridFalling' && this.phase !== 'collapsed') return;
    const ctx = this.ctx;
    const top = m.floorY - m.cellSize * 0.5;
    const grad = ctx.createLinearGradient(0, top, 0, this.cssH);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, top, this.cssW, this.cssH - top);
  }

  // —— 预留：后续「从废墟重塑成花」——
  // 数据已就绪：rested 文字碎片（cells[].fragments, 含 dx/dy/rot/restRed）
  // + rested 网格碎块（matrix.gridShards, 含 cx/cy/angle）+ matrix.flowerSeed + matrix.reformTargets。
  // 下一阶段会读取这些 debris 并补间到 reformTargets（花形）。本轮不实现。
}
