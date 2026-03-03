'use client';
import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    if (error) {
      console.error('Fatal global layout error caught:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0b1220', color: '#dbe7f5', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ maxWidth: '480px', padding: '32px 24px', textAlign: 'center', background: '#101b2e', border: '1px solid #1e2c44', borderRadius: '12px' }}>
          <p style={{ color: '#6aa5ff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', fontFamily: 'monospace' }}>
            Emergency Root Recovery
          </p>
          <h1 style={{ fontSize: '24px', margin: '0 0 12px', color: '#ffffff' }}>Application Encountered an Error</h1>
          <p style={{ fontSize: '13px', color: '#8aa0bd', lineHeight: 1.6, marginBottom: '24px' }}>
            A fatal exception occurred in the root document tree. You can reload the application frame below.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              background: '#6aa5ff',
              color: '#0b1220',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Reload Application Frame
          </button>
        </div>
      </body>
    </html>
  );
}
