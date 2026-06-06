// TEXT COLLAPSE 实验的类型定义。
// 设计要点见同目录方案：点阵字模 + 田字格四象限碎片 + 行传导 + 节点网格倒塌。

export type AnimationPhase =
  | 'idle' // 静止陈列
  | 'activating' // 顶行松动预兆
  | 'collapsing' // 逐层坠落 + 解体
  | 'settling' // 残片落定
  | 'gridFalling' // 格网倒塌
  | 'collapsed'; // 最终残留

export type PixelCell = {
  gx: number; // 点阵列（0..RES-1）
  gy: number; // 点阵行
};

export type FragmentState = 'placed' | 'stuck' | 'falling' | 'rested';

// 一个字按田字格切成的四象限之一（0=左上 1=右上 2=左下 3=右下）
export type Fragment = {
  quadrant: 0 | 1 | 2 | 3;
  pixels: PixelCell[]; // 该象限内的亮点（点阵全局坐标 0..RES-1）
  pivotX: number; // 旋转中心（相对字格左上，像素）
  pivotY: number;
  // 运行时伪物理（相对初始位置的位移）
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  rot: number;
  vrot: number;
  state: FragmentState;
  strain: number; // 卡住时累积的应力
  breakFree: number; // 挣脱阈值
  releaseTime: number; // 相对坍塌开始的释放时刻(ms)
  nextStickY: number; // 下一条会卡住它的横格线世界 y（绝对像素）
};

export type Cell = {
  char: string | null; // null = 空格子（短行留白）
  row: number;
  col: number;
  x: number; // 田字格左上角（像素）
  y: number;
  size: number; // 格子边长
  fragments: Fragment[]; // 非空字才有
};

export type GridNode = {
  i: number; // 行 0..rows
  j: number; // 列 0..cols
  baseX: number;
  baseY: number;
  x: number; // 运行时
  y: number;
  vy: number;
  fallDelay: number; // 倒塌时该节点开始下垂的延迟(ms)
};

export type GridEdge = {
  a: GridNode;
  b: GridNode;
  broken: boolean; // 倒塌时是否断裂
};

export type Matrix = {
  rows: number;
  cols: number;
  cellSize: number;
  originX: number;
  originY: number;
  floorY: number; // 残片堆积线
  cells: Cell[];
  nodes: GridNode[][]; // [i][j]
  edges: GridEdge[]; // 外框线网（cell 边界）
};

export type EngineOptions = {
  onPhaseChange?: (phase: AnimationPhase) => void;
};
