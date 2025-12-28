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
        // ALCHEMY - Onyx & Oro Palette
        obsidian: "#0A0A0A",
        crucible: "#1A1A1A",
        gold: {
          DEFAULT: "#D4AF37",
          muted: "#8C7330",
          light: "#E5C76B",
          dark: "#A68B2A",
        },
        // Legacy support
        fire: {
          500: "#D4AF37",
          600: "#A68B2A",
          700: "#8C7330",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        headline: ["var(--font-headline)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out forwards",
        "slide-up": "slideUp 0.8s ease-out forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "transmute": "transmute 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(212, 175, 55, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        transmute: {
          "0%": { filter: "brightness(1) saturate(1)" },
          "50%": { filter: "brightness(1.2) saturate(1.3)" },
          "100%": { filter: "brightness(1) saturate(1)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "alchemy-gradient": "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)",
        "gold-gradient": "linear-gradient(135deg, #8C7330 0%, #D4AF37 50%, #E5C76B 100%)",
      },
      boxShadow: {
        "gold": "0 4px 20px rgba(212, 175, 55, 0.15)",
        "gold-lg": "0 0 25px rgba(212, 175, 55, 0.4)",
        "gold-glow": "0 0 40px rgba(212, 175, 55, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
