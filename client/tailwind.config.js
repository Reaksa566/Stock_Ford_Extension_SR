/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ford-blue': '#102A43', // Custom primary color
        'ford-light': '#F0F4F8',
      },
    },
  },
  plugins: [],
}