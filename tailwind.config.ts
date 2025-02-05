import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      height: {
        "content-plan": "calc(100vh - 310px)",
      },
      maxHeight: {
        "content-plan": "calc(100vh - 310px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
