// src/components/ui/Logo.jsx
import React from 'react';

/**
 * FitTrack Logo
 * Props:
 *   size    — 'sm' | 'md' | 'lg'  (default: 'md')
 *   onClick — optional click handler
 */
const sizes = {
  sm: { text: 18, box: 20, icon: 13 },
  md: { text: 26, box: 28, icon: 18 },
  lg: { text: 34, box: 36, icon: 22 },
};

export default function Logo({ size = 'md', onClick }) {
  const s = sizes[size];
  return (
    <div onClick={onClick} style={{ display:'flex', alignItems:'center', gap:6, cursor: onClick ? 'pointer' : 'default' }}>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: s.text,
        letterSpacing: 2,
        color: 'var(--white)',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
      }}>
        FI
        {/* The "T" replaced with muscle icon */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: s.box,
          height: s.box,
          background: 'var(--blue)',
          borderRadius: 6,
          margin: '0 1px',
          flexShrink: 0,
        }}>
          <svg width={s.icon} height={s.icon} viewBox="0 0 24 24" fill="none">
            <path d="M6 4C4.9 4 4 4.9 4 6s.9 2 2 2h1v8H6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2v-1h8v1c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2h-1V8h1c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2v1H8V6c0-1.1-.9-2-2-2z" fill="white"/>
          </svg>
        </span>
        RACK
      </span>
    </div>
  );
}