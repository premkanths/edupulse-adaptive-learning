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
      className={`inline-flex items-center gap-1 p-1 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40 select-none ${
        isDark
          ? 'bg-slate-900 border-slate-700/80 shadow-inner'
          : 'bg-slate-100 border-slate-200 shadow-inner'
      } ${className}`}
      title={`Current: ${isDark ? 'Dark' : 'Light'} Mode. Click to switch to ${isDark ? 'Light' : 'Dark'} mode.`}
      aria-label="Toggle light and dark theme"
    >
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all duration-200 ${
          !isDark
            ? 'bg-white text-slate-900 shadow-xs font-bold'
            : 'text-slate-400 hover:text-slate-200 font-medium'
        }`}
      >
        <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 fill-amber-500/30' : ''}`} />
        <span>Light</span>
      </span>
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all duration-200 ${
          isDark
            ? 'bg-slate-800 text-slate-100 shadow-xs font-bold'
            : 'text-slate-500 hover:text-slate-800 font-medium'
        }`}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400 fill-indigo-400/30' : ''}`} />
        <span>Dark</span>
      </span>
    </button>
  );
};
