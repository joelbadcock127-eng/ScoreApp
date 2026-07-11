import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1c78fe',
        ink: '#0c0d0d',
        muted: '#616366',
        navy: '#152042',
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
