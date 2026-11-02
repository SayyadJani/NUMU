import React from 'react';

export type BadgeVariant =
  | 'mint'
  | 'mint-dark'
  | 'status-completed'
  | 'status-in-progress'
  | 'status-upcoming'
  | 'status-danger'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ children, variant = 'mint', className = '', icon }: BadgeProps) {
  const variantStyles: Record<BadgeVariant, string> = {
    mint: 'bg-[#eaf7ee] text-[#0b5c39] border border-[#cbeed9]',
    'mint-dark': 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
    'status-completed': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'status-in-progress': 'bg-blue-50 text-blue-700 border border-blue-200',
    'status-upcoming': 'bg-slate-50 text-slate-500 border border-slate-200',
    'status-danger': 'bg-rose-50 text-rose-700 border border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase transition-colors ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
