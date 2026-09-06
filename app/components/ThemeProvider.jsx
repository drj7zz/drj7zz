'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({
  theme: 'maximalist',
  themes: ['maximalist', 'claude', 'dark', 'neon', 'glass', 'paper'],
  setTheme: () => {}
});

const THEMES = ['maximalist', 'claude', 'dark', 'neon', 'glass', 'paper'];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('maximalist');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Default to 'maximalist' theme
    const saved = localStorage.getItem('drj-theme');
    const initial = THEMES.includes(saved) ? saved : 'maximalist';
    setThemeState(initial);
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

  const setTheme = (nextTheme) => {
    if (!THEMES.includes(nextTheme)) return;
    const root = document.documentElement;
    const directionClass = nextTheme === 'dark' ? 'theme-to-dark' : 'theme-to-light';
    const applyTheme = () => {
      setThemeState(nextTheme);
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

  const cycleTheme = () => {
    const idx = THEMES.indexOf(theme);
    setTheme(THEMES[(idx + 1) % THEMES.length]);
  };

  return (
    <ThemeContext.Provider value={{ theme, themes: THEMES, cycleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
