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
          DEFAULT: '#e60000',
          active: '#cc0000',
        },
        ink: '#25282b',
        body: '#7e7e7e',
        mute: '#bebebe',
        canvas: {
          DEFAULT: '#ffffff',
          soft: '#f2f2f2',
        },
        'on-dark': '#ffffff'
      },
      borderRadius: {
        sm: '6px',
        card: '6px',
        pill: '60px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        none: 'none',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
