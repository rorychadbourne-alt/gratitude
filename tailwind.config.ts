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
        periwinkle: {
          50: '#f4f3ff',
          100: '#ebe9fe',
          200: '#d9d6fe',
          300: '#beb7fd',
          400: '#9d8dfa',
          500: '#7e5ef6',
          600: '#6b3eed',
          700: '#5a2ed9',
          800: '#4c26b6',
          900: '#402195',
        },
        // Muted gold backgrounds
        gold: {
          50: '#fefdfb',
          100: '#fdf9f0',
          200: '#fbf0d9',
          300: '#f7e4b8',
          400: '#f2d485',
          500: '#edc55f',
          600: '#e6b143',
          700: '#c29037',
          800: '#9d7232',
          900: '#805e2e',
        },
        // Creamy peach warmth
        peach: {
          50: '#fef8f4',
          100: '#fdeee6',
          200: '#fbdac7',
          300: '#f7c19d',
          400: '#f19f71',
          500: '#ec8051',
          600: '#dd6639',
          700: '#b7502f',
          800: '#92422c',
          900: '#763828',
        },
        // Warm neutrals for text/backgrounds
        cream: {
          50: '#fefcfa',
          100: '#fdf7f0',
          200: '#f9ede1',
          300: '#f3ddc7',
          400: '#ebc49f',
          500: '#dfa574',
          600: '#d18a52',
          700: '#af6d3c',
          800: '#8d5732',
          900: '#73482b',
        },
        // Soft grays
        sage: {
          50: '#f8f9f6',
          100: '#eef1ea',
          200: '#dde3d6',
          300: '#c4cfb8',
          400: '#a6b594',
          500: '#8a9b75',
          600: '#6f7d5c',
          700: '#59624a',
          800: '#495040',
          900: '#3e4438',
        }
      },
      fontFamily: {
        'brand': ['ui-rounded', 'system-ui', 'sans-serif'],
        'body': ['ui-serif', 'Georgia', 'serif'],
      },
      borderRadius: {
        'brand': '0.75rem',
        'brand-lg': '1rem',
      },
      boxShadow: {
        'gentle': '0 4px 6px -1px rgba(126, 94, 246, 0.1)',
        'soft': '0 1px 3px 0 rgba(126, 94, 246, 0.1)',
        'warm': '0 10px 15px -3px rgba(126, 94, 246, 0.1)',
      },
      backgroundImage: {
        'morning-gradient': 'linear-gradient(135deg, #fdf9f0 0%, #fef8f4 50%, #f8f9f6 100%)',
      },
    },
  },
  plugins: [],
}