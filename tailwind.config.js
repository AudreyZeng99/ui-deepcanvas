/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        // 5-Level System
        promotion: {
          DEFAULT: "var(--promotion)",
          foreground: "var(--promotion-foreground)",
        },
        minor: {
          DEFAULT: "var(--minor)",
          foreground: "var(--minor-foreground)",
        },
        // Legacy/Aliases
        "accent-blue": "var(--accent-primary)",
        "accent-orange": "var(--accent-secondary)",
        "accent-primary": "var(--accent-primary)",
        "accent-secondary": "var(--accent-secondary)",
        "card-primary": "var(--card-primary)",
        "card-dark": "var(--card-dark)",
        "card-light": "var(--card-light)",
        "theme-border": "var(--border-color)",
        "primary-border": "var(--primary-border)",
        "promotion-border": "var(--promotion-border)",
        "minor-border": "var(--minor-border)",
        "accent-purple": "var(--accent-purple)",
        "accent-green": "var(--accent-green)",
      },
      borderRadius: {
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}
