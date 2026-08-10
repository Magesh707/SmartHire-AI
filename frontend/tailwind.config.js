/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sleek modern HR theme colors (slate-grey, deep indigo, teal highlights, rose error accents)
        brand: {
          50: '#f5f7fa',
          100: '#eaeef4',
          200: '#d5dee9',
          300: '#b3c3d7',
          400: '#8ca3c1',
          500: '#647ea3',
          600: '#4e6488',
          700: '#40516f',
          800: '#37445c',
          900: '#303b4f',
          950: '#202735',
        }, 
        accent: {
          50: '#eefcfc',
          100: '#d4f7f6',
          200: '#aeedeb',
          300: '#77dedc',
          400: '#45c5c3',
          500: '#14a3a1',
          600: '#198b8a',
          700: '#1b6f6f',
          800: '#1c5959',
          900: '#1c4a4a',
        }
      },
    },
  },
  plugins: [],
};
