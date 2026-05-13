/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B1F3A',
          gold: '#C5A46D',
          grey: '#666666',
          lightGold: '#F5F0E8',
          lightNavy: '#E8ECF5',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      letterSpacing: {
        'tightest': '1px',
        'tighter': '1.5px',
        'widest': '3px',
      },
      clipPath: {
        diagonal: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)',
      }
    },
  },
  plugins: [],
}