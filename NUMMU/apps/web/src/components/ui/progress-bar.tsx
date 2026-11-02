import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'blue' | 'amber' | 'rose' | 'gradient';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  size = 'sm',
  color = 'emerald',
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const sizeStyles = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorStyles = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    gradient: 'bg-gradient-to-r from-emerald-500 to-teal-400',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>Progress</span>
          <span className="font-mono">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorStyles[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
