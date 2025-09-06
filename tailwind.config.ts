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
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
        },
        'warm': {
          50: '#fefdf8',
          100: '#fdf6e3',
        }
      },
      fontFamily: {
        'brand': ['Varela Round', 'system-ui', 'sans-serif'],
        'display': ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
}