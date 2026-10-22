import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('edupulse-theme');
    if (saved === 'dark' || saved === 'light' || saved === 'premium') return saved;
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove('dark', 'premium');
    if (body) body.classList.remove('dark', 'premium');

    if (theme === 'dark') {
      root.classList.add('dark');
      if (body) body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (theme === 'premium') {
      root.classList.add('premium');
      if (body) body.classList.add('premium');
      root.style.colorScheme = 'light';
    } else {
      root.style.colorScheme = 'light';
    }

    localStorage.setItem('edupulse-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'light') return 'premium';
      if (prev === 'premium') return 'dark';
      return 'light';
    });
  };

  const cycleTheme = toggleTheme;

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
