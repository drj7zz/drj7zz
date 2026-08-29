'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/about', label: 'About' },
  { href: '/skills', label: 'Focus' },
  { href: '/career', label: 'Career' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/github', label: 'GitHub' },
  { href: '/connect', label: 'Connect' }
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="nav" aria-label="Primary navigation">
      <Link className="brand" href="/" aria-label="DRJ home">
        <img
          className="brand-mark"
          src="/assets/images/logo.png"
          alt=""
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
        <span>KAALYUG</span>
      </Link>

      <div className="nav-controls">
        <nav className="nav-links" aria-label="Portfolio sections">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = pathname === href || (href === '/' && pathname === '/dashboard');
            return (
              <Link
                key={href}
                href={href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="nav-theme-wrap">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
