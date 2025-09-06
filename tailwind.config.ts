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
        periwinkle: {
          50: '#f4f3ff',
          100: '#ebe9fe',
          200: '#d9d6fe',
          300: '#beb7fd',
          400: '#9d8dfa',
          500: '#7e5ef6',
          600: '#6b3eed',
        },
        cream: {
          50: '#fefcfa',
          100: '#fdf7f0',
          200: '#f9ede1',
        },
        sage: {
          600: '#6f7d5c',
          700: '#59624a',
          800: '#495040',
        }
      },
    },
  },
  plugins: [],
}