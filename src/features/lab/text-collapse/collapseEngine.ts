import { buildMatrix, createRandom, RES, TIMING } from './matrix';
import type { AnimationPhase, Cell, EngineOptions, Fragment, Matrix } from './types';

const MIN_SIZE = 120;

// 伪物理参数（dt 以毫秒计；v 为 px/ms；G 为 px/ms^2）
const PHYS = {
  gravity: 0.0017,
  stickDamp: 0.16, // 卡住瞬间纵向速度骤降
  stickCreep: 0.0004, // 卡住时缓慢蠕动
  tearBoost: 0.06, // 挣脱后纵向突进
  tearSpread: 0.05, // 挣脱后横向撕开
  tearSpin: 0.004, // 挣脱后旋转
  gridGravity: 0.00085,
  gridDamp: 0.99,
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
  private elapsed = 0; // 总时钟（wall-clock，相对 startTime）
  private phaseElapsed = 0; // 当前阶段时钟（wall-clock，不受 RAF 节流影响）
  private collapseClock = 0; // 坍塌+落定阶段的下坠时钟（wall-clock）
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
    this.phase = 'collapsed'; // 强制让下面 setPhase('idle') 生效（绕过同值早退）
    this.setPhase('idle');
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.resizeObserver.disconnect();
  }

  // ---- 内部 ----
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
    const dt = Math.min(40, time - (this.lastTime || time)); // 物理积分用，clamp 防大跳
    this.lastTime = time;
    // 阶段/释放计时用 wall-clock，不受 RAF 节流影响（后台标签回来不会卡住）
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
        if (this.allRested(m) || this.collapseClock >= TIMING.collapseTimeout) {
          this.setPhase('settling');
        }
        break;
      case 'settling':
        this.updateFragments(dt, m);
        if (this.phaseElapsed >= TIMING.settling) this.setPhase('gridFalling');
        break;
      case 'gridFalling':
        this.updateGrid(dt, m);
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
      const amp = cell.row === 0 ? 1.8 : 0.7;
      for (const f of cell.fragments) {
        f.dx = Math.sin(t * 0.02 + f.pivotX) * amp * 0.6;
        f.dy = Math.sin(t * 0.024 + f.pivotY) * amp;
      }
    }
  }

  private updateFragments(dt: number, m: Matrix) {
    const t = this.collapseClock;
    for (const cell of m.cells) {
      for (const f of cell.fragments) {
        if (f.state === 'rested') continue;
        if (t < f.releaseTime) continue;
        if (f.state === 'placed') f.state = 'falling';

        // 重力
        f.vy += PHYS.gravity * dt;
        f.dy += f.vy * dt;
        f.dx += f.vx * dt;
        f.rot += f.vrot * dt;

        const worldY = cell.y + f.pivotY + f.dy;

        // 落地堆积
        if (worldY >= m.floorY) {
          f.dy = m.floorY - (cell.y + f.pivotY) - this.rand() * cell.size * 0.12;
          f.vy = 0;
          f.vx *= 0.4;
          f.vrot *= 0.3;
          f.state = 'rested';
          continue;
        }

        // 格线摩擦卡顿
        if (f.state !== 'stuck' && worldY >= f.nextStickY) {
          f.state = 'stuck';
          f.vy *= PHYS.stickDamp;
          f.vrot *= 0.5;
          f.strain = 0;
        }
        if (f.state === 'stuck') {
          f.strain += dt;
          f.vy += PHYS.stickCreep * dt;
          if (f.strain >= f.breakFree) {
            // 被拽开、撕裂、继续坠落
            f.state = 'falling';
            f.vy += PHYS.tearBoost;
            f.vx += (this.rand() - 0.5) * PHYS.tearSpread;
            f.vrot += (this.rand() - 0.5) * PHYS.tearSpin;
            f.nextStickY += cell.size;
            f.strain = 0;
          }
        }
      }
    }
  }

  private allRested(m: Matrix): boolean {
    for (const cell of m.cells) {
      for (const f of cell.fragments) {
        if (f.state !== 'rested') return false;
      }
    }
    return true;
  }

  private updateGrid(dt: number, m: Matrix) {
    for (let i = 1; i <= m.rows; i++) {
      for (let j = 0; j <= m.cols; j++) {
        const node = m.nodes[i][j];
        if (this.phaseElapsed < node.fallDelay) continue;
        node.vy += PHYS.gridGravity * dt;
        node.vy *= PHYS.gridDamp;
        node.y += node.vy * dt;
        if (node.y > this.cssH + 60) node.y = this.cssH + 60;
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

    this.drawGrid(m);
    this.drawScanline(m);
    this.drawFragments(m);
    this.drawResidue(m);
  }

  private gridAlpha(): number {
    if (this.phase === 'gridFalling') {
      return 0.18 * Math.max(0.04, 1 - (this.phaseElapsed / TIMING.gridFalling) * 0.9);
    }
    if (this.phase === 'collapsed') return 0.02;
    return 0.18;
  }

  private drawGrid(m: Matrix) {
    const ctx = this.ctx;
    const collapsing = this.phase === 'gridFalling' || this.phase === 'collapsed';
    ctx.lineWidth = 1;
    ctx.strokeStyle = `rgba(214,220,230,${this.gridAlpha().toFixed(3)})`;
    ctx.beginPath();

    // 外框线网（节点连线）
    for (const e of m.edges) {
      if (collapsing && e.broken) continue;
      ctx.moveTo(e.a.x, e.a.y);
      ctx.lineTo(e.b.x, e.b.y);
    }

    // 每个田字格的内十字（用四角节点中点插值，随倒塌自动变形）
    for (let i = 0; i < m.rows; i++) {
      for (let j = 0; j < m.cols; j++) {
        const n00 = m.nodes[i][j];
        const n01 = m.nodes[i][j + 1];
        const n10 = m.nodes[i + 1][j];
        const n11 = m.nodes[i + 1][j + 1];
        // 中竖
        ctx.moveTo((n00.x + n01.x) / 2, (n00.y + n01.y) / 2);
        ctx.lineTo((n10.x + n11.x) / 2, (n10.y + n11.y) / 2);
        // 中横
        ctx.moveTo((n00.x + n10.x) / 2, (n00.y + n10.y) / 2);
        ctx.lineTo((n01.x + n11.x) / 2, (n01.y + n11.y) / 2);
      }
    }
    ctx.stroke();

    // 坍塌中：高亮"当前正在释放"的那条横线（红=受力激活）
    if (this.phase === 'collapsing') {
      const activeRow = Math.min(m.rows, 1 + Math.floor(this.collapseClock / 300));
      const y = m.originY + activeRow * m.cellSize;
      ctx.strokeStyle = 'rgba(214,30,32,0.32)';
      ctx.beginPath();
      ctx.moveTo(m.originX, y);
      ctx.lineTo(m.originX + m.cols * m.cellSize, y);
      ctx.stroke();
    }
  }

  private drawScanline(m: Matrix) {
    if (this.phase !== 'idle') return;
    const ctx = this.ctx;
    const p = (Math.sin(this.elapsed * 0.0011) * 0.5 + 0.5);
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
    const alpha = f.state === 'rested' ? 0.5 : 0.92;
    const r = Math.round(226 + (210 - 226) * redness);
    const g = Math.round(228 + (38 - 228) * redness);
    const b = Math.round(232 + (36 - 232) * redness);
    this.ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
  }

  private drawResidue(m: Matrix) {
    if (this.phase !== 'settling' && this.phase !== 'gridFalling' && this.phase !== 'collapsed') return;
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, m.floorY - m.cellSize * 0.3, 0, this.cssH);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, m.floorY - m.cellSize * 0.3, this.cssW, this.cssH - (m.floorY - m.cellSize * 0.3));
  }
}
