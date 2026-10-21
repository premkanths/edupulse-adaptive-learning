/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academic: {
          navy: '#0F172A',
          blue: '#4F46E5', // Luminous Electric Indigo
          indigo: '#6366F1',
          violet: '#8B5CF6',
          cyan: '#06B6D4',
          teal: '#0D9488',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          lightBg: '#F8FAFC',
          darkBg: '#090D16',   // Deep Obsidian Sapphire
          darkCard: '#0F1626', // Midnight Velvet Card
          darkBorder: '#1E2B47', // Crisp Metallic Border
          secondary: '#64748B',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      boxShadow: {
        'glow-indigo': '0 0 35px -5px rgba(99, 102, 241, 0.25)',
        'glow-teal': '0 0 35px -5px rgba(13, 148, 136, 0.25)',
        'glow-purple': '0 0 35px -5px rgba(139, 92, 246, 0.25)',
        'luxe': '0 10px 30px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'luxe-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
