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
          blue: '#4F46E5', // Option A Indigo Accent
          indigo: '#4F46E5',
          violet: '#8B5CF6',
          cyan: '#06B6D4',
          teal: '#0D9488',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          lightBg: '#F9FAFB',     // Option A Clean Slate Canvas
          lightCard: '#FFFFFF',   // Option A Clean White Card
          lightBorder: '#E5E7EB', // Option A Clean Border
          lightText: '#111827',
          lightSecondary: '#4B5563',
          darkBg: '#030712',      // Option A Midnight Obsidian Canvas
          darkCard: '#111827',    // Option A Elevated Slate Card
          darkCardSubtle: '#0B0F19', // Recessed Sub-Card / Inner Well
          darkBorder: '#1F2937',  // Option A Slate Border
          darkBorderSubtle: '#111827',
          darkText: '#F9FAFB',
          darkSecondary: '#9CA3AF',
          secondary: '#4B5563',
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
        'luxe': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'luxe-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(31, 41, 55, 0.6)',
      }
    },
  },
  plugins: [],
}
