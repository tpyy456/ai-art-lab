import { ArrowLeft } from 'lucide-react';
import { useScanTransition } from '../../components/transition/RedScanTransition';
import AboutArchiveGrid from './components/AboutArchiveGrid';
import InteractivePortrait from './components/InteractivePortrait';

const textBlocks = [
  {
    title: 'IDENTITY / ORIGIN',
    body: '艺术与雕塑背景出身。如今转向 AI 训练师、大模型评测与数据质量方向，试图在冰冷的计算中寻找属于人的判断力。',
  },
  {
    title: 'WHY AI',
    body: '我关注的是如何把模糊的艺术表达拆解成精确的系统规则，把大语言模型的不可控输出，转化为可验收、可优化的结构化结果。',
  },
  {
    title: 'HOW I WORK',
    body: '与 Codex、Claude 等 AI Agent 结对协作。不再单打独斗，而是通过建立流程，完成从需求拆解、视觉审查到版本迭代的完整闭环。',
  },
  {
    title: 'CORE FOCUS',
    body: '结构感、审美控制、规则边界，以及在快速迭代中保持极致复盘的能力。',
  },
];

export default function AboutPage() {
  const { navigateWithScan } = useScanTransition();

  return (
    <main className="min-h-screen bg-lab-black text-white">
      <section className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-14">
        <div className="grid-noise pointer-events-none absolute inset-0 opacity-35" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_24%,rgba(214,30,32,0.13),transparent_24rem),radial-gradient(circle_at_18%_68%,rgba(255,255,255,0.05),transparent_22rem)]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <header className="flex items-center justify-between border-b border-white/10 pb-6 pt-2">
            <button
              type="button"
              onClick={() => navigateWithScan('/')}
              className="group inline-flex h-11 items-center gap-3 px-2 text-[10px] uppercase tracking-[0.24em] text-white/50 transition-colors duration-300 hover:text-white"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4 text-lab-red transition-transform duration-300 group-hover:-translate-x-1" />
              BACK HOME
            </button>
            <p className="hidden text-[10px] uppercase tracking-[0.32em] text-white/30 sm:block">ABOUT / LIVING ARCHIVE</p>
          </header>

          <div className="grid gap-16 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:py-24 items-start">
            <div className="flex flex-col">
              <p className="text-[11px] font-mono uppercase tracking-[0.46em] text-lab-red mt-2">Human Layer</p>
              <h1 className="mt-6 text-4xl font-medium uppercase leading-[1.05] tracking-wide text-white sm:text-5xl lg:text-[4rem]">
                ABOUT
                <span className="block text-white/30">TRACE</span>
              </h1>
              <div className="mt-8 h-px w-12 bg-lab-red" />

              <div className="mt-14 flex flex-col gap-10 lg:gap-12">
                {textBlocks.map((block) => (
                  <article key={block.title} className="group relative pl-5 sm:pl-7">
                    <div className="absolute bottom-0 left-0 top-0 w-px bg-white/10">
                      <div className="absolute left-0 top-0 h-1/3 w-full bg-gradient-to-b from-lab-red to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    </div>
                    <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-white/40 transition-colors duration-300 group-hover:text-lab-red/80">
                      {block.title}
                    </h2>
                    <p className="mt-4 max-w-[26rem] text-sm leading-relaxed text-white/70 sm:text-base">
                      {block.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <InteractivePortrait />
          </div>

          <AboutArchiveGrid />
        </div>
      </section>
    </main>
  );
}