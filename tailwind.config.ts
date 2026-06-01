import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        navy: { DEFAULT: "var(--navy)", deep: "var(--navy-deep)" },
        "brand-red": "var(--brand-red)",
        "brand-orange": "var(--brand-orange)",
        success: "var(--success)",
        warning: "var(--warning)",
        cyan: "var(--cyan)",
        card: "var(--card)",
        popover: "var(--popover)",
        primary: { DEFAULT: "var(--primary)", foreground: "var(--primary-foreground)" },
        secondary: { DEFAULT: "var(--secondary)", foreground: "var(--secondary-foreground)" },
        muted: { DEFAULT: "var(--muted)", foreground: "var(--muted-foreground)" },
        accent: { DEFAULT: "var(--accent)", foreground: "var(--accent-foreground)" },
        destructive: { DEFAULT: "var(--destructive)", foreground: "var(--destructive-foreground)" },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["Inter", "DM Sans", "sans-serif"],
        sans: ["Inter", "DM Sans", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        kenburns: { "0%": { transform: "scale(1)" }, "100%": { transform: "scale(1.10)" } },
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(60px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(239,68,68,0.6)" },
          "100%": { boxShadow: "0 0 0 16px rgba(239,68,68,0)" },
        },
        "glow-pulse": {
          "0%,100%": { boxShadow: "0 0 0 0 currentColor, 0 0 12px 2px currentColor", transform: "scale(1)" },
          "50%": { boxShadow: "0 0 0 10px transparent, 0 0 22px 6px currentColor", transform: "scale(1.08)" },
        },
        "return-arrow": {
          "0%,100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-10px)" },
        },
        "dash-flow": { to: { strokeDashoffset: "-200" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        kenburns: "kenburns 6s ease-out forwards",
        "slide-up-fade": "slide-up-fade 0.8s cubic-bezier(.2,.7,.2,1) forwards",
        "pulse-ring": "pulse-ring 1.8s infinite",
        "glow-pulse": "glow-pulse 1.6s ease-in-out infinite",
        "return-arrow": "return-arrow 1.4s ease-in-out infinite",
        "dash-flow": "dash-flow 4s linear infinite",
        "spin-slow": "spin-slow 20s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
