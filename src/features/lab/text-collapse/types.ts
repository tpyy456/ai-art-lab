// TEXT COLLAPSE 实验的类型定义。
// v2：文字碎片落地成 debris（不清空）、田字格碎成 GridShard 线段掉落、
// 为后续「从废墟重塑成花」预留 debris / flowerSeed / reformTargets 数据结构。

export type AnimationPhase =
  | 'idle' // 静止陈列
  | 'activating' // 顶行松动预兆
  | 'collapsing' // 逐层坠落 + 解体
  | 'settling' // 残片落定
  | 'gridFalling' // 田字格碎成线段掉落
  | 'collapsed' // 最终废墟（保留碎片，不清空）
  | 'reforming' // 废墟被牵引、上升、聚合成花（红→黄）
  | 'reformed'; // 废墟向日葵成形 + 暖白光束降临

export type PixelCell = { gx: number; gy: number };

export type FragmentState = 'placed' | 'stuck' | 'falling' | 'rested';
export type DebrisKind = 'glyph' | 'grid';
export type FlowerPart = 'stem' | 'core' | 'petal'; // 重花时碎片归属：茎 / 花心 / 花瓣

// 一个字按田字格切成的四象限碎片之一（0=左上 1=右上 2=左下 3=右下）
export type Fragment = {
  quadrant: 0 | 1 | 2 | 3;
  pixels: PixelCell[];
  pivotX: number;
  pivotY: number;
  // 运行时伪物理（相对初始位置的位移）
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  state: FragmentState;
  strain: number;
  breakFree: number;
  releaseTime: number;
  nextStickY: number;
  gravityScale: number; // 每碎片重量/惯性差异
  sticksLeft: number; // 还能被格线卡几次（差异化）
  restRed: number; // 落地时残留的红度（debris 着色 + 预留给花）
  // —— REFORM（废墟重花）运行时 ——
  reformPart: FlowerPart | null;
  reformDelay: number;
  reformDur: number;
  startX: number; // reform 起点锚点（绝对像素）
  startY: number;
  targetX: number; // reform 终点锚点（绝对像素）
  targetY: number;
  reformProgress: number; // 0..1
};

export type Cell = {
  char: string | null;
  row: number;
  col: number;
  x: number;
  y: number;
  size: number;
  fragments: Fragment[];
};

// 田字格碎块（gridFalling 时由线网离散而来，作为刚性线段下落、落地成 grid debris）
export type GridShardState = 'intact' | 'falling' | 'rested';
export type GridShard = {
  cx: number; // 线段中心（运行时）
  cy: number;
  angle: number; // 当前角度
  half: number; // 半长
  bend: number; // 中点垂直偏移（断裂弯折 jitter，让碎段不笔直）
  vx: number;
  vy: number;
  vrot: number;
  state: GridShardState;
  fallDelay: number; // 失张/断裂下落延迟（从上往下传导）
  red: number; // 暗红激活量 0..1
  row: number;
  // —— REFORM（废墟重花）运行时 ——
  reformPart: FlowerPart | null;
  reformDelay: number;
  reformDur: number;
  startCx: number;
  startCy: number;
  startAngle: number;
  startHalf: number;
  targetCx: number;
  targetCy: number;
  targetAngle: number;
  targetHalf: number;
  reformProgress: number; // 0..1
};

// 静态线网节点（idle/collapsing 阶段画规整田字格用；gridFalling 后交给 GridShard）
export type GridNode = { i: number; j: number; x: number; y: number };
export type GridEdge = { a: GridNode; b: GridNode; broken: boolean };

// —— 预留：后续「重塑成花」的目标点（本轮不填充、不实现开花）——
export type ReformTarget = { x: number; y: number; kind: DebrisKind };

export type Matrix = {
  rows: number;
  cols: number;
  cellSize: number;
  originX: number;
  originY: number;
  floorY: number;
  cells: Cell[];
  nodes: GridNode[][];
  edges: GridEdge[];
  gridShards: GridShard[]; // 田字格碎块（gridFalling 时填充，落地后保留为 grid debris）
  flowerSeed: number; // 预留：后续花的随机种子
  reformTargets: ReformTarget[]; // 预留：后续重塑目标（本轮为空）
};

export type EngineOptions = {
  onPhaseChange?: (phase: AnimationPhase) => void;
};
