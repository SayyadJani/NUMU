import React from 'react';

interface DsaSolvedDonutProps {
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  size?: number;
}

export function DsaSolvedDonut({
  totalSolved,
  easy,
  medium,
  hard,
  size = 64,
}: DsaSolvedDonutProps) {
  const total = Math.max(1, totalSolved);
  const r = 28;
  const circ = 2 * Math.PI * r;

  // Fractions
  const easFrac = easy / total;
  const medFrac = medium / total;
  const hardFrac = hard / total;

  const easyLen = circ * easFrac;
  const medLen = circ * medFrac;
  const hardLen = circ * hardFrac;

  return (
    <div className="flex items-center gap-3">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          {/* Easy arc */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#10b981"
            strokeWidth="8"
            strokeDasharray={`${easyLen} ${circ - easyLen}`}
            strokeDashoffset="0"
            strokeLinecap="butt"
          />
          {/* Medium arc */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="8"
            strokeDasharray={`${medLen} ${circ - medLen}`}
            strokeDashoffset={-easyLen}
            strokeLinecap="butt"
          />
          {/* Hard arc */}
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="#ef4444"
            strokeWidth="8"
            strokeDasharray={`${hardLen} ${circ - hardLen}`}
            strokeDashoffset={-(easyLen + medLen)}
            strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-extrabold text-slate-900 leading-none">{totalSolved}</span>
          <span className="text-[8px] text-slate-400 leading-none mt-0.5">solved</span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
          <span className="text-[10px] text-slate-500">Easy</span>
          <span className="text-[10px] font-bold text-slate-900 ml-auto pl-2">{easy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
          <span className="text-[10px] text-slate-500">Medium</span>
          <span className="text-[10px] font-bold text-slate-900 ml-auto pl-2">{medium}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
          <span className="text-[10px] text-slate-500">Hard</span>
          <span className="text-[10px] font-bold text-slate-900 ml-auto pl-2">{hard}</span>
        </div>
      </div>
    </div>
  );
}
