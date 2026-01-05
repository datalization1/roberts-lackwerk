/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        surface: "#141415",
        surfaceStrong: "#1b1c1f",
        border: "#2a2b2f",
        text: "#f5f5f7",
        muted: "#aeb0b7",
        accent: "#dc2626",
        accentSoft: "#2d0f12",
      },
      borderRadius: {
        "fig": "14px",
      },
    },
  },
  plugins: [],
};
