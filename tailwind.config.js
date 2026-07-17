/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: {
          25: "#fffbfc",
        },
      },
      fontFamily: {
        sans: ["'Poppins'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
