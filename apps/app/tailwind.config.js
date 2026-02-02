/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: "var(--t-primary)",
          "primary-hover": "var(--t-primary-hover)",
          "primary-dim": "var(--t-primary-dim)",
          "primary-faint": "var(--t-primary-faint)",
          secondary: "var(--t-secondary)",
          muted: "var(--t-muted)",
          bg: "var(--t-bg)",
          surface: "var(--t-surface)",
          "surface-hover": "var(--t-surface-hover)",
          border: "var(--t-border)",
          "border-strong": "var(--t-border-strong)",
          accent: "var(--t-accent)",
          glow: "var(--t-glow)",
          "text-on-accent": "var(--t-text-on-accent)",
        },
      },
    },
  },
  plugins: [],
};
