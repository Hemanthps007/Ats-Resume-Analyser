import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#090b10",
          900: "#0f121c",
          850: "#151928",
          800: "#1d2338",
          750: "#272f4a",
          700: "#353f61",
          600: "#4b5882",
          500: "#6876a3",
          400: "#8f9bc2",
          300: "#b6c0de",
          200: "#dbe1f1",
          100: "#f0f3fa",
          50: "#f8faff",
        },
        signal: {
          600: "#059669",
          500: "#10b981",
          400: "#34d399",
          300: "#6ee7b7",
          200: "#a7f3d0",
          100: "#d1fae5",
          50: "#ecfdf5",
        },
        cyber: {
          cyan: "#06b6d4",
          violet: "#8b5cf6",
          indigo: "#6366f1",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      fontFamily: {
        display: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "12px",
        xlCard: "18px",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(16, 185, 129, 0.25)",
        cyanGlow: "0 0 25px -5px rgba(6, 182, 212, 0.25)",
        violetGlow: "0 0 25px -5px rgba(139, 92, 246, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
