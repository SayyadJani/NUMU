import React from 'react';

const HEATMAP_CLASSES = [
  'bg-slate-100',
  'bg-emerald-100',
  'bg-emerald-300',
  'bg-emerald-500',
  'bg-emerald-700',
];

interface DevHeatmapDay {
  day: string;
  level: number;
}

interface DevHeatmapProps {
  days: DevHeatmapDay[];
  className?: string;
}

export function DevHeatmap({ days, className = '' }: DevHeatmapProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex gap-1 flex-wrap">
        {days.map((d, i) => (
          <div
            key={i}
            title={`${d.day}: Activity Level ${d.level}`}
            className={`w-3.5 h-3.5 rounded-xs transition-all duration-200 hover:scale-125 cursor-default ${
              HEATMAP_CLASSES[d.level] || 'bg-slate-100'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[9px] text-slate-400 font-medium">Less</span>
        {HEATMAP_CLASSES.map((cls, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-xs ${cls}`} />
        ))}
        <span className="text-[9px] text-slate-400 font-medium">More</span>
      </div>
    </div>
  );
}
