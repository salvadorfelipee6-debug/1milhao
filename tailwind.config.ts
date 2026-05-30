import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        dark:   { DEFAULT: '#080808', 2: '#111111', 3: '#1a1a1a', 4: '#222222' },
        gold:   { DEFAULT: '#FFD700', 2: '#FFA500' },
        pink:   '#E1306C',
        purple: '#833AB4',
        insta:  '#405DE6',
      },
      backgroundImage: {
        'grad-gold':  'linear-gradient(135deg, #FFD700, #FFA500)',
        'grad-insta': 'linear-gradient(135deg, #E1306C, #833AB4, #405DE6)',
        'grad-brand': 'linear-gradient(180deg, #fff 0%, #FFD700 100%)',
        'grad-dark':  'linear-gradient(180deg, #111 0%, #080808 100%)',
      },
    },
  },
  plugins: [],
}

export default config