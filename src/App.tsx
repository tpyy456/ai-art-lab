import { lazy, Suspense, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from './features/home';
import IntroOverlay from './features/intro/IntroOverlay';
import LabLayout from './features/lab/LabLayout';

const SkeletonLab = lazy(() => import('./features/lab/_skeleton/SkeletonLab'));

const sections = ['About', 'Tools Lab', 'Projects', 'Resume', 'Contact'];

// 本标签页是否已完成开场，存进 sessionStorage，避免从 LAB 返回首页时重播 intro。
// 新标签页 / 清除 sessionStorage 后仍会正常播放开场。
const INTRO_DONE_KEY = 'tpy-intro-complete';

function readIntroDone() {
  try {
    return sessionStorage.getItem(INTRO_DONE_KEY) === '1';
  } catch {
    return false;
  }
}

// 首页逻辑：IntroOverlay 先显示 → ENTER SYSTEM 转场 → 主站淡入 → Hero 仅在 introComplete 后挂载。
// 与原 App 的唯一差别：introComplete 初值改为读 sessionStorage、完成时写入（仅本组件内，不改 Hero / IntroOverlay）。
function HomeRoute() {
  const [introComplete, setIntroComplete] = useState(readIntroDone);

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem(INTRO_DONE_KEY, '1');
    } catch {
      // 忽略隐私模式等无法写入 sessionStorage 的情况
    }
    setIntroComplete(true);
  };

  return (
    <>
      {!introComplete && <IntroOverlay onComplete={handleIntroComplete} />}
      <motion.main
        initial={false}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="min-h-screen bg-lab-black text-white"
        style={{
          // Keep it pointer-events-none until intro is fully complete to prevent early clicks
          pointerEvents: introComplete ? 'auto' : 'none',
          // Optionally hide overflow during intro if needed, but Hero already has overflow-hidden
        }}
      >
        {introComplete && <Hero />}
        <section
          id="lab-sections"
          className="relative min-h-screen border-t border-white/10 bg-[#070707] px-5 py-24 sm:px-8 lg:px-14"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-12">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-lab-red">Next Modules</p>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                A quiet system for the work behind the experiments.
              </h2>
            </div>

            <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-5">
              {sections.map((section, index) => (
                <article
                  key={section}
                  className="group min-h-64 bg-[#080808] p-6 transition-colors duration-300 hover:bg-[#101010]"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-lab-muted">
                    <span>0{index + 1}</span>
                    <span className="h-px w-8 bg-white/20 transition-colors group-hover:bg-lab-red" />
                  </div>
                  <h3 className="mt-16 text-xl font-medium uppercase tracking-[0.18em] text-white">
                    {section}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </section>
      </motion.main>
    </>
  );
}

function LabFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-lab-black">
      <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Loading module…</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/lab/_skeleton"
          element={
            <LabLayout title="SKELETON LAB">
              <Suspense fallback={<LabFallback />}>
                <SkeletonLab />
              </Suspense>
            </LabLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
