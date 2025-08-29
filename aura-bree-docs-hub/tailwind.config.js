/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'empire-purple': '#667eea',
        'empire-blue': '#764ba2',
        'sovereign-dark': '#1a1a2e'
      },
      fontFamily: {
        'empire': ['Georgia', 'serif']
      }
    },
  },
  plugins: [],
}

