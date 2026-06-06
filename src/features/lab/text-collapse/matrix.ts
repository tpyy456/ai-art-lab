import type { Cell, Fragment, GridEdge, GridNode, Matrix, PixelCell } from './types';

// ---- 固定文本（6 行；不改句意；短行居中放入 9 列网格）----
const TEXT_LINES = [
  '我不是突然变得破碎', // 9
  '只是沉默太久以后', // 8
  '身体里长出一片废墟', // 9
  '有些花开得很迟', // 7
  '却偏偏要在瓦砾中', // 8
  '证明自己还没有死', // 8
];

export const ROWS = TEXT_LINES.length; // 6
export const COLS = 9;
export const RES = 16; // 每字点阵分辨率（低分辨率 → 像素/字模感）

// ---- 动画节奏常量（毫秒）----
export const TIMING = {
  activating: 600,
  collapseTimeout: 5200, // 安全兜底：超时强制进入 settling
  settling: 900,
  gridFalling: 2200,
};

// 释放时机：行主导（保留从上到下），但叠加大量错位/噪声让它不机械
const COLLAPSE = {
  rowStep: 300, // 行传导步长（仍主导，保证上崩下后）
  colJitter: 38, // 列方向系统错位
  colNoise: 90, // 列方向随机
  quadLowerBias: 70, // 下半象限略晚
  quadNoise: 190, // 每象限独立随机延迟（同字 4 象限不同步）
  noise: 160, // 总扰动
  breakFreeBase: 90, // 卡住后挣脱基础应力(ms)
  breakFreeRand: 380, // 拉大卡顿差异：有的一卡就走、有的被狠狠拽住
};

// 带种子伪随机（同一种子坍塌节奏一致、可控、不发散）
export function createRandom(seed: number) {
  let s = seed | 0;
  return function random() {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- 字模点阵采样（离屏渲染 → 阈值化）----
const glyphCache = new Map<string, PixelCell[]>();

function sampleGlyph(char: string): PixelCell[] {
  const cached = glyphCache.get(char);
  if (cached) return cached;

  const off = document.createElement('canvas');
  off.width = RES;
  off.height = RES;
  const ctx = off.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, RES, RES);
  ctx.fillStyle = '#fff';
  ctx.font = `${Math.floor(RES * 0.86)}px "PingFang SC","Microsoft YaHei",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(char, RES / 2, RES / 2 + RES * 0.04);

  const data = ctx.getImageData(0, 0, RES, RES).data;
  const pixels: PixelCell[] = [];
  for (let gy = 0; gy < RES; gy++) {
    for (let gx = 0; gx < RES; gx++) {
      if (data[(gy * RES + gx) * 4] > 110) pixels.push({ gx, gy });
    }
  }
  glyphCache.set(char, pixels);
  return pixels;
}

const HALF = RES / 2;

function quadrantOf(p: PixelCell): 0 | 1 | 2 | 3 {
  const right = p.gx >= HALF;
  const lower = p.gy >= HALF;
  if (!right && !lower) return 0;
  if (right && !lower) return 1;
  if (!right && lower) return 2;
  return 3;
}

function quadPivot(quadrant: 0 | 1 | 2 | 3, u: number): { px: number; py: number } {
  const cx = quadrant === 1 || quadrant === 3 ? HALF + HALF / 2 : HALF / 2;
  const cy = quadrant === 2 || quadrant === 3 ? HALF + HALF / 2 : HALF / 2;
  return { px: cx * u, py: cy * u };
}

function buildFragments(
  char: string,
  size: number,
  row: number,
  col: number,
  originY: number,
  random: () => number,
): Fragment[] {
  const pixels = sampleGlyph(char);
  const u = size / RES;
  const buckets: PixelCell[][] = [[], [], [], []];
  for (const p of pixels) buckets[quadrantOf(p)].push(p);

  const fragments: Fragment[] = [];
  for (let q = 0; q < 4; q++) {
    const bucket = buckets[q];
    if (bucket.length === 0) continue;
    const quadrant = q as 0 | 1 | 2 | 3;
    const { px, py } = quadPivot(quadrant, u);

    // 行主导 + 列错位 + 每象限独立随机 → 从上到下但不机械
    const releaseTime = Math.max(
      0,
      row * COLLAPSE.rowStep +
        col * COLLAPSE.colJitter +
        (random() - 0.5) * 2 * COLLAPSE.colNoise +
        (quadrant >= 2 ? COLLAPSE.quadLowerBias : 0) +
        random() * COLLAPSE.quadNoise +
        (random() - 0.5) * 2 * COLLAPSE.noise,
    );

    fragments.push({
      quadrant,
      pixels: bucket,
      pivotX: px,
      pivotY: py,
      dx: 0,
      dy: 0,
      vx: 0,
      vy: 0,
      rot: 0,
      vrot: 0,
      state: 'placed',
      strain: 0,
      breakFree: COLLAPSE.breakFreeBase + random() * COLLAPSE.breakFreeRand,
      releaseTime,
      nextStickY: originY + (row + 1) * size,
      gravityScale: 0.82 + random() * 0.5, // 重量差异
      sticksLeft: 1 + Math.floor(random() * 3), // 卡顿次数差异
      restRed: 0,
    });
  }
  return fragments;
}

export function buildMatrix(width: number, height: number): Matrix {
  const random = createRandom(20260606);

  const usableW = width * 0.86;
  const usableH = height * 0.66;
  const cellSize = Math.max(40, Math.min(120, Math.min(usableW / COLS, usableH / ROWS)));

  const gridW = COLS * cellSize;
  const gridH = ROWS * cellSize;
  const originX = (width - gridW) / 2;
  const originY = Math.max(cellSize * 0.6, (height - gridH) * 0.36);
  const floorY = originY + gridH + cellSize * 0.7;

  const cells: Cell[] = [];
  for (let row = 0; row < ROWS; row++) {
    const line = TEXT_LINES[row];
    const n = line.length;
    const startCol = Math.floor((COLS - n) / 2);
    for (let col = 0; col < COLS; col++) {
      const inRange = col >= startCol && col < startCol + n;
      const char = inRange ? line.charAt(col - startCol) : null;
      cells.push({
        char,
        row,
        col,
        x: originX + col * cellSize,
        y: originY + row * cellSize,
        size: cellSize,
        fragments: char ? buildFragments(char, cellSize, row, col, originY, random) : [],
      });
    }
  }

  // 静态线网（idle/collapsing 画规整田字格用）
  const nodes: GridNode[][] = [];
  for (let i = 0; i <= ROWS; i++) {
    const rowNodes: GridNode[] = [];
    for (let j = 0; j <= COLS; j++) {
      const x = originX + j * cellSize;
      const y = originY + i * cellSize;
      rowNodes.push({ i, j, x, y });
    }
    nodes.push(rowNodes);
  }

  const edges: GridEdge[] = [];
  for (let i = 0; i <= ROWS; i++) {
    for (let j = 0; j <= COLS; j++) {
      if (j < COLS) edges.push({ a: nodes[i][j], b: nodes[i][j + 1], broken: random() < 0.18 });
      if (i < ROWS) edges.push({ a: nodes[i][j], b: nodes[i + 1][j], broken: random() < 0.18 });
    }
  }

  return {
    rows: ROWS,
    cols: COLS,
    cellSize,
    originX,
    originY,
    floorY,
    cells,
    nodes,
    edges,
    gridShards: [], // gridFalling 时填充
    flowerSeed: Math.floor(random() * 1e9), // 预留给后续花
    reformTargets: [], // 预留（本轮空）
  };
}
