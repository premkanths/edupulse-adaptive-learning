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
          blue: '#2563EB',         // Crisp Royal Academic Blue
          indigo: '#4F46E5',       // Deep Intelligence Indigo
          violet: '#7C3AED',
          cyan: '#06B6D4',
          teal: '#0D9488',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          lightBg: '#F8FAFC',       // Clean Porcelain Slate Canvas
          lightCard: '#FFFFFF',     // Pure White Card Surface
          lightCardSubtle: '#F1F5F9', // Recessed Well (Slate 100)
          lightBorder: '#E2E8F0',   // Hairline Border (Slate 200)
          lightText: '#0F172A',     // Charcoal Heading Text (Slate 900)
          lightSecondary: '#475569',// Body Text (Slate 600)
          darkBg: '#0B0F19',        // Deep Midnight Obsidian Canvas
          darkCard: '#111827',      // Elevated Deep Slate Card
          darkCardSubtle: '#1E293B',// Recessed Sub-Card / Inner Well (Slate 800)
          darkBorder: '#1E293B',    // Hairline Dark Border
          darkBorderSubtle: '#334155', // Highlighted Border (Slate 700)
          darkText: '#F8FAFC',      // Luminous High-Contrast Text (Slate 50)
          darkSecondary: '#94A3B8', // Luminous Muted Secondary Text (Slate 400)
          secondary: '#475569',
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
        'glow-indigo': '0 0 30px -5px rgba(79, 70, 229, 0.25)',
        'glow-teal': '0 0 30px -5px rgba(13, 148, 136, 0.25)',
        'luxe': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'luxe-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(30, 41, 59, 0.8)',
      }
    },
  },
  plugins: [],
}
