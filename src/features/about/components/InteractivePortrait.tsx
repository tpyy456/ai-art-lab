import { useState } from 'react';

type MaskPosition = {
  active: boolean;
  x: number;
  y: number;
};

export default function InteractivePortrait() {
  const [mask, setMask] = useState<MaskPosition>({ active: false, x: 50, y: 50 });

  const revealMask = mask.active
    ? `radial-gradient(circle at ${mask.x}% ${mask.y}%, transparent 0 16%, rgba(0,0,0,0.18) 27%, #000 43%)`
    : 'radial-gradient(circle at 50% 50%, #000 0%, #000 100%)';

  return (
    <section
      aria-label="Interactive portrait placeholder"
      className="group relative min-h-[32rem] overflow-hidden border border-lab-red/24 bg-[#050505] sm:min-h-[38rem] lg:min-h-[44rem]"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setMask({
          active: true,
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
      onMouseLeave={() => setMask((current) => ({ ...current, active: false }))}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_24%,rgba(255,255,255,0.14),transparent_18rem),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015)_45%,rgba(214,30,32,0.08))]" />
      <div className="absolute inset-x-8 bottom-12 top-14 border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] shadow-[inset_0_0_70px_rgba(255,255,255,0.03)]" />
      <div className="absolute left-8 top-8 text-[10px] uppercase tracking-[0.34em] text-white/36">REAL PHOTO PLACEHOLDER</div>
      <div className="absolute bottom-8 right-8 text-right text-[10px] uppercase tracking-[0.28em] text-white/26">
        public/about/profile-real.jpg
      </div>

      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_52%_34%,rgba(255,22,22,0.18),transparent_13rem),linear-gradient(135deg,rgba(214,30,32,0.18),rgba(12,12,14,0.92)_42%,rgba(255,255,255,0.08))] transition-[mask-image,-webkit-mask-image] duration-700"
        style={{
          WebkitMaskImage: revealMask,
          maskImage: revealMask,
        }}
      >
        <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute inset-x-10 bottom-16 top-16 border border-lab-red/32 bg-black/20 shadow-[0_0_50px_rgba(214,30,32,0.1),inset_0_0_42px_rgba(214,30,32,0.06)]" />
        <div className="absolute left-8 top-8 text-[10px] uppercase tracking-[0.34em] text-lab-red/80">
          AI MASK / ARMOR PLACEHOLDER
        </div>
        <div className="absolute bottom-8 right-8 text-right text-[10px] uppercase tracking-[0.28em] text-lab-red/42">
          public/about/profile-mask.jpg
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 border border-white/[0.04]" />
      <span className="pointer-events-none absolute -left-px -top-px h-8 w-8 border-l border-t border-lab-red/50" />
      <span className="pointer-events-none absolute -right-px -top-px h-8 w-8 border-r border-t border-lab-red/50" />
      <span className="pointer-events-none absolute -bottom-px -left-px h-8 w-8 border-b border-l border-lab-red/50" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-8 w-8 border-b border-r border-lab-red/50" />
    </section>
  );
}
