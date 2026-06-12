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
        esmeralda: '#004C63',
        celeste: '#54BCEB',
        amarillo: '#FF9B18',
        naranja: '#F34B26',
        'negro-base': '#141414',
        blanco: '#FFFFFF',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
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
        institutional: '#1B2A4A',
        cream: '#F8F5EE',
        'soft-green': '#E8F3ED',
      },
      fontFamily: {
        sans: ['Inter', 'var(--font-sans)', 'sans-serif'],
        display: ['Outfit', 'var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
