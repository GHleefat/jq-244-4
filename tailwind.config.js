/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        wood: {
          50: "#FAF5F0",
          100: "#F3E7D9",
          200: "#E6CEB3",
          300: "#D4AE85",
          400: "#C08A55",
          500: "#A8703A",
          600: "#8B5A2B",
          700: "#704825",
          800: "#5A3A20",
          900: "#4A301C",
        },
        forest: {
          50: "#EAF2EC",
          100: "#CFE1D4",
          200: "#A5C3AE",
          300: "#72A181",
          400: "#4A805C",
          500: "#2D5A3D",
          600: "#214630",
          700: "#193626",
          800: "#132A1E",
          900: "#0E2118",
        },
      },
      fontFamily: {
        display: ["Lora", "Georgia", "serif"],
        sans: ["'Noto Sans SC'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)",
        "card-hover": "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.06)",
      },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
    },
  },
  plugins: [],
};
