/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: { lift: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" },
      colors: {
        brand: {
          DEFAULT: "#d34000",
          hover: "#b8380a",
          dark: "#7c2d12",
          soft: "#fef2f2",
        },
        ink: { DEFAULT: "#111827", soft: "#4b5563", muted: "#6b7280" },
        line: "#e5e7eb",
        paper: "#fafafa",
        surface: "#ffffff",
        accent: "#f59e0b",
      },
    },
  },
  plugins: [],
};
