// tailwind.config.ts

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // This is the standard configuration for Next.js App Router:
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
