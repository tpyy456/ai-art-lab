import { buildMatrix, createRandom, RES, TIMING } from './matrix';
import type { AnimationPhase, Cell, EngineOptions, FlowerPart, Fragment, GridShard, Matrix } from './types';

const MIN_SIZE = 120;

// 伪物理参数（dt 毫秒；v 为 px/ms；G 为 px/ms^2）
const PHYS = {
  gravity: 0.0016,
  stickDamp: 0.14,
  stickCreep: 0.0004,
  tearBoost: 0.05,
  tearSpread: 0.05,
  tearSpin: 0.006,
  initSpread: 0.012,
  initSpin: 0.0035,
  gridGravity: 0.0014,
  gridRowStep: 115,
  gridNoise: 240,
  gridSpin: 0.0045,
  gridDrift: 0.02,
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const frac = (x: number) => x - Math.floor(x);
function angleDiff(a: number, b: number) {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// 重花着色：废墟灰白/暗红 →(0~0.45 锈红橙) →(0.45~1 目标色)。即「废墟的红转化为生命的黄」。
function reformColor(part: FlowerPart, prog: number, restRed: number): [number, number, number] {
  const sr = 226 - 26 * restRed;
  const sg = 228 - 150 * restRed;
  const sb = 232 - 150 * restRed; // 起色（带暗红余温）
  const mr = 192;
  const mg = 80;
  const mb = 38; // 中转：锈红橙
  let er: number;
  let eg: number;
  let eb: number;
  if (part === 'core') {
    er = 54;
    eg = 38;
    eb = 26;
  } // 花心：炭褐黑
  else if (part === 'stem') {
    er = 158;
    eg = 116;
    eb = 50;
  } // 茎：暗金锈
  else {
    er = 232;
    eg = 178;
    eb = 54;
  } // 花瓣：金黄
  if (prog < 0.45) {
    const t = prog / 0.45;
    return [lerp(sr, mr, t), lerp(sg, mg, t), lerp(sb, mb, t)];
  }
  const t = (prog - 0.45) / 0.55;
  return [lerp(mr, er, t), lerp(mg, eg, t), lerp(mb, eb, t)];
}

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

  private flowerCx = 0;
  private flowerCy = 0;
  private reformStart = 0; // reform 点击的绝对时间；reforming+reformed 连续，不随阶段重置
  private reformClock = 0;

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

  // REFORM：仅废墟态可触发，把残骸牵引重塑成向日葵（不重置）
  reform() {
    if (this.phase !== 'collapsed') return;
    const m = this.matrix;
    if (!m) return;
    this.buildFlowerTargets(m);
    this.reformStart = performance.now();
    this.reformClock = 0;
    this.setPhase('reforming');
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
    if (this.phase === 'reforming' || this.phase === 'reformed') {
      this.reformClock = time - this.reformStart; // 连续时钟（跨阶段），驱动重塑补间
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
      case 'reforming':
        this.updateReform(m);
        if (this.phaseElapsed >= TIMING.reforming) this.setPhase('reformed');
        break;
      case 'reformed':
        this.updateReform(m); // 保持到位（progress 已 1），呼吸在绘制层
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
          f.vx += (this.rand() - 0.5) * PHYS.initSpread;
          f.vrot += (this.rand() - 0.5) * PHYS.initSpin;
        }

        f.vy += PHYS.gravity * f.gravityScale * dt;
        f.dy += f.vy * dt;
        f.dx += f.vx * dt;
        f.rot += f.vrot * dt;

        const worldY = cell.y + f.pivotY + f.dy;

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
            f.vx += (this.rand() - 0.5) * PHYS.tearSpread;
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

  private buildGridShards(m: Matrix) {
    const shards: GridShard[] = [];
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
          bend: (this.rand() - 0.5) * len * 0.22,
          vx: (this.rand() - 0.5) * PHYS.gridDrift,
          vy: 0,
          vrot: (this.rand() - 0.5) * PHYS.gridSpin,
          state: 'intact',
          fallDelay: Math.max(0, row * PHYS.gridRowStep + this.rand() * PHYS.gridNoise),
          red: baseRed * (0.6 + this.rand() * 0.7),
          row,
          reformPart: null,
          reformDelay: 0,
          reformDur: 0,
          startCx: 0,
          startCy: 0,
          startAngle: 0,
          startHalf: 0,
          targetCx: 0,
          targetCy: 0,
          targetAngle: 0,
          targetHalf: 0,
          reformProgress: 0,
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
      if (t < s.fallDelay) continue;
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

  // 进入 reforming：为每个废墟碎片分配向日葵目标（茎 / 花心 / 花瓣），起点 = 当前废墟位置。
  private buildFlowerTargets(m: Matrix) {
    const W = this.cssW;
    const H = this.cssH;
    const fcx = W * 0.5;
    const fcy = H * 0.4;
    this.flowerCx = fcx;
    this.flowerCy = fcy;
    const minSide = Math.min(W, H);
    const coreR = minSide * 0.075;
    const petalInner = coreR * 0.92;
    const petalOuter = coreR + minSide * 0.135;
    const petalCount = 26;
    const stemTopY = fcy + coreR;
    const stemBotY = m.floorY + m.cellSize * 0.3;
    const rand = createRandom((m.flowerSeed | 0) + 1);

    const frags: { f: Fragment; cell: Cell }[] = [];
    for (const cell of m.cells) {
      for (const f of cell.fragments) {
        f.startX = cell.x + f.pivotX + f.dx;
        f.startY = cell.y + f.pivotY + f.dy;
        frags.push({ f, cell });
      }
    }
    const shards = m.gridShards;
    for (const s of shards) {
      s.startCx = s.cx;
      s.startCy = s.cy;
      s.startAngle = s.angle;
      s.startHalf = s.half;
    }

    const shuffle = <T,>(arr: T[]) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    };
    shuffle(frags);
    shuffle(shards);

    // 茎：部分 shards 竖直排列（底先长，从下往上汇聚）
    const stemCount = Math.min(shards.length, 30);
    for (let i = 0; i < stemCount; i++) {
      const s = shards[i];
      const tt = stemCount > 1 ? i / (stemCount - 1) : 0;
      s.reformPart = 'stem';
      s.targetCx = fcx + Math.sin(tt * Math.PI * 1.5) * coreR * 0.3;
      s.targetCy = stemBotY + (stemTopY - stemBotY) * tt;
      s.targetAngle = Math.PI / 2 + (rand() - 0.5) * 0.5;
      s.targetHalf = m.cellSize * (0.2 - tt * 0.06);
      s.reformDelay = (1 - tt) * 220 + rand() * 120;
      s.reformDur = 650 + rand() * 300;
      s.reformProgress = 0;
    }
    // 花瓣脊：剩余 shards 放射
    for (let i = stemCount; i < shards.length; i++) {
      const s = shards[i];
      const petal = (i - stemCount) % petalCount;
      const a = (petal / petalCount) * Math.PI * 2 + (rand() - 0.5) * 0.08;
      const rr = petalInner + (petalOuter - petalInner) * (0.35 + rand() * 0.6);
      s.reformPart = 'petal';
      s.targetCx = fcx + Math.cos(a) * rr;
      s.targetCy = fcy + Math.sin(a) * rr;
      s.targetAngle = a + (rand() - 0.5) * 0.6;
      s.targetHalf = m.cellSize * (0.09 + rand() * 0.07);
      s.reformDelay = 950 + rand() * 750;
      s.reformDur = 600 + rand() * 380;
      s.reformProgress = 0;
    }

    // 花心：部分 fragments 密集盘
    const coreCount = Math.min(frags.length, 120);
    for (let i = 0; i < coreCount; i++) {
      const { f } = frags[i];
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * coreR;
      f.reformPart = 'core';
      f.targetX = fcx + Math.cos(a) * rr;
      f.targetY = fcy + Math.sin(a) * rr;
      f.reformDelay = 360 + rand() * 360;
      f.reformDur = 620 + rand() * 300;
      f.reformProgress = 0;
    }
    // 花瓣面：剩余 fragments（由内往外、最后到位）
    for (let i = coreCount; i < frags.length; i++) {
      const { f } = frags[i];
      const petal = (i - coreCount) % petalCount;
      const along = rand();
      const a = (petal / petalCount) * Math.PI * 2 + (rand() - 0.5) * 0.14;
      const rr = petalInner + (petalOuter - petalInner) * (0.1 + along * 0.9);
      const perp = a + Math.PI / 2;
      const widAmt = (rand() - 0.5) * coreR * 0.55 * (1 - along * 0.7);
      f.reformPart = 'petal';
      f.targetX = fcx + Math.cos(a) * rr + Math.cos(perp) * widAmt;
      f.targetY = fcy + Math.sin(a) * rr + Math.sin(perp) * widAmt;
      f.reformDelay = 950 + along * 650 + rand() * 220;
      f.reformDur = 600 + rand() * 350;
      f.reformProgress = 0;
    }
  }

  private updateReform(m: Matrix) {
    // 用连续的 reformClock（不随 reforming→reformed 切换重置），避免切换瞬间 progress 跳回 0 → 闪烁
    const t = this.reformClock;
    for (const cell of m.cells) {
      for (const f of cell.fragments) {
        if (!f.reformPart) continue;
        const p = easeInOut(clamp01((t - f.reformDelay) / Math.max(1, f.reformDur)));
        f.reformProgress = p;
        const ax = lerp(f.startX, f.targetX, p);
        const ay = lerp(f.startY, f.targetY, p);
        f.dx = ax - (cell.x + f.pivotX);
        f.dy = ay - (cell.y + f.pivotY);
        f.rot *= 1 - p * 0.015; // 缓慢端正一点，仍保留碎裂拼合感
      }
    }
    for (const s of m.gridShards) {
      if (!s.reformPart) continue;
      const p = easeInOut(clamp01((t - s.reformDelay) / Math.max(1, s.reformDur)));
      s.reformProgress = p;
      s.cx = lerp(s.startCx, s.targetCx, p);
      s.cy = lerp(s.startCy, s.targetCy, p);
      s.angle = s.startAngle + angleDiff(s.startAngle, s.targetAngle) * p;
      s.half = lerp(s.startHalf, s.targetHalf, p);
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

    const reform = this.phase === 'reforming' || this.phase === 'reformed';
    if (reform) {
      this.drawResidueFloor(m); // 底部废墟余温仍在
      this.drawShards(m);
      this.drawFragments(m);
      this.drawLightBeam(m);
      return;
    }

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

    if (this.phase === 'reforming' || this.phase === 'reformed') {
      const breath = this.flowerBreath();
      for (const s of m.gridShards) {
        if (!s.reformPart) continue;
        const [r, g, b] = reformColor(s.reformPart, s.reformProgress, s.red);
        ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${(0.55 * breath).toFixed(3)})`;
        ctx.beginPath();
        this.traceShard(ctx, s);
        ctx.stroke();
      }
      return;
    }

    // 废墟态：灰白主体（与静态网格同色，无突跳）+ 暗红余光
    ctx.strokeStyle = 'rgba(214,220,230,0.18)';
    ctx.beginPath();
    for (const s of m.gridShards) this.traceShard(ctx, s);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(156,46,42,0.12)';
    ctx.beginPath();
    for (const s of m.gridShards) {
      if (s.state === 'intact' || s.red < 0.16) continue;
      this.traceShard(ctx, s);
    }
    ctx.stroke();
  }

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
    if ((this.phase === 'reforming' || this.phase === 'reformed') && f.reformPart) {
      const [r, g, b] = reformColor(f.reformPart, f.reformProgress, f.restRed);
      const breath = this.flowerBreath();
      this.ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${(0.86 * breath).toFixed(3)})`;
      return;
    }
    let redness = 0;
    if (f.state === 'stuck') redness = Math.min(1, f.strain / f.breakFree) * 0.85;
    else if (f.state === 'rested') redness = f.restRed;
    const alpha = f.state === 'rested' ? 0.52 : 0.92;
    const r = Math.round(226 + (208 - 226) * redness);
    const g = Math.round(228 + (40 - 228) * redness);
    const b = Math.round(232 + (38 - 232) * redness);
    this.ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
  }

  // 花呼吸：呼吸幅度在 reformed 后从 0 平滑渐入，避免 reforming→reformed 切换瞬间 alpha 跳变。
  // reforming（含末帧）返回 1；reformed 第一帧幅度仍为 0 → 与上一帧连续。
  private flowerBreath(): number {
    if (this.phase !== 'reformed') return 1;
    const amp = Math.min(0.09, (this.phaseElapsed / 2200) * 0.09);
    return 1 - amp + (Math.sin(this.elapsed * 0.0022) * 0.5 + 0.5) * amp;
  }

  // 暖白光束：仅 reformed 后 ~600ms 才从上方降临（见证，不抢先）
  private drawLightBeam(m: Matrix) {
    void m;
    if (this.phase !== 'reformed') return;
    const inT = clamp01((this.phaseElapsed - 600) / 1300);
    if (inT <= 0.01) return;
    const ctx = this.ctx;
    const fcx = this.flowerCx;
    const fcy = this.flowerCy;
    const minSide = Math.min(this.cssW, this.cssH);
    const topW = minSide * 0.05;
    const botW = minSide * 0.32;
    const beamBot = fcy + minSide * 0.2;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const grad = ctx.createLinearGradient(0, 0, 0, beamBot);
    grad.addColorStop(0, `rgba(255,248,228,${(0.17 * inT).toFixed(3)})`);
    grad.addColorStop(0.6, `rgba(255,240,210,${(0.09 * inT).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(fcx - topW, 0);
    ctx.lineTo(fcx + topW, 0);
    ctx.lineTo(fcx + botW, beamBot);
    ctx.lineTo(fcx - botW, beamBot);
    ctx.closePath();
    ctx.fill();

    // 丁达尔尘埃：光柱内缓慢下飘的暖白微尘
    ctx.fillStyle = `rgba(255,246,224,${(0.5 * inT).toFixed(3)})`;
    for (let i = 0; i < 26; i++) {
      const seed = i * 12.9898;
      const fx = fcx + (frac(Math.sin(seed)) * 2 - 1) * botW * 0.8;
      const speed = 0.4 + frac(Math.sin(seed * 2.1)) * 0.6;
      const fy = (frac(Math.sin(seed * 1.7)) * beamBot + this.elapsed * 0.018 * speed) % beamBot;
      const sz = 0.6 + frac(Math.sin(seed * 3.3)) * 1.0;
      ctx.beginPath();
      ctx.arc(fx, fy, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawResidue(m: Matrix) {
    if (this.phase !== 'settling' && this.phase !== 'gridFalling' && this.phase !== 'collapsed') return;
    this.drawResidueFloor(m);
  }

  private drawResidueFloor(m: Matrix) {
    const ctx = this.ctx;
    const top = m.floorY - m.cellSize * 0.5;
    const grad = ctx.createLinearGradient(0, top, 0, this.cssH);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, top, this.cssW, this.cssH - top);
  }
}
