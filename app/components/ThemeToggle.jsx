'use client';
import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="theme-toggle-skeleton" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark blue theme'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark blue theme'}
    >
      <div className="theme-icon-container">
        {isDark ? (
          <Moon className="theme-icon moon" size={16} strokeWidth={2.2} />
        ) : (
          <Sun className="theme-icon sun" size={16} strokeWidth={2.2} />
        )}
      </div>
    </button>
  );
}
