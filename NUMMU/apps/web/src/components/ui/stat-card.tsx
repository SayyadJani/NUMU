import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  className?: string;
  badge?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  trend,
  icon: Icon,
  iconBg = 'bg-emerald-50',
  iconColor = 'text-emerald-700',
  className = '',
  badge,
}: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center font-bold shadow-2xs`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight font-mono">{value}</span>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              {badge}
            </span>
          )}
        </div>

        {(subValue || trend) && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            {trend && (
              <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
            )}
            {subValue && <span>{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
