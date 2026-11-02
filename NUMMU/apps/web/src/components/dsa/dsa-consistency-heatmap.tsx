import React from 'react';

const LEVEL_CLASSES = [
  'bg-slate-100',
  'bg-emerald-100',
  'bg-emerald-300',
  'bg-emerald-500',
  'bg-emerald-700',
];

interface DsaHeatmapDay {
  date: string;
  count: number;
  level: number;
}

interface DsaConsistencyHeatmapProps {
  days: DsaHeatmapDay[];
  className?: string;
}

export function DsaConsistencyHeatmap({ days, className = '' }: DsaConsistencyHeatmapProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex gap-1 flex-wrap">
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} problems`}
            className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 cursor-default ${
              LEVEL_CLASSES[day.level] || 'bg-slate-100'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[9px] text-slate-400 font-medium">Less</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
        ))}
        <span className="text-[9px] text-slate-400 font-medium">More</span>
      </div>
    </div>
  );
}
