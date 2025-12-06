/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf8f0',
          100: '#f4e5b0',
          200: '#e8d48a',
          300: '#dbc264',
          400: '#d4af37', // Main gold
          500: '#c9a030',
          600: '#b08928',
          700: '#8a6b1f',
          800: '#654e17',
          900: '#40310e',
        },
        dark: {
          50: '#e8eef5',
          100: '#c5d3e8',
          200: '#9fb5d6',
          300: '#7896c4',
          400: '#5a7db5',
          500: '#3c64a6',
          600: '#2d4f85',
          700: '#1f3a64',
          800: '#0f1d32', // Main dark blue
          900: '#0a1628', // Darkest
          950: '#060d18',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f4e5b0 50%, #d4af37 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a1628 0%, #0f1d32 100%)',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
