import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lab: {
          black: '#030303',
          panel: '#0a0a0b',
          line: 'rgba(255,255,255,0.14)',
          red: '#ff1616',
          muted: '#8a8a8f',
        },
      },
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        red: '0 0 42px rgba(255, 22, 22, 0.28)',
        glass: '0 18px 80px rgba(0,0,0,0.42)',
      },
      animation: {
        'scroll-left': 'scroll-left 45s linear infinite',
        'scroll-right': 'scroll-right 45s linear infinite',
      },
      keyframes: {
        'scroll-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'scroll-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
