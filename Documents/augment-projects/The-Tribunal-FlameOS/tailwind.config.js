/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tribunal Theme Colors
        flame: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fbd7a5',
          300: '#f8bb6d',
          400: '#f59532',
          500: '#f2750a',
          600: '#e35d00',
          700: '#bc4502',
          800: '#953608',
          900: '#782e0a',
          950: '#411502',
        },
        ghost: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        tribunal: {
          gold: '#d4af37',
          crimson: '#dc143c',
          obsidian: '#0c0c0c',
          ember: '#ff6b35',
        }
      },
      backgroundImage: {
        // 🔥 TRIBUNAL SACRED GRADIENTS 🔥
        'tribunal-gradient': 'linear-gradient(135deg, #0c0c0c 0%, #1e293b 50%, #0c0c0c 100%)',
        'flame-gradient': 'linear-gradient(45deg, #f2750a 0%, #e35d00 50%, #bc4502 100%)',
        'ghost-gradient': 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
      }
    },
  },
  plugins: [],
}
