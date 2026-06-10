import { ArrowLeft } from 'lucide-react';
import { useScanTransition } from '../../components/transition/RedScanTransition';
import AboutArchiveGrid from './components/AboutArchiveGrid';
import InteractivePortrait from './components/InteractivePortrait';

const textBlocks = [
  {
    title: 'WHO I AM',
    body: '艺术 / 雕塑背景，正在转向 AI 训练师、大模型评测与数据质量方向。',
  },
  {
    title: 'WHY AI',
    body: '我关注的是如何把模糊的表达拆成规则，把模型输出转化为可判断、可验收、可优化的结果。',
  },
  {
    title: 'HOW I WORK',
    body: '通过 Codex / Claude / Trae 等 AI Agent 协作，完成需求拆解、视觉审查、版本回退、构建验证和迭代优化。',
  },
  {
    title: 'WHAT I CARE ABOUT',
    body: '判断力、结构感、内容质量、审美控制、规则意识和复盘能力。',
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
          <header className="flex items-center justify-between border-b border-white/10 pb-6">
            <button
              type="button"
              onClick={() => navigateWithScan('/')}
              className="group inline-flex h-11 items-center gap-3 border border-white/14 bg-white/[0.02] px-4 text-[10px] uppercase tracking-[0.24em] text-white/62 transition-colors duration-300 hover:border-lab-red/60 hover:text-white"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4 text-lab-red transition-transform duration-300 group-hover:-translate-x-1" />
              BACK HOME
            </button>
            <p className="hidden text-[10px] uppercase tracking-[0.32em] text-white/32 sm:block">ABOUT / PLACEHOLDER V1</p>
          </header>

          <div className="grid gap-10 py-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:py-20">
            <div className="flex flex-col justify-center">
              <p className="text-[11px] uppercase tracking-[0.46em] text-lab-red">Human Layer</p>
              <h1 className="mt-5 text-5xl font-semibold uppercase leading-none tracking-normal text-white sm:text-6xl lg:text-7xl">
                ABOUT
                <span className="block text-white/42">TRACE</span>
              </h1>
              <div className="mt-8 h-px w-16 bg-lab-red" />

              <div className="mt-10 grid gap-px overflow-hidden border border-white/10 bg-white/10">
                {textBlocks.map((block) => (
                  <article key={block.title} className="bg-[#070707] p-5 sm:p-6">
                    <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/72">{block.title}</h2>
                    <p className="mt-3 text-sm leading-7 text-white/58 sm:text-base">{block.body}</p>
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
