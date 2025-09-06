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
        // Just add a few periwinkle shades to start
        'periwinkle': {
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
        },
        // And some warm background tones
        'warm': {
          50: '#fefdf8',
          100: '#fdf6e3',
        }
      },
    },
  },
  plugins: [],
}