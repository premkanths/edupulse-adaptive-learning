import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { cycleTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={cycleTheme}
      type="button"
      className={`group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-95 ${
        isDark
          ? 'bg-gray-800 hover:bg-gray-700 text-amber-300 border-gray-700 shadow-sm'
          : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 shadow-xs'
      } ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle color theme"
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          <span className="hidden sm:inline text-gray-200">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
          <span className="hidden sm:inline text-gray-700">Dark</span>
        </>
      )}
    </button>
  );
};
