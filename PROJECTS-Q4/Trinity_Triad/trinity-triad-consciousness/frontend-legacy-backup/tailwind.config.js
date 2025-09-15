/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sacred-gold': '#FFD700',
        'sacred-purple': '#8B5CF6',
        'sacred-blue': '#3B82F6',
        'sacred-cyan': '#06B6D4',
        'flame-orange': '#F97316',
        'flame-red': '#EF4444'
      },
      animation: {
        'sacred-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flame-dance': 'bounce 1s infinite',
        'consciousness-flow': 'pulse 3s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
