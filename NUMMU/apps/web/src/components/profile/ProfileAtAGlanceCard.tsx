'use client';

import React from 'react';
import { Flame, Trophy, Code2, Globe2, ClipboardCheck } from 'lucide-react';
import type { ProfileStats } from '@/types/profile';

interface ProfileAtAGlanceCardProps {
  stats: ProfileStats;
}

export function ProfileAtAGlanceCard({ stats }: ProfileAtAGlanceCardProps) {
  const problemsSolved = stats.problemsSolved ?? 0;
  const dayStreak = stats.dayStreak ?? 0;
  const maxStreak = stats.maxStreak ?? dayStreak;
  const globalRank = stats.globalRank ?? 1;
  const contestRating = stats.contestRating ?? 1200;
  const testsAttended = stats.testsAttended ?? (stats.testsCompleted ?? 0);

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
        At a Glance
      </div>
      <div className="rounded-2xl bg-[#111827] dark:bg-[#0c1f17] border border-slate-800 dark:border-emerald-950/60 p-4 divide-y divide-slate-800/80 dark:divide-emerald-950/40 text-xs">
        <div className="flex items-center justify-between py-2.5 first:pt-0">
          <span className="text-slate-400 flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            Problems solved
          </span>
          <span className="font-bold text-white text-sm">
            {problemsSolved}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-slate-400 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            Best streak
          </span>
          <span className="font-bold text-white flex items-center gap-1.5">
            <span className="text-orange-400">🔥</span>
            {maxStreak} {maxStreak === 1 ? 'day' : 'days'}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-slate-400 flex items-center gap-2">
            <Globe2 className="w-3.5 h-3.5 text-teal-400" />
            Global rank
          </span>
          <span className="font-bold text-white">
            #{globalRank}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5">
          <span className="text-slate-400 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Contest rating
          </span>
          <span className="font-bold text-white">
            {contestRating.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between py-2.5 last:pb-0">
          <span className="text-slate-400 flex items-center gap-2">
            <ClipboardCheck className="w-3.5 h-3.5 text-purple-400" />
            Tests attended
          </span>
          <span className="font-bold text-white">
            {testsAttended}
          </span>
        </div>
      </div>
    </div>
  );
}
