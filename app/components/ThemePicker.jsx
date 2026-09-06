'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { ChevronDown, Check } from 'lucide-react';

export const THEME_OPTIONS = [
  { id: 'maximalist', name: 'Maximalist', desc: 'Neo-brutalist light', swatch: '#6d28d9' },
  { id: 'claude', name: 'Claude', desc: 'Warm editorial', swatch: '#ba412d' },
  { id: 'dark', name: 'Midnight', desc: 'Glassmorphism dark', swatch: '#6aa5ff' },
  { id: 'neon', name: 'Neon Pulse', desc: 'Animated cyber dark', swatch: '#22d3ee' },
  { id: 'glass', name: 'Liquid Glass', desc: 'iOS frosted light', swatch: '#0a84ff' },
  { id: 'paper', name: 'Paper', desc: 'Minimal reading light', swatch: '#1a1a18' }
];

export default function ThemePicker() {
  const { theme, setTheme, mounted } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('click', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!mounted) return <div className="theme-toggle-skeleton" />;

  const current = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <div className="theme-picker" ref={ref}>
      <button
        type="button"
        className="theme-picker-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Theme: ${current.name}. Choose theme`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="theme-picker-swatch" style={{ background: current.swatch }} />
        <span className="theme-picker-name">{current.name}</span>
        <ChevronDown size={12} className={`theme-picker-caret ${open ? 'open' : ''}`} />
      </button>

      <div className={`theme-picker-menu ${open ? 'open' : ''}`} role="listbox" aria-label="Choose theme">
        {THEME_OPTIONS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="option"
            aria-selected={t.id === theme}
            className={`theme-picker-option ${t.id === theme ? 'selected' : ''}`}
            onClick={() => { setTheme(t.id); setOpen(false); }}
          >
            <span className="theme-picker-swatch" style={{ background: t.swatch }} />
            <span className="theme-picker-option-text">
              <span className="theme-picker-option-name">{t.name}</span>
              <span className="theme-picker-option-desc">{t.desc}</span>
            </span>
            {t.id === theme && <Check size={13} className="theme-picker-check" />}
          </button>
        ))}
      </div>
    </div>
  );
}
