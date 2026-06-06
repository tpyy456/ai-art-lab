import { useEffect, useRef, useState } from 'react';
import { CollapseEngine } from './collapseEngine';
import type { AnimationPhase } from './types';

// /lab/text-collapse —— 文字坍塌实验。
// 渲染一块 Canvas（引擎在 collapseEngine 内）+ COLLAPSE / RESET 控制 + 状态 HUD。
// 外层 LabLayout 由 App 的路由提供（与 _skeleton 同构）。
export default function TextCollapseLab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CollapseEngine | null>(null);
  const [phase, setPhase] = useState<AnimationPhase>('idle');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new CollapseEngine(canvas, { onPhaseChange: setPhase });
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const canCollapse = phase === 'idle';
  const canReset = phase !== 'idle';

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-lab-black">
      <canvas ref={canvasRef} aria-label="Text collapse experiment" className="absolute inset-0 block h-full w-full" />

      {/* 左上系统 HUD */}
      <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/40 sm:left-8">
        <span
          className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
          style={{ backgroundColor: phase === 'idle' ? 'rgba(255,255,255,0.4)' : 'rgba(214,30,32,0.9)' }}
        />
        STATE: {phase}
      </div>

      {/* 底部控制条 */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3">
        <button
          type="button"
          onClick={() => engineRef.current?.start()}
          disabled={!canCollapse}
          className={`inline-flex h-11 min-w-44 items-center justify-center gap-2 border px-6 text-xs font-medium uppercase tracking-[0.24em] transition-all duration-300 ${
            canCollapse
              ? 'border-lab-red/50 bg-lab-red/10 text-white hover:border-lab-red hover:bg-lab-red/20 hover:shadow-red'
              : 'cursor-not-allowed border-white/10 text-white/25'
          }`}
        >
          COLLAPSE
        </button>
        <button
          type="button"
          onClick={() => engineRef.current?.reset()}
          disabled={!canReset}
          className={`inline-flex h-11 items-center justify-center border px-5 text-xs font-medium uppercase tracking-[0.24em] transition-all duration-300 ${
            canReset
              ? 'border-white/20 text-white/70 hover:border-white/50 hover:text-white'
              : 'cursor-not-allowed border-white/5 text-white/15'
          }`}
        >
          RESET
        </button>
      </div>
    </div>
  );
}
