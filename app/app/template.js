'use client';
import React from 'react';

export default function Template({ children }) {
  return (
    <div className="page-transition-wrapper">
      {children}
    </div>
  );
}
