import React from 'react';

export default function Loading() {
  return (
    <div style={{ maxWidth: '820px', margin: '40px auto', padding: '0 12px' }}>
      <div style={{ height: '24px', width: '140px', background: 'var(--line)', opacity: 0.35, borderRadius: '4px', marginBottom: '18px' }} />
      <div style={{ height: '48px', width: '70%', background: 'var(--line)', opacity: 0.45, borderRadius: '6px', marginBottom: '24px' }} />
      <div style={{ display: 'grid', gap: '14px', maxWidth: '600px' }}>
        <div style={{ height: '14px', width: '100%', background: 'var(--line)', opacity: 0.25, borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '85%', background: 'var(--line)', opacity: 0.25, borderRadius: '4px' }} />
        <div style={{ height: '14px', width: '60%', background: 'var(--line)', opacity: 0.25, borderRadius: '4px' }} />
      </div>
    </div>
  );
}
