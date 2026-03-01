'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log unexpected client error in production monitoring
    if (error) {
      console.error('Unhandled app error caught by boundary:', error);
    }
  }, [error]);

  return (
    <section className="section-panel" style={{ maxWidth: '640px', margin: '40px auto', textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(186, 65, 45, 0.1)', color: 'var(--accent)', marginBottom: '16px' }}>
        <AlertTriangle size={22} />
      </div>
      <p style={{ font: '700 12px "DM Mono", monospace', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
        System Notification / Error Handled
      </p>
      <h1 style={{ font: '800 clamp(26px, 4vw, 36px) / 1.15 Sora, sans-serif', color: 'var(--ink)', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
        Something unexpected occurred.
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto 28px' }}>
        An unexpected application condition interrupted this view. The system captured the event without affecting other services.
      </p>

      {error?.digest && (
        <p style={{ font: '11px "DM Mono", monospace', color: 'var(--muted)', background: 'rgba(128, 128, 128, 0.08)', padding: '6px 12px', borderRadius: '4px', display: 'inline-block', marginBottom: '24px' }}>
          Reference digest: {error.digest}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="button"
          onClick={() => reset()}
          style={{ cursor: 'pointer' }}
        >
          <RefreshCw size={13} /> Try Re-rendering
        </button>
        <Link className="button ghost" href="/">
          <Home size={14} /> Back to Overview
        </Link>
      </div>
    </section>
  );
}
