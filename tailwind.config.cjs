/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}", // add if applicable
    "./public/**/*.html", // add if you have static HTML files
  ],
  mode: "jit",
  theme: {
    extend: {},
  },
  plugins: [
    // require('@tailwindcss/forms'), // Uncomment if you use the forms plugin
    // require('@tailwindcss/typography'), // Uncomment if you use the typography plugin
  ],
};
