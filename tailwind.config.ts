import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#12141a",
          900: "#1b1e27",
          800: "#262a36",
          700: "#343947",
          600: "#4b5266",
          500: "#6b7286",
          400: "#8d93a4",
          300: "#b3b7c2",
          200: "#dadce2",
          100: "#eef0f3",
          50: "#f7f8fa",
        },
        signal: {
          600: "#3d6b52",
          500: "#4d8367",
          400: "#69a184",
          300: "#96c1ab",
          100: "#e2ede7",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
