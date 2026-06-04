import { useEffect, useRef } from 'react';

// 仅用于验证 LAB 模块的挂载 / 卸载 / cleanup 范式，不含任何真实功能。
// 它故意持有 4 类副作用（canvas + RAF + interval + resize 监听），并在卸载时全部清理。
// 开发环境下把生命周期状态挂到 window.__labSkeletonDebug 供验收读取。
type SkeletonDebug = {
  mounted: boolean;
  unmounted: boolean;
  rafStarted: boolean;
  rafStopped: boolean;
  intervalCleared: boolean;
  resizeListenerRemoved: boolean;
  frames: number;
  ticks: number;
  mountedAt: number;
  unmountedAt: number;
};

export default function SkeletonLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas ? canvas.getContext('2d') : null;

    let rafId = 0;
    let frames = 0;
    let width = 0;
    let height = 0;

    const debug: SkeletonDebug = {
      mounted: true,
      unmounted: false,
      rafStarted: false,
      rafStopped: false,
      intervalCleared: false,
      resizeListenerRemoved: false,
      frames: 0,
      ticks: 0,
      mountedAt: Date.now(),
      unmountedAt: 0,
    };
    if (import.meta.env.DEV) {
      (window as unknown as { __labSkeletonDebug?: SkeletonDebug }).__labSkeletonDebug = debug;
    }

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      frames += 1;
      debug.frames = frames;
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        const cx = width / 2;
        const cy = height / 2;
        const t = frames * 0.012;
        ctx.strokeStyle = 'rgba(255, 22, 22, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 56 + Math.sin(t) * 10, t, t + Math.PI * 1.25);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(cx, cy, 78, 0, Math.PI * 2);
        ctx.stroke();
      }
      rafId = requestAnimationFrame(draw);
    };

    resize();
    debug.rafStarted = true;
    rafId = requestAnimationFrame(draw);

    const intervalId = window.setInterval(() => {
      debug.ticks += 1;
    }, 1000);

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearInterval(intervalId);
      window.removeEventListener('resize', resize);
      debug.mounted = false;
      debug.unmounted = true;
      debug.rafStopped = true;
      debug.intervalCleared = true;
      debug.resizeListenerRemoved = true;
      debug.unmountedAt = Date.now();
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-6">
      <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Lab Module Skeleton</p>
      <canvas
        ref={canvasRef}
        aria-label="skeleton lifecycle test canvas"
        className="h-64 w-64 border border-white/10"
      />
      <p className="max-w-md text-center text-xs leading-6 text-white/35">
        仅用于验证模块挂载 / 卸载 / cleanup 的空壳。开发环境下副作用状态挂在{' '}
        <code className="text-lab-red">window.__labSkeletonDebug</code>。
      </p>
    </div>
  );
}
