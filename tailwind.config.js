/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B2420",
          light: "#26332D",
          soft: "#31413A",
        },
        paper: {
          DEFAULT: "#F3EFE4",
          dim: "#E8E2D1",
        },
        turmeric: {
          DEFAULT: "#D9A331",
          dark: "#B8862A",
        },
        chili: {
          DEFAULT: "#A63D2F",
          dark: "#8A3226",
        },
        leaf: {
          DEFAULT: "#4F6F52",
          dark: "#3D5940",
        },
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Karla", "sans-serif"],
        ticket: ["Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
}
