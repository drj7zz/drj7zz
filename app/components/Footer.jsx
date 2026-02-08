'use client';
import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-meta">
          <span className="footer-brand">DRJ7ZZ · KAALYUG</span>
          <span className="footer-copyright">© {currentYear} Dirghraj Giri. All rights reserved.</span>
        </div>
        <p className="footer-disclaimer">
          <strong>Production Notice &amp; Disclaimer:</strong> Projects, source implementations, and technical documentation featured on this portfolio are engineered for accessibility, modern web standards, and high performance. Live contribution activity and commit streams are synchronized in real time with public GitHub APIs.
        </p>
      </div>
    </footer>
  );
}
