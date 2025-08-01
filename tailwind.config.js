/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: '#FF693E',
          light: '#FF7348',
          dark: '#FF5C39',
        },
        navy: '#0E1220',
        offwhite: '#F3F6F9',
        cloudwhite: '#FFFFFF',
      },
      keyframes: {
        floating: {
          "0%": { transform: "translate(-50%, -50%) translate(0px, 0px)" },
          "50%": { transform: "translate(-50%, -50%) translate(20px, 20px)" },
          "100%": { transform: "translate(-50%, -50%) translate(0px, 0px)" },
        },
        "dot-squeeze-right": {
          "0%": { transform: "translateX(-50%) scaleX(1)" },
          "50%": { transform: "translateX(-25%) scaleX(0.5)" },
          "100%": { transform: "translateX(-50%) scaleX(1)" },
        },
        "dot-squeeze-left": {
          "0%": { transform: "translateX(-50%) scaleX(1)" },
          "50%": { transform: "translateX(-75%) scaleX(0.5)" },
          "100%": { transform: "translateX(-50%) scaleX(1)" },
        },
        "dot-move": {
          "0%": {
            width: "0.5rem",
            transform: "translateX(-25%)",
          },
          "50%": {
            width: "1.5rem",
            transform: "translateX(-50%)",
          },
          "100%": {
            width: "0.5rem",
            transform: "translateX(-75%)",
          },
        },
      },
      animation: {
        floating: "floating 6s ease-in-out infinite",
        "dot-squeeze-right": "dot-squeeze-right 0.5s ease-in-out",
        "dot-squeeze-left": "dot-squeeze-left 0.5s ease-in-out",
        "dot-move": "dot-move 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        space: ["var(--font-space-grotesk)", ...defaultTheme.fontFamily.sans],
        inter: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-jetbrains-mono)", ...defaultTheme.fontFamily.mono],
      },
      fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
