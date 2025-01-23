/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        muted: '#6c757d'
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
      },
      height: {
        '128': '32rem',
      },
      zIndex: {
        '100': '100',
      },
    },
  },
  plugins: [],
}
