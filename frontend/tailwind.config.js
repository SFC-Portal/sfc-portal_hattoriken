/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sfc: {
          blue: "#003087",
          lightBlue: "#0055A5",
          accent: "#00A0E9",
        },
      },
    },
  },
  plugins: [],
};
