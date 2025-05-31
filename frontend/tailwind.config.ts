/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [],
};

export default config; 