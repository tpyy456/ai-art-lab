import { useRef } from 'react';
import { motion, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

export default function InteractivePortrait() {
  const containerRef = useRef<HTMLDivElement>(null);

  const mouseX = useSpring(50, { stiffness: 60, damping: 25 });
  const mouseY = useSpring(50, { stiffness: 60, damping: 25 });
  const holeSize = useSpring(0, { stiffness: 35, damping: 20 });

  const transparentStop = useTransform(holeSize, [0, 1], [0, 15]);
  const shadowStop = useTransform(holeSize, [0, 1], [0, 32]);
  const blackStop = useTransform(holeSize, [0, 1], [0, 55]);

  const revealMask = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, transparent ${transparentStop}%, rgba(0,0,0,0.2) ${shadowStop}%, #000 ${blackStop}%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
      mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
    }
  };

  const handleMouseEnter = () => holeSize.set(1);
  const handleMouseLeave = () => holeSize.set(0);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Interactive portrait placeholder"
      className="relative min-h-[32rem] w-full overflow-hidden border border-white/[0.06] bg-[#080808] sm:min-h-[38rem] lg:min-h-[44rem]"
    >
      {/* BOTTOM LAYER: Real Photo Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0f]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-mono tracking-[0.3em] text-white/30">[ REAL HUMAN PRESENCE ]</span>
          <span className="text-[9px] font-mono tracking-widest text-white/15">public/about/profile-real.jpg</span>
        </div>
      </div>

      {/* TOP LAYER: AI Mask / Shell */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-[#050505]"
        style={{ WebkitMaskImage: revealMask, maskImage: revealMask }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(214,30,32,0.06),transparent_65%)]" />
        <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="flex flex-col items-center gap-3">
          <span className="text-[10px] font-mono tracking-[0.3em] text-lab-red/50">[ DIGITAL SHELL / AI MASK ]</span>
          <span className="text-[9px] font-mono tracking-widest text-lab-red/25">public/about/profile-mask.jpg</span>
        </div>
      </motion.div>

      {/* OVERLAY DECORATIONS */}
      <div className="pointer-events-none absolute inset-0 border border-white/[0.02]" />
      
      {/* Corner Marks */}
      <span className="pointer-events-none absolute left-5 top-5 h-3 w-3 border-l border-t border-white/20" />
      <span className="pointer-events-none absolute right-5 top-5 h-3 w-3 border-r border-t border-white/20" />
      <span className="pointer-events-none absolute bottom-5 left-5 h-3 w-3 border-b border-l border-white/20" />
      <span className="pointer-events-none absolute bottom-5 right-5 h-3 w-3 border-b border-r border-white/20" />
    </section>
  );
}