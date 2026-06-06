import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// 可复用的「红色激光扫描」页面转场。
// 任何按钮要切到新页面，调用 useLaserTransition().navigateWithLaser(to)，
// 会先播放红色激光扫过 + 短暂黑场（遮住硬跳），中段执行导航，再退场露出新页。
// 纯 CSS / Framer Motion，无 Canvas、无 RAF、无新依赖。

type LaserContextValue = { navigateWithLaser: (to: string) => void };

const LaserContext = createContext<LaserContextValue>({ navigateWithLaser: () => {} });

export function useLaserTransition() {
  return useContext(LaserContext);
}

export function LaserTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [target, setTarget] = useState<string | null>(null);

  const navigateWithLaser = useCallback((to: string) => {
    setTarget((current) => current ?? to); // 转场进行中则忽略重复触发
  }, []);

  return (
    <LaserContext.Provider value={{ navigateWithLaser }}>
      {children}
      <AnimatePresence>
        {target && (
          <LaserSweep
            key="laser"
            onNavigate={() => {
              if (target) navigate(target);
            }}
            onDone={() => setTarget(null)}
          />
        )}
      </AnimatePresence>
    </LaserContext.Provider>
  );
}

function LaserSweep({ onNavigate, onDone }: { onNavigate: () => void; onDone: () => void }) {
  const navigatedRef = useRef(false);

  useEffect(() => {
    const toNav = window.setTimeout(() => {
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        onNavigate(); // 黑场最暗时导航，遮住硬跳
      }
    }, 360);
    const toDone = window.setTimeout(() => onDone(), 760);
    return () => {
      window.clearTimeout(toNav);
      window.clearTimeout(toDone);
    };
  }, [onNavigate, onDone]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[90]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 黑场：中段遮住导航硬跳，前后透出 */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.88, 0.88, 0] }}
        transition={{ duration: 0.76, times: [0, 0.34, 0.56, 1], ease: 'easeInOut' }}
      />
      {/* 横向红色激光：从左扫到右（scaleX 左原点），错开几条 */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute left-0 h-px w-full bg-lab-red shadow-red"
          style={{ top: `${33 + i * 17}%`, transformOrigin: '0% 50%' }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 1, 0.5, 0] }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: [0.76, 0, 0.24, 1] }}
        />
      ))}
      {/* 竖向激光束：横扫整屏 */}
      <motion.div
        className="absolute top-0 h-full w-px bg-lab-red/70 shadow-red"
        initial={{ left: '-6vw', opacity: 0 }}
        animate={{ left: ['0vw', '100vw'], opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
      />
      {/* 系统文字 */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.5em] text-lab-red"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.85, 0] }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        Scanning
      </motion.div>
    </motion.div>
  );
}
