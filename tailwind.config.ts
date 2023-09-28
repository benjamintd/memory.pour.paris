import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      animation: {
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(-2px) " },
          "10%, 90%": { transform: "translateX(1px)" },
          "30%, 50%, 70%": { transform: "translateX(2px)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/container-queries")],
};

export default config;
