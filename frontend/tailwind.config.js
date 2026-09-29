/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        surface: "#0e1526",
        "surface-card": "#131b31",
        "surface-border": "#1e293b",
        "brand-primary": "#38bdf8",
        "brand-accent": "#6366f1",
        "status-safe": "#10b981",
        "status-warning": "#f59e0b",
        "status-danger": "#ef4444",
        "status-conflict": "#ec4899",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(56, 189, 248, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(56, 189, 248, 0.6)" },
        }
      }
    },
  },
  plugins: [],
};
