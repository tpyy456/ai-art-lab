import { useState } from 'react';
import { motion } from 'framer-motion';
import Hero from './features/home';
import IntroOverlay from './features/intro/IntroOverlay';

const sections = ['About', 'Tools Lab', 'Projects', 'Resume', 'Contact'];

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <>
      {!introComplete && <IntroOverlay onComplete={() => setIntroComplete(true)} />}
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

export default App;
