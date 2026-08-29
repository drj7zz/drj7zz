'use client';
import React from 'react';
import * as LucideIcons from 'lucide-react';

export default function Icon({ name, className = '', size = 16, strokeWidth = 2, ...props }) {
  if (!name) return null;
  const Component = LucideIcons[name] || LucideIcons.Sparkles;
  return <Component className={className} size={size} strokeWidth={strokeWidth} {...props} />;
}
