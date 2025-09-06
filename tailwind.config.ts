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
        'gold': {
          50: '#fefdfb',
          100: '#fdf9f0',
          200: '#fbf0d9',
          300: '#f7e4b8',
          400: '#f2d485',
          500: '#edc55f',
          600: '#e6b143',
        },
        'peach': {
          50: '#fef8f4',
          100: '#fdeee6',
          200: '#fbdac7',
          300: '#f7c19d',
          400: '#f19f71',
          500: '#ec8051',
        },
        'warm': {
          50: '#fefdf8',
          100: '#fdf6e3',
          200: '#f9ede1',
          300: '#f3ddc7',
        },
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
        'organic-contours': `url("data:image/svg+xml,%3csvg width='120' height='120' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' stroke='%23f7e4b8' stroke-width='0.8' opacity='0.6'%3e%3cpath d='M20 30c10-5 20 5 30 0s20-10 30-5 20 10 30 5'/%3e%3cpath d='M15 50c12-8 25 8 35 0s25-15 35-8 25 15 35 8' transform='translate(0,20)'/%3e%3cpath d='M10 70c15-10 30 10 45 0s30-20 45-10 30 20 45 10' transform='translate(0,40)'/%3e%3c/g%3e%3c/svg%3e")`,
        'flowing-texture': `url("data:image/svg+xml,%3csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' stroke='%23edc55f' stroke-width='0.5' opacity='0.3'%3e%3cpath d='M50 20c20-10 40 10 60 0s40-20 60-10' transform='rotate(15 100 100)'/%3e%3cpath d='M30 50c25-15 50 15 75 0s50-30 75-15' transform='rotate(30 100 100)'/%3e%3cpath d='M40 80c30-20 60 20 90 0s60-40 90-20' transform='rotate(45 100 100)'/%3e%3c/g%3e%3c/svg%3e")`,
      },
    },
  },
  plugins: [],
}