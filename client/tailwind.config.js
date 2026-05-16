/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#6D28D9',
        },
        secondary: {
          DEFAULT: '#EC4899',
          dark: '#BE185D',
        },
        accent: {
          DEFAULT: '#10B981',
          dark: '#047857',
        },
        background: '#0F172A',
      },
      boxShadow: {
        'neon-purple': '0 0 15px rgba(139, 92, 246, 0.5)',
        'neon-pink': '0 0 15px rgba(236, 72, 153, 0.5)',
      }
    },
  },
  plugins: [],
}
