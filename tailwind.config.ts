import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0d1014",
        panel: "#131821",
        border: "#2b3340",
        accent: "#22c55e",
        muted: "#8892a0"
      },
      fontFamily: {
        mono: ["Fira Code", "Consolas", "Menlo", "monospace"],
        sans: ["IBM Plex Sans", "Segoe UI", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
} satisfies Config;
