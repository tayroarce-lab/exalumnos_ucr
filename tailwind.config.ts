import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        esmeralda: "#004C63",
        celeste: "#54BCEB",
        amarillo: "#FF9B18",
        naranja: "#F34B26",
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Fallback if no local font
      },
    },
  },
  plugins: [],
};
export default config;
