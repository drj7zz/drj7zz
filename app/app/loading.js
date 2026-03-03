import React from 'react';

export default function Loading() {
  return (
    <>
      <div className="page-top-loader-bar" aria-hidden="true" />
      <div style={{ maxWidth: '820px', margin: '48px auto', padding: '0 16px' }}>
        <div className="skeleton-shimmer" style={{ height: '14px', width: '120px', marginBottom: '18px', borderRadius: '4px' }} />
        <div className="skeleton-shimmer" style={{ height: '42px', width: '65%', marginBottom: '28px', borderRadius: '6px' }} />
        <div style={{ display: 'grid', gap: '14px', maxWidth: '640px', marginBottom: '36px' }}>
          <div className="skeleton-shimmer" style={{ height: '15px', width: '100%' }} />
          <div className="skeleton-shimmer" style={{ height: '15px', width: '85%' }} />
          <div className="skeleton-shimmer" style={{ height: '15px', width: '60%' }} />
        </div>
        <div style={{ display: 'grid', gap: '16px', borderTop: '1px solid var(--line)', paddingTop: '28px' }}>
          {[1, 2].map((i) => (
            <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="skeleton-shimmer" style={{ height: '12px', width: '100px' }} />
              <div className="skeleton-shimmer" style={{ height: '24px', width: '75%' }} />
              <div className="skeleton-shimmer" style={{ height: '14px', width: '90%' }} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
