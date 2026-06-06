import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { motion, useMotionValue, useSpring, useMotionTemplate, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import CursorGlow from './components/CursorGlow';
import ParticleField from './components/ParticleField';
import AudioDock from './components/AudioDock';
import DivineDavidCanvas from '../divine-david/DivineDavidCanvas';
import { RedScanOverlay } from '../../components/transition/RedScanTransition';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

type RectBounds = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type MousePoint = {
  x: number;
  y: number;
};

type FramePulse = {
  id: number;
  x: number;
  y: number;
};

function Hero() {
  const sculptureRef = useRef<HTMLDivElement>(null);
  const initialMouseRef = useRef<MousePoint>({
    x: typeof window === 'undefined' ? 0 : window.innerWidth / 2,
    y: typeof window === 'undefined' ? 0 : window.innerHeight / 2,
  });
  const [transitioning, setTransitioning] = useState(false);
  const [framePulse, setFramePulse] = useState<FramePulse>({ id: 0, x: 0.5, y: 0.5 });
  const mouseRef = useRef(initialMouseRef.current);
  const frameRef = useRef<number | null>(null);
  const sculptureBoundsRef = useRef<RectBounds | null>(null);

  const mouseX = useMotionValue(initialMouseRef.current.x);
  const mouseY = useMotionValue(initialMouseRef.current.y);
  const activationProgress = useSpring(0, { stiffness: 35, damping: 22, mass: 1 });

  useEffect(() => {
    const updateSculptureBounds = () => {
      const rect = sculptureRef.current?.getBoundingClientRect();
      if (!rect) return;

      sculptureBoundsRef.current = {
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        top: rect.top,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      mouseRef.current = { x: event.clientX, y: event.clientY };

      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        const currentMouse = mouseRef.current;
        const bounds = sculptureBoundsRef.current;

        mouseX.set(currentMouse.x);
        mouseY.set(currentMouse.y);
        
        if (bounds) {
          const centerX = bounds.left + (bounds.right - bounds.left) / 2;
          const centerY = bounds.top + (bounds.bottom - bounds.top) / 2;
          const distance = Math.hypot(currentMouse.x - centerX, currentMouse.y - centerY);
          const maxDistance = Math.max(bounds.right - bounds.left, bounds.bottom - bounds.top) / 2 + 350;
          
          const rawProgress = clamp(1 - distance / maxDistance, 0, 1);
          activationProgress.set(rawProgress);
        }
      });
    };

    const resizeObserver = new ResizeObserver(updateSculptureBounds);
    if (sculptureRef.current) {
      resizeObserver.observe(sculptureRef.current);
    }

    updateSculptureBounds();
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('resize', updateSculptureBounds);
    window.addEventListener('scroll', updateSculptureBounds, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', updateSculptureBounds);
      window.removeEventListener('scroll', updateSculptureBounds);
      resizeObserver.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [activationProgress, mouseX, mouseY]);

  const enterLab = () => {
    setTransitioning(true);
    window.setTimeout(() => {
      const nextSectionTop = document.getElementById('lab-sections')?.offsetTop ?? window.innerHeight;
      window.scrollTo({ top: nextSectionTop, behavior: 'auto' });
    }, 800);
    window.setTimeout(() => setTransitioning(false), 1320);
  };

  useEffect(() => {
    const handleBoundaryRelease = (event: Event) => {
      const detail = (event as CustomEvent<{ impactX?: number; impactY?: number }>).detail;
      setFramePulse((current) => ({
        id: current.id + 1,
        x: clamp(detail?.impactX ?? 0.5, 0, 1),
        y: clamp(detail?.impactY ?? 0.5, 0, 1),
      }));
    };

    window.addEventListener('divine-david-boundary-release', handleBoundaryRelease);

    return () => {
      window.removeEventListener('divine-david-boundary-release', handleBoundaryRelease);
    };
  }, []);

  const bgOpacity = useTransform(activationProgress, [0, 1], [0.08, 0.42]);
  const bgGradient = useMotionTemplate`radial-gradient(circle, rgba(255, ${useTransform(activationProgress, [0, 1], [255, 22])}, ${useTransform(activationProgress, [0, 1], [255, 22])}, ${useTransform(activationProgress, [0, 1], [0.08, 0.28])}), transparent 64%)`;
  
  const circleBorder = useMotionTemplate`rgba(255, ${useTransform(activationProgress, [0, 1], [255, 22])}, ${useTransform(activationProgress, [0, 1], [255, 22])}, ${useTransform(activationProgress, [0, 1], [0.12, 0.45])})`;
  const circleShadow = useMotionTemplate`0 0 36px rgba(255, 22, 22, ${useTransform(activationProgress, [0, 1], [0, 0.22])})`;
  const circleScale = useTransform(activationProgress, [0, 1], [0.9, 1.18]);
  const circleOpacity = useTransform(activationProgress, [0, 1], [0.35, 1]);
  const rectBorder = useMotionTemplate`rgba(255, ${useTransform(activationProgress, [0, 1], [80, 22])}, ${useTransform(activationProgress, [0, 1], [80, 22])}, ${useTransform(activationProgress, [0, 1], [0.2, 0.38])})`;

  return (
    <section id="top" className="relative min-h-screen overflow-hidden bg-lab-black text-white">
      <Navbar />
      <CursorGlow mouseX={mouseX} mouseY={mouseY} activation={activationProgress} />
      <ParticleField activation={activationProgress} mouseX={mouseX} mouseY={mouseY} />

      <div className="grid-noise pointer-events-none absolute inset-0 z-0 opacity-45" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_73%_42%,rgba(255,255,255,0.12),transparent_28rem),radial-gradient(circle_at_20%_70%,rgba(255,255,255,0.055),transparent_20rem)]" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-[11%] top-[15%] z-20 h-[64vh] w-[40vw] rounded-full blur-3xl"
        style={{
          opacity: bgOpacity,
          background: bgGradient,
        }}
      />

      <div className="relative z-20 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-10 px-5 pb-12 pt-28 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:px-14 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="mb-8 text-[11px] uppercase tracking-[0.5em] text-white/45">AI Sculpture System</p>
          <h1 className="text-[3.35rem] font-semibold uppercase leading-[0.95] tracking-normal text-white sm:text-7xl lg:text-[4.8rem] xl:text-[5.6rem] 2xl:text-[7.2rem]">
            TPY /
            <span className="block whitespace-nowrap">AI ART LAB</span>
          </h1>
          <div className="mt-8 h-px w-16 bg-lab-red" />
          <p className="mt-7 max-w-xl text-lg leading-8 text-white/72 sm:text-xl">
            用 AI 探索艺术的边界，也用工具重建自己的秩序。
          </p>

          <button
            type="button"
            onClick={enterLab}
            className="group mt-10 inline-flex h-14 min-w-52 items-center justify-between border border-white/18 bg-white/[0.03] px-7 text-sm font-medium uppercase tracking-[0.16em] text-white transition-all duration-300 hover:border-lab-red hover:bg-lab-red/10 hover:shadow-red"
          >
            ENTER LAB
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>

          <div className="mt-16 hidden items-center gap-3 text-[10px] uppercase tracking-[0.26em] text-white/45 sm:flex">
            <span>Scroll to explore</span>
            <ChevronDown aria-hidden="true" className="h-4 w-4" />
          </div>
        </motion.div>

        <div className="relative min-h-[34vh] sm:min-h-[56vh] lg:min-h-[76vh]">
          <motion.div
            ref={sculptureRef}
            className="relative ml-auto h-[34vh] w-full max-w-[780px] origin-center overflow-visible sm:h-[58vh] lg:h-[78vh] lg:w-[54vw]"
          >
            <motion.div
              aria-label="Digital sculpture study"
              className="absolute bottom-0 right-[-9%] z-10 h-full w-[112%] max-w-none overflow-hidden pointer-events-auto"
              initial={{ opacity: 0, scale: 1.04, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <DivineDavidCanvas />
            </motion.div>

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-[5%] right-[2%] z-20 w-[88%] border border-lab-red/25"
              style={{
                borderColor: rectBorder,
                boxShadow: 'inset 0 0 0 1px rgba(255, 22, 22, 0.035), 0 0 28px rgba(255, 22, 22, 0.08)',
              }}
            >
              <span className="absolute -left-px -top-px h-8 w-8 border-l border-t border-lab-red/45" />
              <span className="absolute -right-px -top-px h-8 w-8 border-r border-t border-lab-red/45" />
              <span className="absolute -bottom-px -left-px h-8 w-8 border-b border-l border-lab-red/45" />
              <span className="absolute -bottom-px -right-px h-8 w-8 border-b border-r border-lab-red/45" />
              {framePulse.id > 0 && (
                <>
                  <motion.div
                    key={`frame-${framePulse.id}`}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 border border-lab-red/75"
                    initial={{ opacity: 0, scale: 0.992 }}
                    animate={{ opacity: [0, 0.62, 0], scale: [0.992, 1.008, 1.018] }}
                    transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      boxShadow: '0 0 44px rgba(255, 22, 22, 0.22), inset 0 0 30px rgba(255, 22, 22, 0.1)',
                    }}
                  />
                  <motion.span
                    key={`impact-${framePulse.id}`}
                    aria-hidden="true"
                    className="pointer-events-none absolute h-24 w-24 rounded-full border border-lab-red/70"
                    initial={{ opacity: 0, scale: 0.35 }}
                    animate={{ opacity: [0, 0.56, 0], scale: [0.35, 1.05, 1.72] }}
                    transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      left: `calc(${framePulse.x * 100}% - 3rem)`,
                      top: `calc(${framePulse.y * 100}% - 3rem)`,
                      boxShadow:
                        '0 0 26px rgba(255, 22, 22, 0.22), inset 0 0 18px rgba(255, 22, 22, 0.12)',
                    }}
                  />
                </>
              )}
            </motion.div>

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute right-[9%] top-[22%] h-28 w-28 rounded-full border"
              style={{
                opacity: circleOpacity,
                scale: circleScale,
                borderColor: circleBorder,
                boxShadow: circleShadow,
              }}
            />
          </motion.div>
        </div>
      </div>

      <AudioDock />

      <RedScanOverlay active={transitioning} />
    </section>
  );
}

export default Hero;
