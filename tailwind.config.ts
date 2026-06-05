import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#0D4091',
          celeste: '#2A8BF6',
          orange: '#FF8F00',
          red: '#F4511E',
          green: '#43A047',
          dark: '#141414',
          light: '#F8FAFC',
          gray: '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Barlow', 'Work Sans', 'sans-serif'],
        display: ['var(--font-display)', 'Barlow Semi Condensed', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
