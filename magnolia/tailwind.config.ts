import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: { DEFAULT: '#1F3A2E', deep: '#132A20', mid: '#2C4D3E' },
        ivory: { DEFAULT: '#F7F4E8', soft: '#FBF9F1', warm: '#EFEBDB' },
        gold: { DEFAULT: '#A8864E', light: '#C9A96A', dark: '#8A6B38' },
        charcoal: '#2A2D2B',
        stone: '#8B8A82',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { wider2: '0.18em' },
    },
  },
  plugins: [],
} satisfies Config;
