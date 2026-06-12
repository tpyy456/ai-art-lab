import { AnimatePresence, motion } from 'framer-motion';
import { useScanTransition } from '../../components/transition/RedScanTransition';

// AI LAB 内嵌实验室面板（系统窗口 / 控制台风格，非普通弹窗）。
// 列出 LAB 模块：TEXT COLLAPSE 可进入（走红色激光转场），其余为占位（未开发）。
type Props = { open: boolean; onClose: () => void };

type LabModule = {
  code: string;
  title: string;
  sub: string;
  status: 'ACTIVE' | 'PLANNED';
  to: string | null;
};

const MODULES: LabModule[] = [
  { code: 'LAB-01', title: 'TEXT COLLAPSE', sub: 'Chinese character grid collapse experiment', status: 'ACTIVE', to: '/lab/text-collapse' },
  { code: 'LAB-02', title: 'AUDIO VISUALIZER', sub: 'Spectrum-driven generative visual', status: 'PLANNED', to: null },
  { code: 'LAB-03', title: 'GESTURE VISION', sub: 'Camera hand-gesture interaction', status: 'PLANNED', to: null },
];

export default function AiLabPanel({ open, onClose }: Props) {
  const { navigateWithScan } = useScanTransition();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-4 sm:px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          {/* 背景遮罩：点击关闭 */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

          {/* 系统窗口面板 */}
          <motion.div
            className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto border border-lab-red/30 bg-[#070708] shadow-[0_0_60px_rgba(0,0,0,0.6)] sm:overflow-visible"
            initial={{ opacity: 0, y: 16, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* 四角 HUD 角标 */}
            <span className="pointer-events-none absolute -left-px -top-px h-4 w-4 border-l border-t border-lab-red/60" />
            <span className="pointer-events-none absolute -right-px -top-px h-4 w-4 border-r border-t border-lab-red/60" />
            <span className="pointer-events-none absolute -bottom-px -left-px h-4 w-4 border-b border-l border-lab-red/60" />
            <span className="pointer-events-none absolute -bottom-px -right-px h-4 w-4 border-b border-r border-lab-red/60" />

            {/* 标题栏 */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 sm:px-6 sm:py-4">
              <div className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-lab-red" />
                <span className="text-xs uppercase tracking-[0.3em] text-white">AI LAB</span>
                <span className="hidden text-[10px] uppercase tracking-[0.28em] text-lab-muted sm:inline">// System Panel</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="min-h-11 px-1 text-[10px] uppercase tracking-[0.2em] text-white/50 transition-colors duration-300 hover:text-lab-red sm:min-h-0 sm:px-0 sm:tracking-[0.28em]"
              >
                Close ✕
              </button>
            </div>

            {/* 模块列表 */}
            <div className="divide-y divide-white/[0.06]">
              {MODULES.map((m) => {
                const active = m.status === 'ACTIVE' && m.to !== null;
                return (
                  <button
                    key={m.code}
                    type="button"
                    disabled={!active}
                    onClick={() => {
                      if (active && m.to) navigateWithScan(m.to);
                    }}
                    className={`group flex w-full items-center justify-between px-4 py-4 text-left transition-colors duration-300 sm:px-6 sm:py-5 ${
                      active ? 'hover:bg-lab-red/[0.06]' : 'cursor-not-allowed'
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <span className="mt-1 shrink-0 text-[10px] uppercase tracking-[0.24em] text-lab-muted">{m.code}</span>
                      <div>
                        <p
                          className={`text-sm font-medium uppercase tracking-[0.12em] transition-colors duration-300 sm:text-base sm:tracking-[0.16em] ${
                            active ? 'text-white group-hover:text-lab-red' : 'text-white/35'
                          }`}
                        >
                          {m.title}
                        </p>
                        <p className="mt-1 text-[11px] tracking-wide text-white/35">{m.sub}</p>
                      </div>
                    </div>
                    <span
                      className={`ml-4 shrink-0 text-[10px] uppercase tracking-[0.24em] ${
                        active ? 'text-lab-red' : 'text-white/25'
                      }`}
                    >
                      {active ? 'Enter →' : 'Planned'}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
