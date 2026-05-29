/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"Space Grotesk"', '"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        base: "#0A0B0F",
        surface: "#11141B",
        elevated: "#161A23",
        sunken: "#08090D",
        glass: "rgba(17, 20, 27, 0.72)",
        primary: "#E6E8EC",
        secondary: "#9CA3B0",
        muted: "#6B7280",
        faint: "#4B5260",
        accent: {
          DEFAULT: "#06B6D4",
          soft: "rgba(6, 182, 212, 0.12)",
          glow: "rgba(6, 182, 212, 0.35)",
          ink: "#0E7490",
        },
        brand2: "#8B5CF6",
        success: "#10B981",
        danger: "#F43F5E",
        warning: "#F59E0B",
        info: "#38BDF8",
      },
      borderColor: {
        DEFAULT: "rgba(255, 255, 255, 0.08)",
        default: "rgba(255, 255, 255, 0.08)",
        subtle: "rgba(255, 255, 255, 0.05)",
        strong: "rgba(255, 255, 255, 0.14)",
        accent: "rgba(6, 182, 212, 0.45)",
      },
      divideColor: {
        DEFAULT: "rgba(255, 255, 255, 0.06)",
        default: "rgba(255, 255, 255, 0.08)",
        subtle: "rgba(255, 255, 255, 0.05)",
        strong: "rgba(255, 255, 255, 0.12)",
      },
      ringColor: {
        DEFAULT: "rgba(6, 182, 212, 0.5)",
        accent: "rgba(6, 182, 212, 0.5)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #06B6D4 0%, #8B5CF6 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(139,92,246,0.12) 100%)",
        "mesh-glow":
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(6,182,212,0.08), transparent 70%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(139,92,246,0.06), transparent 70%)",
        "card-gradient":
          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 100%)",
        "border-gradient":
          "linear-gradient(135deg, rgba(6,182,212,0.5) 0%, rgba(139,92,246,0.3) 50%, rgba(255,255,255,0.05) 100%)",
      },
      boxShadow: {
        card:
          "0 1px 2px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.06)",
        "card-hover":
          "0 8px 32px -8px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(6, 182, 212, 0.25), 0 0 24px -6px rgba(6, 182, 212, 0.2)",
        modal:
          "0 24px 64px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 80px -20px rgba(6, 182, 212, 0.2)",
        glow:
          "0 0 0 1px rgba(6, 182, 212, 0.4), 0 0 24px -4px rgba(6, 182, 212, 0.5)",
        "glow-lg":
          "0 0 0 1px rgba(6, 182, 212, 0.5), 0 0 48px -8px rgba(6, 182, 212, 0.6)",
        "glow-violet":
          "0 0 0 1px rgba(139, 92, 246, 0.4), 0 0 24px -4px rgba(139, 92, 246, 0.45)",
        focus: "0 0 0 3px rgba(6, 182, 212, 0.3)",
        sm: "0 1px 2px rgba(0, 0, 0, 0.4)",
        "inner-glow": "inset 0 0 0 1px rgba(6, 182, 212, 0.4)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "18px",
        "2xl": "20px",
        "3xl": "24px",
      },
      fontSize: {
        eyebrow: ["11px", { lineHeight: "14px", letterSpacing: "0.12em", fontWeight: "600" }],
        caption: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        body: ["14px", { lineHeight: "20px" }],
        h3: ["14px", { lineHeight: "20px", fontWeight: "600", letterSpacing: "-0.01em" }],
        h2: ["18px", { lineHeight: "24px", fontWeight: "600", letterSpacing: "-0.015em" }],
        h1: ["24px", { lineHeight: "30px", fontWeight: "600", letterSpacing: "-0.02em" }],
        display: ["36px", { lineHeight: "40px", fontWeight: "600", letterSpacing: "-0.025em" }],
        "num-sm": ["13px", { lineHeight: "18px", fontWeight: "500" }],
        "num-md": ["15px", { lineHeight: "20px", fontWeight: "500" }],
        "num-lg": ["24px", { lineHeight: "28px", fontWeight: "500", letterSpacing: "-0.015em" }],
        "num-hero": ["32px", { lineHeight: "36px", fontWeight: "500", letterSpacing: "-0.02em" }],
      },
      animation: {
        "fade-up": "fadeUp 380ms cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fadeIn 200ms ease-out both",
        "scale-in": "scaleIn 280ms cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.8s linear infinite",
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
        "orb-float": "orbFloat 12s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.96) translateY(8px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(6,182,212,0.5)" },
          "50%": { boxShadow: "0 0 0 8px rgba(6,182,212,0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.6, transform: "scale(0.85)" },
        },
        orbFloat: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -20px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        fast: "120ms",
        slow: "280ms",
        page: "380ms",
      },
    },
  },
  plugins: [],
};
