/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Periwinkle trust & care
        'periwinkle': {
          50: '#f4f3ff',
          100: '#e0e7ff',
          200: '#d9d6fe',
          300: '#beb7fd',
          400: '#9d8dfa',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#5a2ed9',
        },
        // Muted gold backgrounds
        'gold': {
          50: '#fefdfb',
          100: '#fdf9f0',
          200: '#fbf0d9',
          300: '#f7e4b8',
          400: '#f2d485',
          500: '#edc55f',
          600: '#e6b143',
        },
        // Creamy peach warmth
        'peach': {
          50: '#fef8f4',
          100: '#fdeee6',
          200: '#fbdac7',
          300: '#f7c19d',
          400: '#f19f71',
          500: '#ec8051',
        },
        // Warm neutrals
        'warm': {
          50: '#fefdf8',
          100: '#fdf6e3',
          200: '#f9ede1',
          300: '#f3ddc7',
        },
        // Sage for text
        'sage': {
          500: '#8a9b75',
          600: '#6f7d5c',
          700: '#59624a',
          800: '#495040',
        }
      },
      fontFamily: {
        'brand': ['Varela Round', 'system-ui', 'sans-serif'],
        'display': ['Lora', 'serif'],
      },
      backgroundImage: {
        'morning-gradient': 'linear-gradient(135deg, #fdf9f0 0%, #fef8f4 50%, #fefdf8 100%)',
        'warm-gradient': 'linear-gradient(135deg, #fef8f4 0%, #fbdac7 100%)',
        'trust-gradient': 'linear-gradient(135deg, #f4f3ff 0%, #e0e7ff 100%)',
      },
    },
  },
  plugins: [],
}