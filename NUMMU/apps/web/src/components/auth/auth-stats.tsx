import React from 'react';
import { HERO_STATS } from '@/data/landing-data';

export function AuthStats({ className = '' }: { className?: string }) {
  return (
    <div className={`grid grid-cols-4 gap-4 py-4 border-t border-emerald-900/10 ${className}`}>
      {HERO_STATS.map((stat) => (
        <div key={stat.label} className="text-left">
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {stat.value}
          </div>
          <div className="text-[11px] sm:text-xs font-medium text-slate-500 mt-0.5">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
