/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f2f6',
          100: '#d9dee8',
          200: '#b3bdd1',
          300: '#8d9cba',
          400: '#677ba3',
          500: '#415a8c',
          600: '#344870',
          700: '#273654',
          800: '#1a2438',
          900: '#0d121c',
        },
        gold: {
          50: '#fcf7ed',
          100: '#f8efdb',
          200: '#f1dfb7',
          300: '#eacf93',
          400: '#e3bf6f',
          500: '#c9a84c',
          600: '#b8973e',
          700: '#a08534',
          800: '#88732a',
          900: '#706120',
        }
      }
    },
  },
  plugins: [],
}
