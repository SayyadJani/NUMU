'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Flame, Sparkles, CheckCircle2 } from 'lucide-react';
import { dsaService } from '@/services/dsa.service';
import { progressService } from '@/services/progress.service';
import type { ProblemListItem } from '@numu/types';

export function DailyChallenge() {
  const [challenge, setChallenge] = useState<ProblemListItem | null>(null);
  const [isSolved, setIsSolved] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      dsaService.getProblems({ limit: 50 }),
      progressService.getSolvedProblems({ limit: 100 }),
    ]).then(([probRes, solvedRes]) => {
      if (!isMounted) return;
      const solvedSet = new Set(
        solvedRes.status === 'fulfilled'
          ? solvedRes.value.items.map((s) => s.slug)
          : [],
      );
      if (probRes.status === 'fulfilled' && probRes.value.items.length > 0) {
        const items = probRes.value.items;
        // Prefer first unsolved problem in curriculum order, fallback to deterministic daily index
        const nextUnsolved = items.find((p) => !solvedSet.has(p.slug));
        const picked =
          nextUnsolved ?? items[new Date().getDate() % items.length] ?? items[0]!;
        setChallenge(picked);
        setIsSolved(solvedSet.has(picked.slug));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const difficultyLabel = challenge
    ? challenge.difficulty.charAt(0) + challenge.difficulty.slice(1).toLowerCase()
    : 'Easy';
  const xpAmount =
    challenge?.difficulty === 'HARD' ? 100 : challenge?.difficulty === 'MEDIUM' ? 50 : 30;
  const topicName =
    challenge?.primaryTopic?.name ?? challenge?.topics[0]?.name ?? 'DSA Curriculum';
  const accText =
    challenge?.acceptanceRate !== undefined ? `${challenge.acceptanceRate.toFixed(1)}%` : '—';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left relative overflow-hidden group hover:border-emerald-300 transition-all">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
            </div>
            <span className="text-sm font-bold text-slate-900">Daily Curriculum Challenge</span>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            Active Today
          </span>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2 group-hover:text-[#0b5c39] transition-colors">
          {challenge ? challenge.title : 'Loading Daily Problem...'}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              difficultyLabel === 'Easy'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : difficultyLabel === 'Medium'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            {difficultyLabel}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {topicName}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            Acc: {accText}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          href={
            (challenge ? `/dashboard/dsa/problems/${challenge.slug}` : '/dashboard/dsa') as React.ComponentProps<
              typeof Link
            >['href']
          }
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
            <span>+{xpAmount} XP</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">On Accepted Judge0 Run</div>
        </div>
      </div>
    </div>
  );
}
