/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"], // future-proofing for dark mode
 content: [
  "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",
],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        nunito: ["Nunito", "sans-serif"],
      },
      colors: {
        primary: {
          50: "#eef6ff",
          100: "#d9e9ff",
          200: "#b5d2ff",
          300: "#84b3ff",
          400: "#4b8bff",
          500: "#2563eb", // main blue
          600: "#1e50c3",
          700: "#183f99",
          800: "#122e73",
          900: "#0b1e4d",
        },
        secondary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        success: "#16a34a",
        warning: "#f59e0b",
        error: "#dc2626",
        accent: "#06b6d4",
      },
      boxShadow: {
        soft: "0 4px 24px rgba(0,0,0,0.08)",
        card: "0 6px 25px rgba(37,99,235,0.1)",
        glow: "0 0 20px rgba(37,99,235,0.3)",
      },
      backgroundImage: {
        "gradient-glass":
          "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 100%)",
        "blue-gradient":
          "linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)",
        "green-gradient":
          "linear-gradient(135deg, #4ade80 0%, #16a34a 100%)",
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        fadeIn: "fadeIn 1.2s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
