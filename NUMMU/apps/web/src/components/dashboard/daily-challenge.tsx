'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { DUMMY_DAILY_CHALLENGE } from '@/data/dashboard-mock';

export function DailyChallenge() {
  const [isSolved] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left relative overflow-hidden group hover:border-emerald-300 transition-all">
      {/* Top Banner */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            </div>
            <span className="text-sm font-bold text-slate-900">Daily Challenge</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{DUMMY_DAILY_CHALLENGE.timeLeft}</span>
          </div>
        </div>

        {/* Problem Title */}
        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2 group-hover:text-[#0b5c39] transition-colors">
          {DUMMY_DAILY_CHALLENGE.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {DUMMY_DAILY_CHALLENGE.difficulty}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {DUMMY_DAILY_CHALLENGE.category}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            Acc: {DUMMY_DAILY_CHALLENGE.acceptance}
          </span>
        </div>
      </div>

      {/* Bottom Action + XP */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={DUMMY_DAILY_CHALLENGE.link as React.ComponentProps<typeof Link>['href']}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
            isSolved
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-[#0b5c39] hover:bg-[#08482c] text-white active:scale-[0.98]'
          }`}
        >
          {isSolved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Solved ✓</span>
            </>
          ) : (
            <>
              <span>Solve Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Link>

        <div className="text-right">
          <div className="text-xs font-extrabold text-[#0b5c39] flex items-center gap-1 justify-end">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>+{DUMMY_DAILY_CHALLENGE.xp} XP</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Streak multiplier</div>
        </div>
      </div>
    </div>
  );
}
