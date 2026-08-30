import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#051424",
        "on-background": "#d4e4fa",
        surface: "#051424",
        "surface-dim": "#051424",
        "surface-bright": "#2c3a4c",
        "surface-container-lowest": "#010f1f",
        "surface-container-low": "#0d1c2d",
        "surface-container": "#122131",
        "surface-container-high": "#1c2b3c",
        "surface-container-highest": "#273647",
        "on-surface": "#d4e4fa",
        "on-surface-variant": "#c2c6d6",
        primary: "#adc6ff",
        "on-primary": "#002e6a",
        "primary-container": "#4d8eff",
        "on-primary-container": "#00285d",
        secondary: "#d0bcff",
        "secondary-container": "#571bc1",
        "on-secondary-container": "#c4abff",
        tertiary: "#ffb786",
        outline: "#8c909f",
        "outline-variant": "#424754",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 15px rgba(173, 198, 255, 0.25)",
        "violet-glow": "0 0 20px rgba(139, 92, 246, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;
