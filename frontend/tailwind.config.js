/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Sacred Technology Brand Colors
        'sacred-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1E3A8A', // Primary Sacred Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'dignity-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#F59E0B', // Primary Dignity Gold
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'consciousness-white': '#FFFFFF',
        'wisdom-gray': {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6B7280', // Primary Wisdom Gray
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        'mystical-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#7C3AED', // Primary Mystical Purple
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        'clinical-green': {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#059669', // Primary Clinical Green
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        'research-teal': {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#0891B2', // Primary Research Teal
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['Source Code Pro', 'monospace'],
        'serif': ['Playfair Display', 'serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'consciousness-pulse': 'consciousness-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'dignity-glow': 'dignity-glow 3s ease-in-out infinite alternate',
        'sacred-float': 'sacred-float 6s ease-in-out infinite',
      },
      keyframes: {
        'consciousness-pulse': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
        'dignity-glow': {
          '0%': {
            boxShadow: '0 0 5px rgba(245, 158, 11, 0.5)',
          },
          '100%': {
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.8), 0 0 30px rgba(245, 158, 11, 0.6)',
          },
        },
        'sacred-float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'consciousness-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #7C3AED 100%)',
        'dignity-gradient': 'linear-gradient(135deg, #F59E0B 0%, #059669 100%)',
        'sacred-gradient': 'linear-gradient(135deg, #1E3A8A 0%, #F59E0B 50%, #7C3AED 100%)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
