import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Allison's pastel rainbow classroom palette
        accent: {
          pink: '#ff89c6',        // Hot pink
          'light-pink': '#ffbed2', // Light pink
          yellow: '#ffe08d',       // Pale yellow
          cyan: '#00d0d0',         // Turquoise/cyan
          'sky-blue': '#69dcf1',   // Light blue
          lavender: '#acaeeb',     // Periwinkle/lavender
          purple: '#d596cd',       // Mauve/light purple
        },
        // Base neutrals
        neutral: {
          'off-white': '#f9f9f9',
          'light-gray': '#f3f3f3',
          'medium-gray': '#e8e8e8',
          'dark-gray': '#5a5a5a',
          text: '#333333',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Garamond', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        'card-gap': '1.5rem',
        'section-gap': '2rem',
      },
    },
  },
  plugins: [],
}

export default config
