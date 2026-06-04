import { motion, MotionValue, useTransform } from 'framer-motion';

type HudCardProps = {
  eyebrow: string;
  value: string;
  className?: string;
  activation: MotionValue<number>;
  delay?: number;
};

function HudCard({ eyebrow, value, className = '', activation, delay = 0 }: HudCardProps) {
  const borderColor = useTransform(activation, [0, 1], ['rgba(255,255,255,0.12)', 'rgba(255,22,22,0.55)']);
  const shadow = useTransform(activation, [0, 1], ['0 18px 80px rgba(0,0,0,0.42)', '0 18px 80px rgba(0,0,0,0.42), 0 0 32px rgba(255, 22, 22, 0.18)']);
  const textColor = useTransform(activation, [0, 1], ['rgba(255,255,255,0.45)', 'rgba(255,22,22,1)']);
  const dotBg = useTransform(activation, [0, 1], ['rgba(255,255,255,0.4)', 'rgba(255,22,22,1)']);

  return (
    <motion.div
      initial={{ opacity: 0, x: 24, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ borderColor, boxShadow: shadow }}
      className={`pointer-events-none absolute z-30 min-w-40 origin-top-right scale-75 border bg-black/30 p-4 backdrop-blur-xl sm:scale-100 ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <motion.p style={{ color: textColor }} className="text-[10px] uppercase tracking-[0.24em]">
          {eyebrow}
        </motion.p>
        <motion.span style={{ backgroundColor: dotBg }} className="h-1.5 w-1.5 rounded-full" />
      </div>
      <p className="text-lg font-medium uppercase tracking-normal text-white">{value}</p>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 10 }).map((_, index) => {
          const barBg = useTransform(activation, [0, 1], [
            'rgba(255,255,255,0.2)',
            index > 4 ? 'rgba(255,22,22,1)' : 'rgba(255,255,255,0.2)'
          ]);
          return <motion.span key={index} style={{ backgroundColor: barBg }} className="h-0.5 flex-1" />;
        })}
      </div>
    </motion.div>
  );
}

export default HudCard;
