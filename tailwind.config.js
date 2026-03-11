/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)",
        lifted:
          "0 8px 24px -4px rgba(0,0,0,0.09), 0 2px 8px -2px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-up": "fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      colors: {
        ink: "#111110",
        surface: "#F7F6F3",
        faint: "#F0EFEc",
        border: "#E6E4DF",
        muted: "#9A9890",
      },
    },
  },
  plugins: [],
};
