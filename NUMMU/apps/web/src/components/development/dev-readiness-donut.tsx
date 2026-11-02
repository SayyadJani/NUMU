import React from 'react';

interface DevReadinessDonutProps {
  percent: number;
}

export function DevReadinessDonut({ percent }: DevReadinessDonutProps) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#059669"
          strokeWidth="9"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset="0"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black text-slate-900 leading-none">{percent}%</span>
        <span className="text-[9px] text-slate-400 font-semibold mt-0.5">Ready</span>
      </div>
    </div>
  );
}
