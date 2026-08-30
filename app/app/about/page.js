'use client';
import React from 'react';
import Link from 'next/link';
import { facts } from '../../lib/data';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="content-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '780px' }}>
      <section className="section-panel" aria-labelledby="about-title">
        <p className="section-label">01 / About</p>
        <h2 id="about-title">Designed to be useful. Built to last.</h2>
        <p>
          I work where frontend engineering meets visual clarity. My goal is to create web interfaces that communicate quickly, adapt gracefully across devices, and remain easy for teams to evolve.
        </p>
        <p className="kaalyug-note">
          <strong>Founder of KAALYUG:</strong> an open web ecosystem in progress, exploring practical tools such as digital wallets, marketplaces, and open-source projects that make online systems more useful and accessible.
        </p>
        <div className="facts">
          {facts.map(([label, lines]) => (
            <div className="fact" key={label}>
              <span>{label}</span>
              <strong>{lines.join(' ')}</strong>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '32px' }}>
          <Link className="button" href="/skills">
            Skills I am sharpening <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </div>
  );
}
