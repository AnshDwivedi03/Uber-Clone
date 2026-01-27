/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#ccff00', // Acid Lime
        'brand-secondary': '#22d3ee', // Cyan-400 (Secondary accent)
        'dark-bg': '#09090b', // Zinc-950 (OLED Black)
        'dark-surface': '#18181b', // Zinc-900 (Cards)
        'dark-card': '#18181b',
        'lime': {
          ...require('tailwindcss/colors').lime,
          400: '#ccff00', // Override 400 with Acid Lime
        },
        'zinc': require('tailwindcss/colors').zinc,
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.5s infinite',
      }
    },
  },
  plugins: [],
}

