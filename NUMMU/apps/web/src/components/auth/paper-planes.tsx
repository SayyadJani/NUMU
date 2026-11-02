'use client';

import React from 'react';

/** Single paper-plane SVG (nose points up-right) */
function PlaneSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <path d="M3 23L45 5L31 43L22 28L3 23Z" fill="currentColor" fillOpacity="0.85" strokeLinejoin="round" />
      {/* Inner fold (darker) */}
      <path d="M22 28L45 5L26 38Z" fill="currentColor" />
      {/* Wing crease */}
      <path d="M22 28L45 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  );
}

const PLANES = [
  { anim: 'animate-fly-1', size: 30, color: 'text-emerald-400/80' },
  { anim: 'animate-fly-2', size: 22, color: 'text-teal-400/70' },
  { anim: 'animate-fly-3', size: 26, color: 'text-emerald-500/60' },
  { anim: 'animate-fly-4', size: 18, color: 'text-emerald-300/80' },
];

/**
 * Paper planes that loop across the ENTIRE parent container.
 * Uses container query units (cqw / cqh) so travel distance is relative to the
 * parent's size, not the plane's own size. Parent must be `relative`.
 */
export function PaperPlanes() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none z-[5]"
      style={{ containerType: 'size' }}
    >
      {PLANES.map((p) => (
        <div
          key={p.anim}
          className={`absolute top-0 left-0 will-change-transform ${p.anim}`}
          style={{ width: p.size, height: p.size }}
        >
          <PlaneSvg className={`w-full h-full drop-shadow-sm ${p.color}`} />
        </div>
      ))}
    </div>
  );
}
