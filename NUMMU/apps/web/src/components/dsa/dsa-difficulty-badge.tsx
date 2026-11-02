import React from 'react';
import type { Difficulty } from '@/data/dsa-mock';

const DIFF_STYLES: Record<Difficulty, string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200/90',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200/90',
  Hard: 'text-rose-700 bg-rose-50 border-rose-200/90',
};

interface DsaDifficultyBadgeProps {
  difficulty: Difficulty | string;
  size?: 'sm' | 'md';
  className?: string;
}

export function DsaDifficultyBadge({
  difficulty,
  size = 'sm',
  className = '',
}: DsaDifficultyBadgeProps) {
  const diffKey = (difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase()) as Difficulty;
  const style = DIFF_STYLES[diffKey] || 'text-slate-700 bg-slate-50 border-slate-200';
  const sizeClasses = size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border transition-colors select-none ${sizeClasses} ${style} ${className}`}
    >
      {difficulty}
    </span>
  );
}
