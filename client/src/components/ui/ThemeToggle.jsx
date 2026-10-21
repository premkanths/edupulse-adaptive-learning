import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { toggleTheme, theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 select-none ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700/80 text-slate-100 border-slate-700 shadow-xs'
          : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-xs'
      } ${className}`}
      title={isDark ? "Dark theme active (click for Light mode)" : "Light theme active (click for Dark mode)"}
      aria-label="Toggle color theme"
    >
      {isDark ? (
        <>
          <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
          <span className="text-slate-200 font-medium">Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          <span className="text-slate-800 font-medium">Light</span>
        </>
      )}
    </button>
  );
};
