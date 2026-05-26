/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'usv-blue': '#005ba1',
        'usv-gold': '#ffcc00',
      },
    },
  },
  plugins: [],
};