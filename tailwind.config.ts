import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary-rgb, 28 120 254) / <alpha-value>)',
        ink: '#0c0d0d',
        muted: '#616366',
        navy: 'rgb(var(--secondary-rgb, 21 32 66) / <alpha-value>)',
        'tier-low': '#d41f34',
        'tier-medium': '#f26527',
        'tier-high': '#66bc46',
      },
      boxShadow: {
        card: '0 10px 40px rgba(21, 32, 66, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
