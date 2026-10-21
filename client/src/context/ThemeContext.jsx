import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('edupulse-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Default to light for clean academic SaaS feel (no prefers-color-scheme override)
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    // Strictly toggle the .dark class on <html>
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = theme;

    localStorage.setItem('edupulse-theme', theme);
  }, [theme]);

  // Direct toggle between light and dark
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const cycleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, toggleTheme, cycleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
