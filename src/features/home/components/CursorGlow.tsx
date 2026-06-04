import { motion, MotionValue, useTransform } from 'framer-motion';

type CursorGlowProps = {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  activation: MotionValue<number>;
};

function CursorGlow({ mouseX, mouseY, activation }: CursorGlowProps) {
  const x = useTransform(mouseX, (value) => value - 16);
  const y = useTransform(mouseY, (value) => value - 16);
  const scale = useTransform(activation, [0, 1], [0.9, 1.45]);
  const borderColor = useTransform(activation, [0, 1], ['rgba(255,255,255,0.15)', 'rgba(255,22,22,0.96)']);
  const backgroundColor = useTransform(activation, [0, 1], ['rgba(255,255,255,0.58)', 'rgba(255,22,22,0.08)']);
  const boxShadow = useTransform(activation, [0, 1], [
    '0 0 22px rgba(255,255,255,0.42), 0 0 78px rgba(255,255,255,0.15)',
    '0 0 18px rgba(255,22,22,0.95), inset 0 0 16px rgba(255,22,22,0.55), 0 0 96px rgba(255,22,22,0.42)'
  ]);

  const innerBorderColor = useTransform(activation, [0, 1], ['rgba(255,255,255,0.15)', 'rgba(255,22,22,0.35)']);
  const innerBoxShadow = useTransform(activation, [0, 1], ['none', '0 0 32px rgba(255, 22, 22, 0.15)']);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 hidden h-8 w-8 rounded-full border mix-blend-screen md:block"
      style={{
        x,
        y,
        scale,
        borderColor,
        backgroundColor,
        boxShadow,
      }}
    >
      <motion.span
        className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          borderColor: innerBorderColor,
          boxShadow: innerBoxShadow,
        }}
      />
    </motion.div>
  );
}

export default CursorGlow;
