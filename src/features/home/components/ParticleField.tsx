import { useEffect, useRef } from 'react';
import { MotionValue } from 'framer-motion';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
};

type ParticleFieldProps = {
  activation: MotionValue<number>;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
};

const MAX_PARTICLE_DPR = 1.25;

const createParticle = (width: number, height: number): Particle => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * 0.18,
  vy: (Math.random() - 0.5) * 0.18,
  size: Math.random() * 1.7 + 0.4,
  alpha: Math.random() * 0.45 + 0.18,
});

const shouldUseReducedParticles = () =>
  window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches;

function ParticleField({ activation, mouseX, mouseY }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const whiteParticlesRef = useRef<Particle[]>([]);
  const redParticlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PARTICLE_DPR);
    let sculptureCenter = { x: 0, y: 0 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PARTICLE_DPR);
      sculptureCenter = { x: width * 0.75, y: height * 0.5 };
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      
      const reducedParticles = shouldUseReducedParticles();
      whiteParticlesRef.current = Array.from({ length: reducedParticles ? 16 : 34 }, () => createParticle(width, height));
      redParticlesRef.current = Array.from({ length: reducedParticles ? 0 : 48 }, () => createParticle(width, height));
    };

    const drawParticles = () => {
      context.clearRect(0, 0, width, height);
      const progress = activation.get(); // 0 to 1
      const now = performance.now();

      whiteParticlesRef.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        context.beginPath();
        context.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      if (progress > 0.06 && redParticlesRef.current.length > 0) {
        const x = mouseX.get();
        const y = mouseY.get();
        const alphaFade = Math.max(0, Math.min(1, (progress - 0.06) / 0.56));
        const directionX = sculptureCenter.x - x;
        const directionY = sculptureCenter.y - y;
        const directionLength = Math.hypot(directionX, directionY) || 1;
        const unitX = directionX / directionLength;
        const unitY = directionY / directionLength;

        context.save();
        context.globalCompositeOperation = 'lighter';
        
        redParticlesRef.current.forEach((particle, index) => {
          const orbit = index * 0.42 + now * 0.0012;
          const t = Math.pow((index % 12) / 11, 1.16); 
          const baseX = x + directionX * t;
          const baseY = y + directionY * t;

          const pullX = baseX + Math.cos(orbit) * (16 + (index % 9) * 11) * progress;
          const pullY = baseY + Math.sin(orbit * 0.8) * (12 + (index % 7) * 9) * progress;

          particle.x += (pullX - particle.x) * (0.035 + alphaFade * 0.035) + (Math.random() - 0.5) * 0.22;
          particle.y += (pullY - particle.y) * (0.035 + alphaFade * 0.035) + Math.sin(orbit) * 0.34;

          if (particle.x > width + 40 || particle.x < -40 || particle.y < -40 || particle.y > height + 40) {
            particle.x = sculptureCenter.x + (Math.random() - 0.5) * 200;
            particle.y = sculptureCenter.y + (Math.random() - 0.5) * 300;
          }

          if (index % 7 === 0) {
            context.beginPath();
            context.strokeStyle = `rgba(255, 22, 22, ${0.035 * alphaFade})`;
            context.lineWidth = 0.7;
            context.moveTo(particle.x, particle.y);
            context.lineTo(particle.x + unitX * (18 + progress * 28), particle.y + unitY * (18 + progress * 28));
            context.stroke();
          }

          context.beginPath();
          const baseAlpha = 0.12 + (index % 5) * 0.052;
          context.fillStyle = `rgba(255, 22, 22, ${baseAlpha * alphaFade})`;
          
          const currentSize = particle.size * (1 + progress * 0.6);
          context.arc(particle.x, particle.y, currentSize * 1.25, 0, Math.PI * 2);
          context.fill();
        });

        for (let index = 0; index < 10; index++) {
          const angle = now * 0.0016 + index * 2.399;
          const radius = 14 + (index % 5) * 6 + Math.sin(now * 0.001 + index) * 3;
          const drift = 10 + index * 1.7 + progress * 26;
          const sparkX = x + unitX * drift + Math.cos(angle) * radius;
          const sparkY = y + unitY * drift + Math.sin(angle) * radius;

          context.beginPath();
          context.fillStyle = `rgba(255, 22, 22, ${(0.08 + (index % 4) * 0.035) * alphaFade})`;
          context.arc(sparkX, sparkY, 0.7 + (index % 3) * 0.28, 0, Math.PI * 2);
          context.fill();
        }

        context.restore();
      }

      animationFrame = requestAnimationFrame(drawParticles);
    };

    resize();
    drawParticles();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [activation, mouseX, mouseY]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 mix-blend-screen" />;
}

export default ParticleField;
