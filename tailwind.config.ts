import type { Config } from "tailwindcss"

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "fitness-gray": "oklch(44.6% 0.03 256.802)",
        "fitness-dark-gray": "oklch(13% 0.028 261.692)",
        "fitness-light-gray": "oklch(87.2% 0.01 258.338)",
        "fitness-green": "oklch(62.7% 0.194 149.214)",
        "fitness-dark-green": "oklch(44.8% 0.119 151.328)",
        "fitness-light-green": "oklch(87.1% 0.15 154.449)",
        "fitness-orange": "oklch(64.6% 0.222 41.116)",
      },
    },
  },
  plugins: [],
} satisfies Config
