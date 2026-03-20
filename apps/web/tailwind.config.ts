import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        primary: "var(--color-primary-default, var(--color-primary))",
        "primary-hover": "var(--color-primary-hover)",
        "primary-active": "var(--color-primary-active)",
        "primary-subtle": "var(--color-primary-subtle)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        border: "var(--color-border-default, var(--color-border))",

        surface: "var(--color-surface-default)",
        muted: "var(--color-fg-muted)",
        text: "var(--color-fg-default)",

        "bg-base": "var(--color-bg-base)",
        "bg-subtle": "var(--color-bg-subtle)",
        "bg-muted": "var(--color-bg-muted)",
        "bg-emphasis": "var(--color-bg-emphasis)",

        xp: "var(--color-xp)",
        streak: "var(--color-streak)",
        badge: "var(--color-badge)",
        coin: "var(--color-coin)",

        success: "var(--color-success-default)",
        warning: "var(--color-warning-default)",
        error: "var(--color-error-default)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        fadeIn: "fadeIn 0.3s ease-out forwards",
        slideInLeft: "slideInLeft 0.3s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
