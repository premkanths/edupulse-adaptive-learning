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
          blue: '#3B82F6', // Vivid Royal Academic Blue
          indigo: '#4F46E5', // Electric Indigo
          violet: '#8B5CF6',
          cyan: '#06B6D4',
          teal: '#0D9488',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          lightBg: '#F8FAFC',    // Crisp Academic Slate-50 Canvas
          lightCard: '#FFFFFF',  // Pure Crisp White Card
          lightBorder: '#E2E8F0', // Crisp Slate-200 Border
          darkBg: '#090E17',     // Deep Midnight Obsidian Canvas
          darkCard: '#131C2E',   // Elevated Midnight Navy Card (High Contrast)
          darkCardSubtle: '#0D1424', // Inner Wells / Sub-Cards
          darkBorder: '#23324D', // Sharp Defined Border
          darkBorderSubtle: '#1A263B',
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
        'glow-indigo': '0 0 30px -5px rgba(79, 70, 229, 0.3)',
        'glow-teal': '0 0 30px -5px rgba(13, 148, 136, 0.3)',
        'glow-purple': '0 0 30px -5px rgba(139, 92, 246, 0.3)',
        'luxe': '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'luxe-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(35, 50, 77, 0.6)',
      }
    },
  },
  plugins: [],
}
