import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, cycleTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={cycleTheme}
      type="button"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-academic-blue/50 ${className}`}
      title={`Theme: ${theme} (Click to switch)`}
      aria-label="Toggle color theme"
    >
      {theme === 'system' ? (
        <Monitor className="w-4 h-4 text-academic-blue" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="w-4 h-4 text-amber-400" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
