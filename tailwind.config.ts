import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      // Custom fonts for chunky typography
      fontFamily: {
        "brutalist": ["Inter", "system-ui", "sans-serif"],
        "chunky": ["Inter Black", "Inter", "system-ui", "sans-serif"],
      },

      // Enhanced font weights
      fontWeight: {
        "chunky": "900",
        "thick": "800",
        "bold": "700",
        "medium": "500",
        "normal": "400",
      },

      // Generous letter spacing for brutalist feel
      letterSpacing: {
        "chunky": "0.05em",
        "wide": "0.025em",
        "wider": "0.05em",
        "widest": "0.1em",
      },

      // Enhanced size scale for chonky elements
      spacing: {
        "18": "4.5rem", // 72px
        "22": "5.5rem", // 88px
        "26": "6.5rem", // 104px
        "30": "7.5rem", // 120px
        "34": "8.5rem", // 136px
        "38": "9.5rem", // 152px
      },

      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "breathe": "breathe 3s ease-in-out infinite",
        "button-glow": "button-glow 2s ease-in-out infinite",
        "rainbow-flow": "rainbow-flow 3s linear infinite",
        "squish": "squish 0.15s ease-out",
        "pop": "pop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "recording-pulse": "recording-pulse 1s ease-in-out infinite",
        "success-pop": "success-pop 0.6s ease-out",
        "error-shake": "error-shake 0.5s ease-in-out",
        "waveform": "waveform 0.8s ease-in-out infinite alternate",
        "flamingo-glow": "flamingo-glow 4s ease-in-out infinite",
        "sunset-pulse": "sunset-pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
      },

      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        "breathe": {
          "0%, 100%": {
            transform: "scale(1)",
            filter:
              "drop-shadow(0 8px 16px rgba(0,0,0,0.25)) drop-shadow(0 0 20px rgba(255,149,0,0.2))",
          },
          "50%": {
            transform: "scale(1.02)",
            filter:
              "drop-shadow(0 12px 24px rgba(0,0,0,0.3)) drop-shadow(0 0 30px rgba(255,149,0,0.4))",
          },
        },
        "button-glow": {
          "0%, 100%": {
            filter:
              "drop-shadow(0 8px 16px rgba(0,0,0,0.25)) drop-shadow(0 0 20px rgba(255,149,0,0.3))",
          },
          "50%": {
            filter:
              "drop-shadow(0 12px 24px rgba(0,0,0,0.35)) drop-shadow(0 0 30px rgba(255,149,0,0.5))",
          },
        },
        "rainbow-flow": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
        "squish": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
          "100%": { transform: "scale(1)" },
        },
        "recording-pulse": {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "1",
          },
          "50%": {
            transform: "scale(1.05)",
            opacity: "0.8",
          },
        },
        "success-pop": {
          "0%": {
            transform: "scale(0) rotate(-45deg)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.1) rotate(10deg)",
          },
          "100%": {
            transform: "scale(1) rotate(0deg)",
            opacity: "1",
          },
        },
        "error-shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%": { transform: "translateX(-10px)" },
          "20%": { transform: "translateX(10px)" },
          "30%": { transform: "translateX(-10px)" },
          "40%": { transform: "translateX(10px)" },
          "50%": { transform: "translateX(-5px)" },
          "60%": { transform: "translateX(5px)" },
          "70%": { transform: "translateX(0)" },
        },
        "waveform": {
          "0%": { transform: "scaleY(1)" },
          "100%": { transform: "scaleY(0.3)" },
        },
        "flamingo-glow": {
          "0%, 100%": {
            filter:
              "drop-shadow(0 0 20px rgba(255,105,180,0.6)) drop-shadow(0 0 40px rgba(255,20,147,0.4))",
          },
          "50%": {
            filter:
              "drop-shadow(0 0 30px rgba(255,105,180,0.8)) drop-shadow(0 0 60px rgba(255,20,147,0.6))",
          },
        },
        "sunset-pulse": {
          "0%, 100%": {
            filter:
              "drop-shadow(0 0 20px rgba(255,94,77,0.6)) drop-shadow(0 0 40px rgba(255,154,0,0.4))",
          },
          "50%": {
            filter:
              "drop-shadow(0 0 30px rgba(255,94,77,0.8)) drop-shadow(0 0 60px rgba(255,154,0,0.6))",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },

      // Custom colors for panels - explicitly define them
      colors: {
        // Our panel colors
        panel: {
          red: "#fecaca",
          orange: "#fed7aa",
          yellow: "#fef3c7",
          purple: "#e9d5ff",
          cyan: "#cffafe",
          green: "#d1fae5",
        },
      },

      // Additional border widths for chunky borders
      borderWidth: {
        "3": "3px",
        "5": "5px",
      },
    },
  },
  plugins: [],
} satisfies Config;
