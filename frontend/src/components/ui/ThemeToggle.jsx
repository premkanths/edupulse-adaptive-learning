import React from 'react';
import { Sun, Moon, Crown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={`inline-flex items-center p-0.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/90 dark:bg-gray-800/90 shadow-inner select-none transition-colors ${className}`}
    >
      {/* Light Option */}
      <button
        onClick={() => setTheme('light')}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
          theme === 'light'
            ? 'bg-white text-gray-900 shadow-xs font-bold'
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        title="Light theme"
      >
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500 fill-amber-500/30' : ''}`} />
        <span className="hidden sm:inline">Light</span>
      </button>

      {/* Premium Option */}
      <button
        onClick={() => setTheme('premium')}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
          theme === 'premium'
            ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-xs font-bold'
            : 'text-amber-700/80 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300'
        }`}
        title="Premium luxury light theme with warm shady tones"
      >
        <Crown className={`w-3.5 h-3.5 ${theme === 'premium' ? 'text-amber-100 fill-amber-200/40' : 'text-amber-600'}`} />
        <span className="hidden sm:inline">Premium</span>
      </button>

      {/* Dark Option */}
      <button
        onClick={() => setTheme('dark')}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
          theme === 'dark'
            ? 'bg-gray-900 text-gray-100 shadow-xs font-bold'
            : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
        title="Dark theme"
      >
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-indigo-400 fill-indigo-400/30' : ''}`} />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
};
