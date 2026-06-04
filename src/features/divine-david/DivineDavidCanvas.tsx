import { useEffect, useRef } from 'react';

type DivineDavidCanvasProps = {
  className?: string;
  source?: string;
};

type Point = {
  x: number;
  y: number;
  z?: number;
};

const DEFAULT_SOURCE = '/david-source.png';
const COLLAPSE_MODE: 'auto' | 'cursor' | 'center' = 'auto';
const MAX_CANVAS_DPR = 1.35;
const MIN_USABLE_CANVAS_SIZE = 160;
const DAVID_FRAME_BOUNDS = {
  left: 0.13,
  top: 0.05,
  right: 0.887,
  bottom: 0.95,
};

function createRandom(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp(0, (value - edge0) / (edge1 - edge0), 1);
  return t * t * (3 - 2 * t);
}

function mixAngle(a: number, b: number, t: number) {
  let delta = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (delta < -Math.PI) {
    delta += Math.PI * 2;
  }
  return a + delta * t;
}

function colorMix(gray: number, redMix: number, alpha: number) {
  const red = clamp(0, redMix, 1);
  const r = Math.round(lerp(gray, 194, red));
  const g = Math.round(lerp(gray, 34, red * 0.95));
  const b = Math.round(lerp(gray, 30, red));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function DivineDavidCanvas({ className = '', source = DEFAULT_SOURCE }: DivineDavidCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const renderingContext = canvasElement.getContext('2d', { alpha: false });
    if (!renderingContext) return;

    const canvas: HTMLCanvasElement = canvasElement;
    const ctx: CanvasRenderingContext2D = renderingContext;

    let width = 1;
    let height = 1;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
    let animationId = 0;
    let lastFrameTime = 0;
    let resizeTimer = 0;
    let ready = false;
    let sceneInitialized = false;
    let disposed = false;
    let currentSource: HTMLImageElement | HTMLCanvasElement | null = null;
    let modelBounds = {
      aspect: 0.56,
      top: -0.5,
      bottom: 0.5,
    };

    const random = createRandom(20260602);

    const pointer = {
      active: false,
      insideFrame: false,
      mx: -1000,
      my: -1000,
      tx: 0,
      ty: 0,
      x: 0,
      y: 0,
    };

    const globalPointer = {
      active: false,
      tx: 0,
      ty: 0,
      x: 0,
      y: 0,
    };

    const interaction = {
      clickCooldown: 245,
      clickTimer: 0,
      clicks: 0,
      longPressTimer: 0,
      longPressActive: false,
      isDown: false,
      chargeStartTime: 0,
      chargeLevel: 0,
      chargeX: 0,
      chargeY: 0,
      releasePulse: 0,
      orbitActivation: 0,
    };

    const bodyStrokes: any[] = [];
    const wingStrokes: any[] = [];
    const haloArcs: any[] = [];
    const orbitArcs: any[] = [];
    const orbitDust: any[] = [];
    const ambientStrokes: any[] = [];
    const ambientDust: any[] = [];
    const debugState = {
      canvasDpr: pixelRatio,
      canvasHeight: height,
      canvasWidth: width,
      chargeActive: false,
      lastGlobalPointer: { x: 0, y: 0 },
      lastInsideFrame: false,
      lastLocalPointer: { x: -1000, y: -1000 },
      boundaryReleasePoint: { x: -1000, y: -1000 },
      boundaryReleaseStarted: 0,
      longPressBlocked: 0,
      longPressStarted: 0,
      pointerCaptureReleased: 0,
      pointerCaptureStarted: 0,
      pointerDownInside: 0,
      pointerDownOutside: 0,
      pointerMoveInside: 0,
      pointerMoveOutside: 0,
      ready: false,
      sceneInitialized: false,
      skippedZeroSizeInit: 0,
    };

    if (import.meta.env.DEV) {
      (window as any).__divineDavidDebug = debugState;
    }

    function getDavidFrameBounds() {
      const left = width * DAVID_FRAME_BOUNDS.left;
      const top = height * DAVID_FRAME_BOUNDS.top;
      const right = width * DAVID_FRAME_BOUNDS.right;
      const bottom = height * DAVID_FRAME_BOUNDS.bottom;

      return {
        bottom,
        height: bottom - top,
        left,
        right,
        top,
        width: right - left,
      };
    }

    function isInsideDavidFrame(point: Point) {
      const bounds = getDavidFrameBounds();
      return point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.top && point.y <= bounds.bottom;
    }

    function clampToDavidFrame(point: Point) {
      const bounds = getDavidFrameBounds();
      return {
        x: clamp(bounds.left, point.x, bounds.right),
        y: clamp(bounds.top, point.y, bounds.bottom),
      };
    }

    function setPointerInactive() {
      pointer.active = false;
      pointer.insideFrame = false;
      pointer.mx = -1000;
      pointer.my = -1000;
      pointer.tx = 0;
      pointer.ty = 0;
    }

    function updateGlobalPointer(event: PointerEvent) {
      const viewportWidth = Math.max(1, window.innerWidth || document.documentElement.clientWidth || width);
      const viewportHeight = Math.max(1, window.innerHeight || document.documentElement.clientHeight || height);
      globalPointer.active = true;
      globalPointer.tx = clamp(-0.5, event.clientX / viewportWidth - 0.5, 0.5);
      globalPointer.ty = clamp(-0.5, event.clientY / viewportHeight - 0.5, 0.5);
      debugState.lastGlobalPointer = { x: event.clientX, y: event.clientY };
    }

    function cancelDavidInteraction() {
      window.clearTimeout(interaction.longPressTimer);
      window.clearTimeout(interaction.clickTimer);
      interaction.clicks = 0;
      interaction.isDown = false;
      interaction.longPressActive = false;
      interaction.chargeLevel = 0;
      setChargeCenter();
    }

    function finishPointerCapture(event: PointerEvent) {
      if (typeof canvas.hasPointerCapture === 'function' && canvas.hasPointerCapture(event.pointerId)) {
        try {
          canvas.releasePointerCapture(event.pointerId);
          debugState.pointerCaptureReleased++;
        } catch {
          // Ignore non-capturable synthetic pointer events.
        }
      }
    }

    function endChargingButKeepReleaseAnimation() {
      window.clearTimeout(interaction.longPressTimer);
      window.clearTimeout(interaction.clickTimer);
      interaction.clicks = 0;
      interaction.isDown = false;
      interaction.longPressActive = false;
      interaction.chargeLevel = 0;
      setPointerInactive();
    }

    function triggerBoundaryRelease(point: Point, event?: PointerEvent) {
      const edgePoint = clampToDavidFrame(point);
      const bounds = getDavidFrameBounds();
      interaction.chargeX = edgePoint.x;
      interaction.chargeY = edgePoint.y;
      debugState.boundaryReleasePoint = edgePoint;
      debugState.boundaryReleaseStarted++;
      window.dispatchEvent(
        new CustomEvent('divine-david-boundary-release', {
          detail: {
            impactX: clamp(0, (edgePoint.x - bounds.left) / Math.max(bounds.width, 1), 1),
            impactY: clamp(0, (edgePoint.y - bounds.top) / Math.max(bounds.height, 1), 1),
            x: edgePoint.x,
            y: edgePoint.y,
          },
        }),
      );
      releaseChargeBurst(edgePoint.x, edgePoint.y);
      endChargingButKeepReleaseAnimation();

      if (event) {
        finishPointerCapture(event);
      }
    }

    function withDavidFrameClip(drawLayer: () => void) {
      const bounds = getDavidFrameBounds();
      ctx.save();
      ctx.beginPath();
      ctx.rect(bounds.left, bounds.top, bounds.width, bounds.height);
      ctx.clip();
      drawLayer();
      ctx.restore();
    }

    function getChargeLevel(now = performance.now()) {
      if (!interaction.longPressActive) {
        return 0;
      }
      return clamp(0, (now - interaction.chargeStartTime) / 1550, 1);
    }

    function resolveCollapseMode() {
      if (COLLAPSE_MODE === 'cursor' || COLLAPSE_MODE === 'center') {
        return COLLAPSE_MODE;
      }
      const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      const mobileWidth = width < 760;
      return coarsePointer || reducedMotion || mobileWidth ? 'center' : 'cursor';
    }

    function setChargeCenter() {
      const center = clampToDavidFrame({
        x: width * 0.5,
        y: height * 0.54,
      });
      interaction.chargeX = center.x;
      interaction.chargeY = center.y;
    }

    function updateChargeTarget(force = false) {
      const mode = resolveCollapseMode();
      const center = clampToDavidFrame({
        x: width * 0.5,
        y: height * 0.54,
      });
      const canUseCursor =
        mode === 'cursor' && pointer.active && pointer.insideFrame && pointer.mx > -100 && pointer.my > -100;
      const target = canUseCursor ? clampToDavidFrame({ x: pointer.mx, y: pointer.my }) : center;
      const follow = force ? 1 : canUseCursor ? 0.16 : 0.26;

      interaction.chargeX = lerp(interaction.chargeX || target.x, target.x, follow);
      interaction.chargeY = lerp(interaction.chargeY || target.y, target.y, follow);
    }

    function loadImage(url: string): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });
    }

    async function loadDavidSource() {
      try {
        return await loadImage(source);
      } catch {
        return createFallbackDavidSource();
      }
    }

    function createFallbackDavidSource() {
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = 720;
      sourceCanvas.height = 900;
      const sctx = sourceCanvas.getContext('2d')!;

      sctx.fillStyle = '#000';
      sctx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);

      const marble = sctx.createLinearGradient(0, 80, 0, 860);
      marble.addColorStop(0, '#f3f1ec');
      marble.addColorStop(0.52, '#c7c4bd');
      marble.addColorStop(1, '#eee9df');
      sctx.fillStyle = marble;
      sctx.shadowColor = 'rgba(255, 255, 255, 0.22)';
      sctx.shadowBlur = 18;

      sctx.beginPath();
      sctx.ellipse(374, 175, 76, 92, -0.12, 0, Math.PI * 2);
      sctx.fill();

      sctx.beginPath();
      sctx.moveTo(328, 245);
      sctx.bezierCurveTo(245, 305, 236, 470, 292, 626);
      sctx.bezierCurveTo(338, 752, 472, 766, 514, 625);
      sctx.bezierCurveTo(552, 496, 504, 309, 424, 245);
      sctx.closePath();
      sctx.fill();

      sctx.beginPath();
      sctx.moveTo(302, 328);
      sctx.bezierCurveTo(196, 374, 175, 520, 244, 612);
      sctx.lineWidth = 56;
      sctx.lineCap = 'round';
      sctx.strokeStyle = '#d7d3cb';
      sctx.stroke();

      sctx.beginPath();
      sctx.moveTo(467, 330);
      sctx.bezierCurveTo(586, 380, 592, 545, 508, 630);
      sctx.lineWidth = 54;
      sctx.strokeStyle = '#e1ddd3';
      sctx.stroke();

      sctx.shadowBlur = 0;
      sctx.globalCompositeOperation = 'destination-out';
      sctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      sctx.beginPath();
      sctx.ellipse(374, 196, 38, 20, -0.25, 0, Math.PI * 2);
      sctx.fill();
      sctx.globalCompositeOperation = 'source-over';

      return sourceCanvas;
    }

    function getCanvasLayoutSize() {
      const rect = canvas.getBoundingClientRect();
      return {
        width: Math.round(canvas.clientWidth || canvas.offsetWidth || rect.width || 0),
        height: Math.round(canvas.clientHeight || canvas.offsetHeight || rect.height || 0),
      };
    }

    function isUsableCanvasSize(size = getCanvasLayoutSize()) {
      return size.width >= MIN_USABLE_CANVAS_SIZE && size.height >= MIN_USABLE_CANVAS_SIZE;
    }

    function resizeCanvas(options: { rebuildAmbient?: boolean } = {}) {
      const size = getCanvasLayoutSize();
      debugState.canvasWidth = size.width;
      debugState.canvasHeight = size.height;

      if (!isUsableCanvasSize(size)) {
        debugState.skippedZeroSizeInit++;
        return false;
      }

      width = size.width;
      height = size.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_DPR);
      debugState.canvasDpr = pixelRatio;
      canvas.width = Math.max(1, Math.floor(width * pixelRatio));
      canvas.height = Math.max(1, Math.floor(height * pixelRatio));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (options.rebuildAmbient ?? true) {
        buildAmbientField();
      }
      return true;
    }

    function luminanceAt(data: Uint8ClampedArray, sampleWidth: number, sampleHeight: number, x: number, y: number) {
      const sx = clamp(0, Math.round(x), sampleWidth - 1);
      const sy = clamp(0, Math.round(y), sampleHeight - 1);
      const index = (sy * sampleWidth + sx) * 4;
      return (data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722) / 255;
    }

    function presenceAt(data: Uint8ClampedArray, sampleWidth: number, sampleHeight: number, x: number, y: number) {
      const sx = clamp(0, Math.round(x), sampleWidth - 1);
      const sy = clamp(0, Math.round(y), sampleHeight - 1);
      const index = (sy * sampleWidth + sx) * 4;
      const alpha = data[index + 3] / 255;
      const lum = (data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722) / 255;
      return alpha * smoothstep(0.045, 0.34, lum);
    }

    // Ported from original Divine David demo: makeScratchNodes / buildBodyStrokes.
    function makeScratchNodes(length: number, angle: number, bend: number, nodeCount: number, phase: number) {
      const nodes = [];
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const crossCos = Math.cos(angle + Math.PI * 0.5);
      const crossSin = Math.sin(angle + Math.PI * 0.5);

      for (let i = 0; i < nodeCount; i++) {
        const t = i / (nodeCount - 1);
        const signed = t - 0.5;
        const along = signed * length + (random() - 0.5) * length * 0.11;
        const curve = Math.sin(t * Math.PI * 1.9 + phase) * bend * length;
        const scratch = (random() - 0.5) * length * (0.08 + random() * 0.08);
        const cross = curve + scratch;

        nodes.push({
          x: cos * along + crossCos * cross,
          y: sin * along + crossSin * cross,
          z: (random() - 0.5) * 0.012,
        });
      }

      return nodes;
    }

    function buildBodyStrokes(sourceImage: HTMLImageElement | HTMLCanvasElement) {
      const sampleWidth = Math.min(620, Math.max(320, sourceImage.width || 620));
      const sampleHeight = Math.round(sampleWidth * ((sourceImage.height || 900) / (sourceImage.width || 720)));
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = sampleWidth;
      sourceCanvas.height = sampleHeight;
      const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true })!;
      sourceContext.clearRect(0, 0, sampleWidth, sampleHeight);
      sourceContext.drawImage(sourceImage, 0, 0, sampleWidth, sampleHeight);

      const imageData = sourceContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
      let minX = sampleWidth;
      let minY = sampleHeight;
      let maxX = 0;
      let maxY = 0;
      let found = false;

      for (let y = 0; y < sampleHeight; y += 2) {
        for (let x = 0; x < sampleWidth; x += 2) {
          if (presenceAt(imageData, sampleWidth, sampleHeight, x, y) > 0.08) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
            found = true;
          }
        }
      }

      if (!found) {
        minX = sampleWidth * 0.24;
        maxX = sampleWidth * 0.76;
        minY = sampleHeight * 0.08;
        maxY = sampleHeight * 0.94;
      }

      const boundsWidth = Math.max(1, maxX - minX);
      const boundsHeight = Math.max(1, maxY - minY);
      const centerX = (minX + maxX) * 0.5;
      const centerY = (minY + maxY) * 0.5;
      modelBounds = {
        aspect: boundsWidth / boundsHeight,
        top: (minY - centerY) / boundsHeight,
        bottom: (maxY - centerY) / boundsHeight,
      };

      const candidates = [];
      const stride = width < 760 ? 3 : 2;

      for (let y = minY + 2; y < maxY - 2; y += stride) {
        for (let x = minX + 2; x < maxX - 2; x += stride) {
          const presence = presenceAt(imageData, sampleWidth, sampleHeight, x, y);
          if (presence < 0.04) {
            continue;
          }

          const lum = luminanceAt(imageData, sampleWidth, sampleHeight, x, y);
          const gx =
            luminanceAt(imageData, sampleWidth, sampleHeight, x + 2, y) -
            luminanceAt(imageData, sampleWidth, sampleHeight, x - 2, y);
          const gy =
            luminanceAt(imageData, sampleWidth, sampleHeight, x, y + 2) -
            luminanceAt(imageData, sampleWidth, sampleHeight, x, y - 2);
          const edge = clamp(0, Math.hypot(gx, gy) * 4.8, 1);
          const density = clamp(0.01, presence * (0.12 + edge * 0.72 + Math.pow(lum, 0.85) * 0.25), 0.92);

          if (random() < density) {
            candidates.push({ x, y, lum, gx, gy, edge, presence });
          }
        }
      }

      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const tmp: any = candidates[i];
        candidates[i] = candidates[j];
        candidates[j] = tmp;
      }

      bodyStrokes.length = 0;
      const targetCount = width < 760 ? 1150 : 1800;
      const chosen = candidates.slice(0, targetCount);

      for (const candidate of chosen) {
        const nx = (candidate.x - centerX) / boundsHeight;
        const ny = (candidate.y - centerY) / boundsHeight;
        const tangent = Math.atan2(candidate.gy, candidate.gx) + Math.PI * 0.5;
        const anatomicalFlow = -Math.PI * 0.56 + nx * 0.78 + Math.sin(ny * 8.2) * 0.18;
        const contourBias = smoothstep(0.04, 0.28, candidate.edge);
        const angle =
          mixAngle(anatomicalFlow, tangent, contourBias * 0.92) +
          (random() - 0.5) * (0.8 - contourBias * 0.45);
        const lengthPixels =
          (7 + Math.pow(random(), 1.8) * 24 + candidate.edge * 12) *
          (width < 760 ? 0.86 : 1);
        const length = lengthPixels / boundsHeight;
        const nodeCount = 4 + Math.floor(random() * 4);
        const bend = (random() - 0.5) * (0.34 + candidate.edge * 0.16);
        const phase = random() * Math.PI * 2;
        const tone = clamp(118, 138 + candidate.lum * 100 + candidate.edge * 28 + random() * 26, 248);

        bodyStrokes.push({
          x: nx,
          y: ny,
          z: (candidate.lum - 0.48) * 0.12 + candidate.edge * 0.1 + (random() - 0.5) * 0.04,
          nodes: makeScratchNodes(length, angle, bend, nodeCount, phase),
          alpha: clamp(
            0.025,
            0.048 + Math.pow(candidate.lum, 0.74) * 0.255 + candidate.edge * 0.16 + random() * 0.04,
            0.56,
          ),
          width: clamp(0.2, 0.34 + random() * 0.5 + candidate.edge * 0.42, 1.18),
          tone,
          edge: candidate.edge,
          brightness: candidate.lum,
          redAffinity: clamp(0.2, 0.26 + candidate.edge * 0.55 + random() * 0.22, 1),
          chargeWeight: clamp(0.5, 0.62 + candidate.edge * 0.36 + random() * 0.28, 1.12),
          phase,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          burst: 0,
          redReveal: 0,
          lastX: width * 0.5,
          lastY: height * 0.54,
        });
      }
    }

    // Ported from original Divine David demo: buildWingStrokes.
    function buildWingStrokes() {
      wingStrokes.length = 0;
      const countPerSide = width < 760 ? 72 : 104;

      for (const side of [-1, 1]) {
        for (let i = 0; i < countPerSide; i++) {
          const lane = random();
          const rootX = side * (0.07 + random() * 0.05);
          const rootY = -0.08 + (random() - 0.5) * 0.24;
          const tipX = side * (0.26 + Math.pow(lane, 0.72) * 0.47 + random() * 0.09);
          const tipY = -0.45 + lane * 0.82 + (random() - 0.5) * 0.12;
          const lift = -0.05 + (random() - 0.5) * 0.09;
          const nodeCount = 5 + Math.floor(random() * 4);
          const points = [];

          for (let j = 0; j < nodeCount; j++) {
            const t = j / (nodeCount - 1);
            const bow = Math.sin(t * Math.PI);
            const fray = (random() - 0.5) * (0.01 + t * 0.018);
            points.push({
              x: lerp(rootX, tipX, t) + side * bow * (0.035 + lane * 0.07) + fray,
              y: lerp(rootY, tipY, t) + bow * lift + (random() - 0.5) * 0.018,
              z: -0.18 - lane * 0.08 + (random() - 0.5) * 0.04,
            });
          }

          wingStrokes.push({
            points,
            alpha: 0.028 + random() * 0.062,
            width: 0.22 + random() * 0.48,
            tone: 132 + random() * 74,
            phase: random() * Math.PI * 2,
            redAffinity: 0.16 + lane * 0.22,
          });
        }
      }
    }

    // Ported from original Divine David demo: buildHaloArcs.
    function buildHaloArcs() {
      haloArcs.length = 0;

      for (let lane = 0; lane < 4; lane++) {
        const segments = lane === 0 ? 28 : 18;
        for (let i = 0; i < segments; i++) {
          if (random() < 0.26) {
            continue;
          }

          haloArcs.push({
            start: (i / segments) * Math.PI * 2 + random() * 0.08,
            span: 0.1 + random() * 0.34,
            lane: lane - 1.4,
            alpha: 0.08 + random() * 0.12,
            width: 0.22 + random() * 0.38,
            phase: random() * Math.PI * 2,
          });
        }
      }
    }

    // Ported from original Divine David demo: buildOrbitBand.
    function buildOrbitBand() {
      orbitArcs.length = 0;
      orbitDust.length = 0;

      for (let lane = 0; lane < 6; lane++) {
        const segments = 42;
        for (let i = 0; i < segments; i++) {
          if (random() < 0.32) {
            continue;
          }

          orbitArcs.push({
            start: (i / segments) * Math.PI * 2 + random() * 0.12,
            span: 0.08 + random() * 0.28,
            lane: lane - 2.5,
            alpha: 0.04 + random() * 0.082,
            width: 0.2 + random() * 0.42,
            phase: random() * Math.PI * 2,
            speed: (random() - 0.5) * 0.00032,
            redAffinity: 0.16 + random() * 0.22,
          });
        }
      }

      const dustCount = width < 760 ? 78 : 128;
      for (let i = 0; i < dustCount; i++) {
        orbitDust.push({
          a: random() * Math.PI * 2,
          lane: (random() - 0.5) * 5.2,
          r: 0.22 + random() * 0.62,
          size: 0.25 + random() * 0.9,
          alpha: 0.038 + random() * 0.16,
          phase: random() * Math.PI * 2,
        });
      }
    }

    // Ported from original Divine David demo: buildAmbientField.
    function buildAmbientField() {
      ambientStrokes.length = 0;
      ambientDust.length = 0;
      const scratchCount = width < 760 ? 26 : 76;
      const dustCount = width < 760 ? 46 : 150;

      for (let i = 0; i < scratchCount; i++) {
        const x = random() * width;
        const y = random() * height;
        const length = 16 + random() * 74;
        const angle = random() * Math.PI * 2;
        const nodeCount = 4 + Math.floor(random() * 4);
        const points = [];

        for (let j = 0; j < nodeCount; j++) {
          const t = j / (nodeCount - 1) - 0.5;
          const wave = Math.sin((t + 0.5) * Math.PI * 1.6 + random() * 2) * length * (random() - 0.5) * 0.12;
          points.push({
            x: x + Math.cos(angle) * length * t + Math.cos(angle + Math.PI * 0.5) * wave + (random() - 0.5) * 8,
            y: y + Math.sin(angle) * length * t + Math.sin(angle + Math.PI * 0.5) * wave + (random() - 0.5) * 8,
          });
        }

        ambientStrokes.push({
          points,
          alpha: 0.01 + random() * 0.045,
          width: 0.18 + random() * 0.4,
          tone: 95 + random() * 70,
          phase: random() * Math.PI * 2,
        });
      }

      for (let i = 0; i < dustCount; i++) {
        ambientDust.push({
          x: random() * width,
          y: random() * height,
          size: 0.25 + random() * 0.9,
          alpha: 0.018 + random() * 0.08,
          phase: random() * Math.PI * 2,
        });
      }
    }

    function rebuildProceduralLayers() {
      buildWingStrokes();
      buildHaloArcs();
      buildOrbitBand();
      buildAmbientField();
    }

    function projectPoint(point: any, state: any) {
      const yawCos = Math.cos(state.yaw);
      const yawSin = Math.sin(state.yaw);
      const pitchCos = Math.cos(state.pitch);
      const pitchSin = Math.sin(state.pitch);
      const x0 = point.x;
      const y0 = point.y;
      const z0 = point.z || 0;
      const x1 = x0 * yawCos + z0 * yawSin;
      const z1 = z0 * yawCos - x0 * yawSin;
      const y1 = y0 * pitchCos - z1 * pitchSin;
      const z2 = z1 * pitchCos + y0 * pitchSin;
      const perspective = 1 / (1 + z2 * 0.56);

      return {
        x: state.cx + x1 * state.scale * perspective,
        y: state.cy + y1 * state.scale * perspective,
        z: z2,
        p: perspective,
      };
    }

    function getSceneState(time: number) {
      const minSide = Math.min(width, height);
      const scale = Math.min(height * 0.82, width * (width < 760 ? 1.18 : 0.96));

      return {
        width,
        height,
        minSide,
        scale,
        cx: width * 0.5 + globalPointer.x * minSide * 0.034,
        cy: height * (width < 760 ? 0.55 : 0.545) + globalPointer.y * minSide * 0.026,
        yaw: globalPointer.x * 0.34 + Math.sin(time * 0.00018) * 0.014,
        pitch: -globalPointer.y * 0.22 + Math.cos(time * 0.00016) * 0.01,
      };
    }

    function updateStrokeMotion(stroke: any, center: any, state: any, delta: number, chargeLevel: number) {
      const dt = Math.min(2.4, delta / 16.67);
      const radius = state.minSide * 0.145;
      let hover = 0;

      if (pointer.active && !interaction.longPressActive) {
        const dx = center.x + stroke.ox - pointer.mx;
        const dy = center.y + stroke.oy - pointer.my;
        const distance = Math.hypot(dx, dy);

        if (distance < radius) {
          hover = Math.pow(1 - distance / radius, 2);
          const safe = Math.max(distance, 0.001);
          const force = hover * (0.42 + stroke.edge * 0.42);
          stroke.vx += (dx / safe) * force * dt;
          stroke.vy += (dy / safe) * force * dt;
        }
      }

      if (chargeLevel > 0) {
        const dx = center.x + stroke.ox - interaction.chargeX;
        const dy = center.y + stroke.oy - interaction.chargeY;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const pull = chargeLevel * chargeLevel * (0.38 + stroke.chargeWeight * 0.5);
        stroke.vx -= (dx / distance) * pull * dt;
        stroke.vy -= (dy / distance) * pull * dt;
      }

      stroke.vx += -stroke.ox * 0.018 * dt;
      stroke.vy += -stroke.oy * 0.018 * dt;
      stroke.vx *= Math.pow(0.884, dt);
      stroke.vy *= Math.pow(0.884, dt);
      stroke.ox += stroke.vx * dt;
      stroke.oy += stroke.vy * dt;
      stroke.ox *= Math.pow(0.992, dt);
      stroke.oy *= Math.pow(0.992, dt);

      stroke.burst = Math.max(0, stroke.burst - delta / 980);
      stroke.redReveal = Math.max(0, stroke.redReveal - delta / 2500);

      return hover;
    }

    // Ported from original Divine David demo: drawScratchPath and ambient/body rendering.
    function drawScratchPath(points: Point[], color: string, strokeWidth: number, alpha: number, texturePhase = 0, texture = 0.35) {
      if (points.length < 3 || alpha <= 0.001 || strokeWidth <= 0.02) {
        return;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length - 2; i++) {
        const midX = (points[i].x + points[i + 1].x) * 0.5;
        const midY = (points[i].y + points[i + 1].y) * 0.5;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }

      const penultimate = points[points.length - 2];
      const last = points[points.length - 1];
      ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);
      ctx.stroke();

      if (texture > 0.82 && points.length > 4) {
        const offset = Math.sin(texturePhase) * 0.8;
        const start = 1 + (Math.floor(Math.abs(Math.sin(texturePhase * 1.7)) * (points.length - 3)) % (points.length - 3));
        const end = Math.min(points.length - 1, start + 2 + Math.floor(Math.abs(Math.cos(texturePhase)) * 2));

        ctx.globalAlpha = alpha * 0.42;
        ctx.lineWidth = Math.max(0.12, strokeWidth * 0.54);
        ctx.beginPath();
        ctx.moveTo(points[start].x + offset, points[start].y - offset * 0.45);

        for (let i = start + 1; i <= end; i++) {
          const previous = points[i - 1];
          const point = points[i];
          ctx.quadraticCurveTo(
            previous.x + offset,
            previous.y - offset * 0.45,
            point.x + offset * 0.5,
            point.y - offset * 0.25,
          );
        }

        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    function drawAmbient(time: number, state: any) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#020202';
      ctx.fillRect(0, 0, width, height);

      const grain = ctx.createRadialGradient(
        state.width * 0.5,
        state.height * 0.5,
        state.scale * 0.08,
        state.width * 0.5,
        state.height * 0.5,
        state.scale * 0.74,
      );
      grain.addColorStop(0, 'rgba(255, 255, 255, 0.018)');
      grain.addColorStop(0.42, 'rgba(255, 255, 255, 0.007)');
      grain.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grain;
      ctx.fillRect(0, 0, width, height);

      for (const stroke of ambientStrokes) {
        const points = stroke.points.map((point: Point, index: number) => ({
          x: point.x + Math.sin(time * 0.00016 + stroke.phase + index) * 1.2,
          y: point.y + Math.cos(time * 0.00014 + stroke.phase + index) * 1.1,
        }));
        drawScratchPath(
          points,
          colorMix(stroke.tone, 0, 1),
          stroke.width,
          stroke.alpha * (0.72 + Math.sin(time * 0.0005 + stroke.phase) * 0.22),
          stroke.phase + time * 0.0002,
          0.5,
        );
      }

      for (const dust of ambientDust) {
        const alpha = dust.alpha * (0.68 + Math.sin(time * 0.0007 + dust.phase) * 0.28);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#f2f2f2';
        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    // Ported from original Divine David demo: buildEllipseStroke / drawSacredOrbit / drawHalo.
    function buildEllipseStroke(cx: number, cy: number, rx: number, ry: number, rotation: number, a0: number, span: number, options: any = {}) {
      const points = [];
      const steps = options.steps || 7;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const phase = options.phase || 0;
      const wobble = options.wobble || 0;

      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const a = a0 + span * t;
        const noise = Math.sin(a * 3.1 + phase) * wobble + Math.sin(a * 7.7 + phase * 1.8) * wobble * 0.42;
        const x = Math.cos(a) * (rx + noise);
        const y = Math.sin(a) * (ry + noise * 0.38);
        points.push({
          x: cx + x * cos - y * sin,
          y: cy + x * sin + y * cos,
        });
      }

      return points;
    }

    function drawSacredOrbit(time: number, state: any, chargeLevel: number) {
      const activation = Math.max(interaction.orbitActivation, chargeLevel, interaction.releasePulse * 0.75);
      const cx = state.cx + globalPointer.x * state.scale * 0.018;
      const cy = state.cy - state.scale * 0.025 + globalPointer.y * state.scale * 0.014;
      const rx = state.scale * (0.46 + activation * 0.035);
      const ry = state.scale * (0.152 + activation * 0.018);
      const rotation = -0.16 + state.yaw * 0.72 + Math.sin(time * 0.00018) * 0.018;

      ctx.globalCompositeOperation = 'screen';
      for (const arc of orbitArcs) {
        const laneOffset = arc.lane * state.scale * 0.0065;
        const laneRx = rx + laneOffset * 1.8;
        const laneRy = ry + laneOffset * 0.7;
        const a0 = arc.start + time * arc.speed + Math.sin(time * 0.00019 + arc.phase) * 0.018;
        const points = buildEllipseStroke(cx, cy, laneRx, laneRy, rotation, a0, arc.span, {
          phase: arc.phase + time * 0.00028,
          wobble: state.scale * (0.0018 + activation * 0.0015),
          steps: 5 + Math.floor(arc.span * 12),
        });
        const redMix = activation * (0.22 + arc.redAffinity) + Math.max(0, Math.sin(time * 0.00038 + arc.phase)) * 0.025;
        const tone = 142 + activation * 42;
        drawScratchPath(
          points,
          colorMix(tone, redMix, 1),
          arc.width * (1 + activation * 0.35),
          arc.alpha * (1 + activation * 1.55),
          arc.phase + time * 0.00044,
          0.82,
        );
      }

      for (const node of orbitDust) {
        const angle = node.a + time * 0.00008 * (0.4 + node.r);
        const laneOffset = node.lane * state.scale * 0.006;
        const x0 = Math.cos(angle) * (rx + laneOffset);
        const y0 = Math.sin(angle) * (ry + laneOffset * 0.38);
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const x = cx + x0 * cos - y0 * sin;
        const y = cy + x0 * sin + y0 * cos;
        const front = 0.45 + Math.sin(angle) * 0.55;
        const alpha = node.alpha * (0.32 + front * 0.85) * (1 + activation * 1.2);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = activation > 0.25 ? 'rgba(207, 48, 42, 1)' : 'rgba(236, 236, 236, 1)';
        ctx.beginPath();
        ctx.arc(x, y, node.size * (0.55 + front * 0.65), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawWings(time: number, state: any, chargeLevel: number) {
      const activation = Math.max(chargeLevel * 0.82, interaction.releasePulse * 0.7, interaction.orbitActivation * 0.34);
      ctx.globalCompositeOperation = 'screen';

      for (const wing of wingStrokes) {
        const points = wing.points.map((point: Point, index: number) => {
          const drift = Math.sin(time * 0.00034 + wing.phase + index) * 0.006;
          return projectPoint(
            {
              x: point.x + drift,
              y: point.y + Math.cos(time * 0.0003 + wing.phase + index * 0.7) * 0.004,
              z: point.z,
            },
            state,
          );
        });
        const redMix = activation * wing.redAffinity;
        const alpha = wing.alpha * (1 + activation * 1.9) * (0.86 + Math.sin(time * 0.00024 + wing.phase) * 0.16);
        drawScratchPath(
          points,
          colorMix(wing.tone, redMix, 1),
          wing.width * (1 + activation * 0.45),
          alpha,
          wing.phase + time * 0.00032,
          0.78,
        );
      }

      ctx.globalCompositeOperation = 'source-over';
    }

    function drawBody(time: number, state: any, delta: number, chargeLevel: number) {
      const collapseBase = chargeLevel * chargeLevel;
      ctx.globalCompositeOperation = 'screen';

      for (const stroke of bodyStrokes) {
        const center = projectPoint(stroke, state);
        const hover = updateStrokeMotion(stroke, center, state, delta, chargeLevel);
        const collapse = collapseBase * stroke.chargeWeight;
        const orbit = 7 + stroke.edge * 9;
        const collapseX = interaction.chargeX + Math.cos(stroke.phase + time * 0.004) * orbit * chargeLevel;
        const collapseY = interaction.chargeY + Math.sin(stroke.phase * 1.3 + time * 0.0036) * orbit * chargeLevel;
        const points = [];

        for (const node of stroke.nodes) {
          const projected = projectPoint(
            {
              x: stroke.x + node.x,
              y: stroke.y + node.y,
              z: stroke.z + node.z,
            },
            state,
          );
          let x = projected.x + stroke.ox;
          let y = projected.y + stroke.oy;

          if (collapse > 0.002) {
            const squeeze = clamp(0, collapse * 0.94, 0.92);
            x = lerp(x, collapseX + (projected.x - center.x) * 0.08, squeeze);
            y = lerp(y, collapseY + (projected.y - center.y) * 0.08, squeeze);
          }

          points.push({ x, y });
        }

        stroke.lastX = center.x + stroke.ox;
        stroke.lastY = center.y + stroke.oy;

        const depth = clamp(0.45, 0.92 + center.z * 0.42, 1.25);
        const pulse = 0.86 + Math.sin(time * 0.0011 + stroke.phase) * 0.14;
        const redMix = clamp(
          0,
          stroke.redReveal * 0.88 + stroke.burst * 0.36 + hover * 0.32 + chargeLevel * stroke.redAffinity * 0.58,
          1,
        );
        const alpha =
          stroke.alpha *
          pulse *
          depth *
          (1 + hover * 0.42 + stroke.burst * 0.92 + chargeLevel * 0.36) *
          (1 - collapseBase * 0.16);
        const strokeWidth = stroke.width * center.p * (1 + hover * 0.16 + stroke.burst * 0.22 + chargeLevel * 0.14);

        drawScratchPath(
          points,
          colorMix(stroke.tone, redMix, 1),
          strokeWidth,
          clamp(0.004, alpha, 0.72),
          stroke.phase + time * 0.00062,
          stroke.edge > 0.12 || stroke.brightness > 0.55 ? 0.68 : 0.34,
        );
      }

      ctx.globalCompositeOperation = 'source-over';
    }

    function drawHalo(time: number, state: any, chargeLevel: number) {
      const head = projectPoint({ x: 0.015, y: modelBounds.top - 0.085, z: 0.08 }, state);
      const activation = Math.max(chargeLevel, interaction.releasePulse * 0.75, interaction.orbitActivation * 0.3);
      const rx = state.scale * (0.138 + activation * 0.014);
      const ry = state.scale * (0.033 + activation * 0.005);
      const rotation = state.yaw * 0.75 + Math.sin(time * 0.00022) * 0.05;

      ctx.globalCompositeOperation = 'screen';
      for (const arc of haloArcs) {
        const laneOffset = arc.lane * state.scale * 0.0032;
        const points = buildEllipseStroke(
          head.x,
          head.y,
          rx + laneOffset,
          ry + laneOffset * 0.44,
          rotation,
          arc.start + time * 0.00022 + Math.sin(time * 0.00021 + arc.phase) * 0.024,
          arc.span,
          {
            phase: arc.phase + time * 0.00045,
            wobble: state.scale * (0.0012 + activation * 0.001),
            steps: 5,
          },
        );
        const redMix = activation * 0.34 + Math.max(0, Math.sin(time * 0.0006 + arc.phase)) * 0.035;
        drawScratchPath(
          points,
          colorMix(202, redMix, 1),
          arc.width * (1 + activation * 0.22),
          arc.alpha * (1 + activation * 1.35),
          arc.phase + time * 0.0003,
          0.86,
        );
      }

      if (activation > 0.05) {
        const glow = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, rx * 1.8);
        glow.addColorStop(0, `rgba(180, 34, 31, ${0.05 * activation})`);
        glow.addColorStop(0.44, `rgba(220, 220, 220, ${0.018 * activation})`);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = glow;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.ellipse(head.x, head.y, rx * 1.9, ry * 5.4, rotation, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function drawChargeCore(time: number, chargeLevel: number) {
      if (chargeLevel <= 0 && interaction.releasePulse <= 0.01) {
        return;
      }

      const pulse = Math.max(chargeLevel, interaction.releasePulse);
      const cx = interaction.chargeX;
      const cy = interaction.chargeY;
      const radius = 18 + pulse * 56;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      core.addColorStop(0, `rgba(255, 242, 232, ${0.38 * pulse})`);
      core.addColorStop(0.18, `rgba(210, 44, 36, ${0.34 * pulse})`);
      core.addColorStop(0.52, `rgba(132, 10, 9, ${0.13 * pulse})`);
      core.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = core;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * Math.PI * 2 + time * 0.0012;
        const inner = radius * (0.18 + (i % 3) * 0.055);
        const outer = radius * (0.55 + Math.sin(time * 0.001 + i) * 0.12);
        const points = [
          {
            x: cx + Math.cos(angle) * inner,
            y: cy + Math.sin(angle) * inner,
          },
          {
            x: cx + Math.cos(angle + 0.08) * (inner + outer) * 0.5 + Math.sin(i) * 2,
            y: cy + Math.sin(angle + 0.08) * (inner + outer) * 0.5 + Math.cos(i) * 2,
          },
          {
            x: cx + Math.cos(angle + 0.18) * outer,
            y: cy + Math.sin(angle + 0.18) * outer,
          },
        ];
        drawScratchPath(points, colorMix(215, 0.78, 1), 0.36 + pulse * 0.52, 0.08 * pulse, i + time * 0.001, 0.7);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    }

    function draw(time: number) {
      if (disposed) {
        return;
      }

      const delta = Math.min(50, time - (lastFrameTime || time));
      lastFrameTime = time;
      globalPointer.x = lerp(globalPointer.x, globalPointer.tx, 0.07);
      globalPointer.y = lerp(globalPointer.y, globalPointer.ty, 0.07);
      pointer.x = lerp(pointer.x, pointer.tx, 0.09);
      pointer.y = lerp(pointer.y, pointer.ty, 0.09);

      if (interaction.longPressActive) {
        updateChargeTarget();
      }

      interaction.chargeLevel = getChargeLevel(time);
      debugState.chargeActive = interaction.chargeLevel > 0.01;
      interaction.releasePulse = Math.max(0, interaction.releasePulse - delta / 760);
      interaction.orbitActivation = Math.max(0, interaction.orbitActivation - delta / 1200);

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#020202';
      ctx.fillRect(0, 0, width, height);

      const state = getSceneState(time);

      withDavidFrameClip(() => {
        drawAmbient(time, state);

        if (ready) {
          drawSacredOrbit(time, state, interaction.chargeLevel);
          drawWings(time, state, interaction.chargeLevel);
          drawBody(time, state, delta, interaction.chargeLevel);
          drawHalo(time, state, interaction.chargeLevel);
          drawChargeCore(time, interaction.chargeLevel);
        }
      });

      animationId = requestAnimationFrame(draw);
    }

    function getLocalPointer(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * (width / Math.max(rect.width, 1)),
        y: (event.clientY - rect.top) * (height / Math.max(rect.height, 1)),
      };
    }

    function updatePointer(event: PointerEvent) {
      const local = getLocalPointer(event);
      const insideFrame = isInsideDavidFrame(local);
      debugState.lastInsideFrame = insideFrame;
      debugState.lastLocalPointer = { x: local.x, y: local.y };

      if (!insideFrame) {
        debugState.pointerMoveOutside++;
        setPointerInactive();
        return false;
      }

      debugState.pointerMoveInside++;
      pointer.active = true;
      pointer.insideFrame = true;
      pointer.mx = local.x;
      pointer.my = local.y;
      pointer.tx = pointer.mx / width - 0.5;
      pointer.ty = pointer.my / height - 0.5;
      return true;
    }

    function handlePointerMove(event: PointerEvent) {
      const local = getLocalPointer(event);
      const wasChargingInside = interaction.isDown && interaction.longPressActive;
      const insideFrame = updatePointer(event);

      if (!insideFrame && wasChargingInside) {
        triggerBoundaryRelease(local, event);
        return;
      }

      if (!insideFrame && interaction.isDown) {
        cancelDavidInteraction();
      }
    }

    // Ported from original Divine David demo: click, double-click, and long-press burst interactions.
    function triggerBurst(x: number, y: number, options: any = {}) {
      if (!ready || !bodyStrokes.length) {
        return;
      }
      if (!isInsideDavidFrame({ x, y })) {
        return;
      }

      const stateMin = Math.min(width, height);
      const strong = options.strong || false;
      const radius = stateMin * (strong ? 0.54 : 0.23);
      const power = strong ? 32 : 8.5;
      let affected = 0;

      for (const stroke of bodyStrokes) {
        const dx = stroke.lastX - x;
        const dy = stroke.lastY - y;
        const distance = Math.hypot(dx, dy);
        const looseHit = strong && random() < 0.46;

        if (distance < radius || looseHit) {
          const safe = Math.max(distance, 1);
          const falloff = looseHit ? 0.35 + random() * 0.35 : Math.pow(1 - distance / radius, strong ? 0.52 : 1.18);
          let nx = dx / safe;
          let ny = dy / safe;

          if (distance < 3 || looseHit) {
            const angle = stroke.phase + random() * Math.PI * 2;
            nx = Math.cos(angle);
            ny = Math.sin(angle);
          }

          const impulse = power * falloff * (0.68 + stroke.edge * 0.52 + stroke.brightness * 0.18);
          stroke.vx += nx * impulse;
          stroke.vy += ny * impulse;
          stroke.burst = Math.max(stroke.burst, strong ? 1.22 : 0.52);
          stroke.redReveal = Math.max(stroke.redReveal, strong ? 0.86 : 0.24);
          affected++;
        }
      }

      interaction.orbitActivation = Math.max(interaction.orbitActivation, strong ? 0.82 : 0.28);
      pointer.active = true;
      pointer.insideFrame = true;
      pointer.mx = x;
      pointer.my = y;

      if (!affected && bodyStrokes.length) {
        const stroke = bodyStrokes[Math.floor(random() * bodyStrokes.length)];
        stroke.burst = Math.max(stroke.burst, strong ? 1 : 0.45);
        stroke.redReveal = Math.max(stroke.redReveal, strong ? 0.7 : 0.22);
      }
    }

    function releaseChargeBurst(x: number, y: number) {
      if (!ready || !bodyStrokes.length) {
        return;
      }
      if (!isInsideDavidFrame({ x, y })) {
        return;
      }

      const chargeLevel = Math.max(0.45, interaction.chargeLevel || getChargeLevel());

      for (const stroke of bodyStrokes) {
        let dx = stroke.lastX - x;
        let dy = stroke.lastY - y;
        let distance = Math.hypot(dx, dy);

        if (distance < 4) {
          const angle = stroke.phase + random() * Math.PI * 2;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          distance = 1;
        }

        const nx = dx / distance;
        const ny = dy / distance;
        const impulse = (13 + chargeLevel * 23) * (0.56 + stroke.edge * 0.42 + random() * 0.28);
        stroke.vx += nx * impulse;
        stroke.vy += ny * impulse;
        stroke.burst = Math.max(stroke.burst, 1.18 + chargeLevel * 0.48);
        stroke.redReveal = Math.max(stroke.redReveal, 1);
      }

      interaction.releasePulse = 1;
      interaction.orbitActivation = 1;
    }

    function registerClick(x: number, y: number) {
      if (!isInsideDavidFrame({ x, y })) {
        return;
      }

      interaction.clicks++;

      if (interaction.clicks === 1) {
        interaction.clickTimer = window.setTimeout(() => {
          interaction.clicks = 0;
          triggerBurst(x, y, { strong: false });
        }, interaction.clickCooldown);
      } else if (interaction.clicks === 2) {
        window.clearTimeout(interaction.clickTimer);
        interaction.clicks = 0;
        triggerBurst(x, y, { strong: true });
      }
    }

    function handlePointerLeave(event: PointerEvent) {
      if (interaction.isDown && interaction.longPressActive) {
        triggerBoundaryRelease(getLocalPointer(event), event);
        return;
      }

      cancelDavidInteraction();
      setPointerInactive();
    }

    function handlePointerDown(event: PointerEvent) {
      const insideFrame = updatePointer(event);
      if (!insideFrame) {
        debugState.pointerDownOutside++;
        cancelDavidInteraction();
        return;
      }

      debugState.pointerDownInside++;
      if (typeof canvas.setPointerCapture === 'function' && !canvas.hasPointerCapture(event.pointerId)) {
        try {
          canvas.setPointerCapture(event.pointerId);
          debugState.pointerCaptureStarted++;
        } catch {
          // Synthetic pointer events used by test harnesses may not be capturable.
        }
      }

      interaction.isDown = true;
      interaction.longPressActive = false;
      window.clearTimeout(interaction.longPressTimer);
      updateChargeTarget(true);

      interaction.longPressTimer = window.setTimeout(() => {
        if (!interaction.isDown || !pointer.insideFrame) {
          debugState.longPressBlocked++;
          return;
        }

        interaction.longPressActive = true;
        debugState.longPressStarted++;
        interaction.chargeStartTime = performance.now();
        interaction.clicks = 0;
        window.clearTimeout(interaction.clickTimer);
        updateChargeTarget(true);
      }, 380);
    }

    function handlePointerUp(event: PointerEvent) {
      const local = getLocalPointer(event);
      const wasChargingInside = interaction.longPressActive;
      const insideFrame = updatePointer(event);
      window.clearTimeout(interaction.longPressTimer);
      interaction.isDown = false;
      finishPointerCapture(event);

      if (!insideFrame) {
        if (wasChargingInside) {
          triggerBoundaryRelease(local);
        } else {
          cancelDavidInteraction();
        }
        return;
      }

      if (interaction.longPressActive) {
        releaseChargeBurst(interaction.chargeX, interaction.chargeY);
        interaction.longPressActive = false;
        return;
      }

      registerClick(pointer.mx, pointer.my);
    }

    function rebuildSceneFromSource() {
      if (disposed || !currentSource) {
        return false;
      }
      if (!resizeCanvas({ rebuildAmbient: false })) {
        return false;
      }

      buildBodyStrokes(currentSource);
      rebuildProceduralLayers();
      setChargeCenter();
      ready = true;
      sceneInitialized = true;
      debugState.ready = true;
      debugState.sceneInitialized = true;

      if (!animationId) {
        lastFrameTime = 0;
        animationId = requestAnimationFrame(draw);
      }

      return true;
    }

    function handleResize() {
      window.clearTimeout(resizeTimer);
      const resized = resizeCanvas({ rebuildAmbient: sceneInitialized });
      if (!resized) {
        return;
      }
      if (!currentSource) {
        return;
      }
      if (!sceneInitialized) {
        rebuildSceneFromSource();
        return;
      }
      resizeTimer = window.setTimeout(() => {
        if (disposed || !currentSource) {
          return;
        }
        if (!resizeCanvas({ rebuildAmbient: false })) {
          return;
        }
        buildBodyStrokes(currentSource);
        rebuildProceduralLayers();
        setChargeCenter();
      }, 180);
    }

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    window.addEventListener('pointermove', updateGlobalPointer);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    async function init() {
      currentSource = await loadDavidSource();
      if (disposed) {
        return;
      }
      rebuildSceneFromSource();
    }

    init();

    return () => {
      disposed = true;
      ready = false;
      sceneInitialized = false;
      debugState.ready = false;
      debugState.sceneInitialized = false;
      cancelAnimationFrame(animationId);
      animationId = 0;
      window.clearTimeout(resizeTimer);
      window.clearTimeout(interaction.longPressTimer);
      window.clearTimeout(interaction.clickTimer);
      if (import.meta.env.DEV) {
        delete (window as any).__divineDavidDebug;
      }
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', updateGlobalPointer);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [source]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Interactive divine David digital sculpture"
      className={`absolute inset-0 block h-full w-full ${className}`}
    />
  );
}

export default DivineDavidCanvas;
