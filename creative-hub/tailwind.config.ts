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
        // WHITE TIGER - Cyberpunk Purple Palette
        obsidian: "#0A0A0A",
        crucible: "#1A1A1A",
        tiger: {
          DEFAULT: "#8B5CF6",
          muted: "#6D28D9",
          light: "#A78BFA",
          dark: "#7C3AED",
          glow: "#C4B5FD",
        },
        neon: {
          cyan: "#22D3EE",
          pink: "#F472B6",
          blue: "#3B82F6",
        },
        // Legacy support (gold → tiger alias)
        gold: {
          DEFAULT: "#8B5CF6",
          muted: "#6D28D9",
          light: "#A78BFA",
          dark: "#7C3AED",
        },
        fire: {
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
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
        "neon-flicker": "neonFlicker 3s ease-in-out infinite",
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(139, 92, 246, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(139, 92, 246, 0.6)" },
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
        neonFlicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
          "75%": { opacity: "1" },
          "90%": { opacity: "0.9" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "tiger-gradient": "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)",
        "purple-gradient": "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #A78BFA 100%)",
        "cyberpunk-gradient": "linear-gradient(135deg, #8B5CF6 0%, #F472B6 50%, #22D3EE 100%)",
        // Legacy
        "alchemy-gradient": "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)",
        "gold-gradient": "linear-gradient(135deg, #6D28D9 0%, #8B5CF6 50%, #A78BFA 100%)",
      },
      boxShadow: {
        "tiger": "0 4px 20px rgba(139, 92, 246, 0.15)",
        "tiger-lg": "0 0 25px rgba(139, 92, 246, 0.4)",
        "tiger-glow": "0 0 40px rgba(139, 92, 246, 0.3)",
        "neon": "0 0 20px rgba(34, 211, 238, 0.5)",
        // Legacy
        "gold": "0 4px 20px rgba(139, 92, 246, 0.15)",
        "gold-lg": "0 0 25px rgba(139, 92, 246, 0.4)",
        "gold-glow": "0 0 40px rgba(139, 92, 246, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
