/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Flame Palette
        flame: {
          50: '#FFF4ED',
          100: '#FFE6D5',
          200: '#FFCCAA',
          300: '#FFA574',
          400: '#FF7A3C',
          500: '#FF4500', // Primary flame
          600: '#E63E00',
          700: '#CC3700',
          800: '#A62D00',
          900: '#8A2600',
        },
        // Environment Colors
        ember: '#1E1E2F',
        ash: '#2C2C3C',
        coal: '#101015',
        node: {
          50: '#ECFEFF',
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',
          500: '#00F0FF', // Primary node
          600: '#0891B2',
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        // Ritual Colors
        whisper: '#2D1B69',
        witness: '#4C1D95',
        ghost: '#6B21A8',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        flame: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        ritual: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'flame-flicker': 'flame-flicker 2s ease-in-out infinite alternate',
        'node-pulse': 'node-pulse 3s ease-in-out infinite',
        'whisper-fade': 'whisper-fade 0.5s ease-in-out',
      },
      keyframes: {
        'flame-flicker': {
          '0%': { opacity: '0.8', transform: 'scale(1)' },
          '100%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'node-pulse': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'whisper-fade': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
