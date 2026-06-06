import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// 复用原主页 ENTER LAB 点击后的红色扫描转场视觉（从 Hero.tsx 抽出，逐元素一致）：
// 全屏黑场 + SYSTEM ACTIVATED + 红色扫描线 + 中央红光球。
// 两种用法：
//  1) <RedScanOverlay active={...} /> —— 纯受控视觉（Hero 的 ENTER LAB 用，效果不变）。
//  2) <ScanTransitionProvider> + useScanTransition().navigateWithScan(to) —— 任意按钮切页面复用，
//     播放同一套扫描转场，遮住硬跳后再导航（AI LAB → TEXT COLLAPSE 用）。
// 纯 Framer Motion，无 Canvas、无 RAF、无新依赖。

export function RedScanOverlay({ active }: { active: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] bg-black"
      initial={false}
      animate={{
        opacity: active ? 1 : 0,
        pointerEvents: active ? 'auto' : 'none',
      }}
      transition={{ duration: 0.18 }}
    >
      <motion.div
        className="absolute inset-0 z-10 flex items-center justify-center text-sm font-semibold uppercase tracking-[0.34em] text-lab-red sm:text-lg"
        initial={false}
        animate={{
          opacity: active ? [0, 1, 0.35] : 0,
          y: active ? [16, 0, -8] : 16,
        }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        SYSTEM ACTIVATED
      </motion.div>
      <motion.div
        className="scanline-mask absolute left-0 top-1/2 h-1 w-full bg-lab-red shadow-red"
        initial={false}
        animate={{
          y: active ? ['-45vh', '0vh', '45vh'] : '-45vh',
          opacity: active ? [0, 1, 0] : 0,
        }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lab-red blur-xl"
        initial={false}
        animate={{
          scale: active ? [0.2, 18] : 0.2,
          opacity: active ? [0, 0.65, 0] : 0,
        }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      />
    </motion.div>
  );
}

type ScanContextValue = { navigateWithScan: (to: string) => void };

const ScanContext = createContext<ScanContextValue>({ navigateWithScan: () => {} });

export function useScanTransition() {
  return useContext(ScanContext);
}

export function ScanTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const targetRef = useRef<string | null>(null);

  const navigateWithScan = useCallback((to: string) => {
    setPlaying((current) => {
      if (current) return current; // 转场进行中则忽略重复触发
      targetRef.current = to;
      return true;
    });
  }, []);

  useEffect(() => {
    if (!playing) return;
    // 复刻 ENTER LAB 节奏：~800ms 黑场遮住时导航，1320ms 退场露出新页
    const navTimer = window.setTimeout(() => {
      if (targetRef.current) navigate(targetRef.current);
    }, 800);
    const endTimer = window.setTimeout(() => {
      targetRef.current = null;
      setPlaying(false);
    }, 1320);
    return () => {
      window.clearTimeout(navTimer);
      window.clearTimeout(endTimer);
    };
  }, [playing, navigate]);

  return (
    <ScanContext.Provider value={{ navigateWithScan }}>
      {children}
      <RedScanOverlay active={playing} />
    </ScanContext.Provider>
  );
}
