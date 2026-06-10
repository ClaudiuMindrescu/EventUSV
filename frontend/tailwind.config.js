/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'usv-blue': '#6366f1',
        'usv-gold': '#22d3ee',
        'ink': '#07070b',
        'panel': '#11131c',
        'line': '#2a2f45',
        'neon': '#22d3ee',
        'violetline': '#8b5cf6',
      },
    },
  },
  plugins: [],
};
