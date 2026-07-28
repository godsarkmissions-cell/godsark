import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Palette extracted directly from the God's Ark Missions logo
        primary: {
          DEFAULT: "#027DB8", // deep logo blue (the "A" / crescent)
          light: "#219ACF",   // lighter logo blue (crescent highlight)
          dark: "#015A85",
        },
        accent: {
          DEFAULT: "#FEA104", // logo orange (the "7" swoosh)
          light: "#FFC160",
          dark: "#C97C00",
        },
        ink: {
          DEFAULT: "#0B1E33", // near-navy used for "God's Ark" wordmark
          light: "#1B324D",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        script: ["'Segoe Script'", "cursive"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #027DB8 0%, #219ACF 55%, #FEA104 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
