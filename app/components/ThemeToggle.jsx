'use client';
import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Palette } from 'lucide-react';

const THEME_META = {
  maximalist: { icon: Sun, label: 'Maximalist (light) — switch to Claude theme' },
  claude: { icon: Palette, label: 'Claude (warm light) — switch to dark theme' },
  dark: { icon: Moon, label: 'Dark — switch to Maximalist theme' }
};

export default function ThemeToggle() {
  const { theme, cycleTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="theme-toggle-skeleton" />;
  }

  const meta = THEME_META[theme] || THEME_META.maximalist;
  const Icon = meta.icon;

  return (
    <button
      className={`theme-toggle theme-${theme}`}
      type="button"
      onClick={cycleTheme}
      aria-label={meta.label}
      title={meta.label}
    >
      <div className="theme-icon-container">
        <Icon className={`theme-icon ${theme}`} size={16} strokeWidth={2.2} />
      </div>
    </button>
  );
}
