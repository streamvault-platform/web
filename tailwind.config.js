/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
    "./stores/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontSize: {
        xs:    ["13px", { lineHeight: "18px" }],
        sm:    ["15px", { lineHeight: "22px" }],
        base:  ["17px", { lineHeight: "26px" }],
        lg:    ["19px", { lineHeight: "28px" }],
        xl:    ["21px", { lineHeight: "30px" }],
        "2xl": ["26px", { lineHeight: "34px" }],
        "3xl": ["30px", { lineHeight: "38px" }],
      },
      colors: {
        // ── Semantic tokens ───────────────────────────────────────────────
        // Change values here to retheme the entire app.
        // In components: bg-background dark:bg-background-dark, etc.
        background: {
          DEFAULT: "#ffffff",
          dark: "#09090b",
        },
        surface: {
          DEFAULT: "#f4f4f5",
          dark: "#18181b",
        },
        foreground: {
          DEFAULT: "#09090b",
          dark: "#fafafa",
        },
        "foreground-muted": {
          DEFAULT: "#71717a",
          dark: "#a1a1aa",
        },
        primary: {
          DEFAULT: "#6366f1",
          foreground: "#ffffff",
        },
        border: {
          DEFAULT: "#e4e4e7",
          dark: "#3f3f46",
        },
        destructive: {
          DEFAULT: "#ef4444",
          dark: "#f87171",
        },
      },
    },
  },
  plugins: [],
};
