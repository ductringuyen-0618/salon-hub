/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#d34000",
          hover: "#b8380a",
          dark: "#7c2d12",
          soft: "#fef2f2",
        },
        ink: { DEFAULT: "#111827", soft: "#4b5563" },
        line: "#e5e7eb",
        paper: "#fafafa",
      },
    },
  },
  plugins: [],
};
