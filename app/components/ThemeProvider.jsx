'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Default to 'light' theme
    const saved = localStorage.getItem('drj-theme');
    const initial = saved || 'light';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
    setMounted(true);

    // Global protection against image copying, context menu, and drag transfer
    const handleContextMenu = (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    const handleDragStart = (e) => {
      if (e.target && e.target.tagName === 'IMG') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    const directionClass = nextTheme === 'dark' ? 'theme-to-dark' : 'theme-to-light';
    const applyTheme = () => {
      setTheme(nextTheme);
      root.setAttribute('data-theme', nextTheme);
      localStorage.setItem('drj-theme', nextTheme);
    };

    const clearTransitionClasses = () => {
      root.classList.remove('theme-transitioning', 'theme-to-dark', 'theme-to-light');
    };

    root.classList.add('theme-transitioning', directionClass);
    const viewTransition = document.startViewTransition?.(applyTheme);

    if (viewTransition) {
      viewTransition.finished.finally(clearTransitionClasses);
      return;
    }

    requestAnimationFrame(() => {
      applyTheme();
      window.setTimeout(clearTransitionClasses, 650);
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
