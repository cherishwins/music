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
        // WHITE TIGER - Synthwave Holographic Palette
        obsidian: "#050508",
        crucible: "#0A0A10",
        void: "#000000",
        tiger: {
          DEFAULT: "#FF10F0",      // Electric pink (PRIMARY)
          muted: "#CC00CC",
          light: "#FF6BF0",
          dark: "#AA00AA",
          glow: "#FF10F0",
        },
        neon: {
          cyan: "#00FFFF",         // Pure cyan
          pink: "#FF10F0",         // Hot pink
          blue: "#00BFFF",         // Electric blue
          purple: "#8B5CF6",       // Accent purple
          green: "#39FF14",        // Toxic green accent
        },
        holo: {
          pink: "#FF6BD6",
          cyan: "#00F5FF",
          purple: "#BF5FFF",
          shift: "#FF00FF",        // For animations
        },
        // Legacy support
        gold: {
          DEFAULT: "#FF10F0",
          muted: "#CC00CC",
          light: "#FF6BF0",
          dark: "#AA00AA",
        },
        fire: {
          500: "#FF10F0",
          600: "#00FFFF",
          700: "#8B5CF6",
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
          "0%, 100%": { boxShadow: "0 0 20px rgba(255, 16, 240, 0.4), 0 0 40px rgba(0, 255, 255, 0.2)" },
          "50%": { boxShadow: "0 0 40px rgba(255, 16, 240, 0.7), 0 0 80px rgba(0, 255, 255, 0.4)" },
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
        "tiger-gradient": "linear-gradient(135deg, #050508 0%, #0A0A10 50%, #050508 100%)",
        "synthwave-gradient": "linear-gradient(135deg, #FF10F0 0%, #00FFFF 50%, #8B5CF6 100%)",
        "holo-gradient": "linear-gradient(135deg, #FF6BD6 0%, #00F5FF 33%, #BF5FFF 66%, #FF10F0 100%)",
        "cyberpunk-gradient": "linear-gradient(135deg, #FF10F0 0%, #00FFFF 100%)",
        "neon-glow": "radial-gradient(ellipse at center, rgba(255, 16, 240, 0.3) 0%, transparent 70%)",
        // Legacy
        "alchemy-gradient": "linear-gradient(135deg, #050508 0%, #0A0A10 50%, #050508 100%)",
        "gold-gradient": "linear-gradient(135deg, #FF10F0 0%, #00FFFF 100%)",
        "purple-gradient": "linear-gradient(135deg, #FF10F0 0%, #8B5CF6 50%, #00FFFF 100%)",
      },
      boxShadow: {
        "tiger": "0 4px 20px rgba(255, 16, 240, 0.25)",
        "tiger-lg": "0 0 30px rgba(255, 16, 240, 0.5)",
        "tiger-glow": "0 0 50px rgba(255, 16, 240, 0.4)",
        "neon": "0 0 25px rgba(0, 255, 255, 0.6)",
        "neon-pink": "0 0 30px rgba(255, 16, 240, 0.6)",
        "holo": "0 0 40px rgba(255, 16, 240, 0.3), 0 0 80px rgba(0, 255, 255, 0.2)",
        // Legacy
        "gold": "0 4px 20px rgba(255, 16, 240, 0.25)",
        "gold-lg": "0 0 30px rgba(255, 16, 240, 0.5)",
        "gold-glow": "0 0 50px rgba(255, 16, 240, 0.4)",
      },
    },
  },
  plugins: [],
};

export default config;
