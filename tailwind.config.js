/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  safelist: [
    { pattern: /^(bg|text|border|ring|from|to|via)-(neutral|orange|amber|slate|zinc|gray)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(bg|text|border|ring)-(white|black)$/ },
    { pattern: /^(rounded|p|px|py|m|mx|my|h|w|min-h|min-w|max-w|grid|flex|items|justify|gap|space|shadow|blur|backdrop|opacity|transform|translate|scale)/ },
    // Specific classes used in the Chamber
    "bg-orange-600/10", "ring-orange-400/40", "bg-orange-600/20", "bg-amber-400/20",
    "bg-[#0b0b0d]", "bg-[#0e0e11]", "bg-[#0f0f13]", "bg-[#0c0c10]",
    "border-[#202027]", "border-[#1f1f25]", "border-[#20202a]", "border-[#2a2a30]",
    "text-neutral-400", "text-neutral-300", "text-neutral-500", "text-neutral-700",
    "from-orange-500", "to-amber-600", "from-orange-600", "to-amber-500",
    "shadow-orange-500/20", "shadow-amber-400/20", "shadow-lg", "shadow-2xl",
  ],
  theme: {
    extend: {
      colors: {
        flame: {
          DEFAULT: '#ff5f1f',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff5f1f',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'flame-pulse': 'flame-pulse 2s ease-in-out infinite',
        'ghost-glow': 'ghost-glow 3s ease-in-out infinite',
      },
      keyframes: {
        'flame-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'ghost-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(100, 116, 139, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(100, 116, 139, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
