'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Code2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { dsaService } from '@/services/dsa.service';
import { progressService } from '@/services/progress.service';
import type { ProblemListItem } from '@numu/types';

export function RecommendedPractice() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const [attemptedSlugs, setAttemptedSlugs] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      dsaService.getProblems({ limit: 50 }),
      progressService.getSolvedProblems({ limit: 100 }),
      progressService.getSubmissionHistory({ limit: 50 }),
    ]).then(([probRes, solvedRes, subRes]) => {
      if (!isMounted) return;
      if (probRes.status === 'fulfilled') {
        setProblems(probRes.value.items || []);
      }
      if (solvedRes.status === 'fulfilled') {
        setSolvedSlugs(new Set(solvedRes.value.items.map((s) => s.slug)));
      }
      if (subRes.status === 'fulfilled') {
        setAttemptedSlugs(new Set(subRes.value.items.map((s) => s.problemSlug)));
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    'All',
    'Unsolved',
    'Solved',
    ...Array.from(
      new Set(
        problems
          .map((p) => p.primaryTopic?.name ?? p.topics[0]?.name)
          .filter((n): n is string => Boolean(n)),
      ),
    ),
  ];

  // Sort unsolved problems first so students immediately see what's next in their curriculum
  const sortedProblems = [...problems].sort((a, b) => {
    const aSolved = solvedSlugs.has(a.slug) ? 1 : 0;
    const bSolved = solvedSlugs.has(b.slug) ? 1 : 0;
    return aSolved - bSolved;
  });

  const filtered = sortedProblems.filter((p) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Unsolved') return !solvedSlugs.has(p.slug);
    if (activeCategory === 'Solved') return solvedSlugs.has(p.slug);
    return p.topics.some((t) => t.name === activeCategory);
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Code2 className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Curriculum Problems</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">
            {solvedSlugs.size} / {problems.length} Solved
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
          {filtered.map((prob) => {
            const isSolved = solvedSlugs.has(prob.slug);
            const isAttempted = !isSolved && attemptedSlugs.has(prob.slug);
            const diffLabel =
              prob.difficulty.charAt(0) + prob.difficulty.slice(1).toLowerCase();
            let diffStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (prob.difficulty === 'MEDIUM')
              diffStyle = 'bg-amber-50 text-amber-700 border-amber-200';
            if (prob.difficulty === 'HARD')
              diffStyle = 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={prob.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 transition-all group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${diffStyle}`}
                    >
                      {diffLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0b5c39] transition-colors">
                      {prob.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span>{prob.primaryTopic?.name ?? prob.topics[0]?.name ?? 'DSA'}</span>
                    <span>•</span>
                    <span>Acc: {prob.acceptanceRate.toFixed(1)}%</span>
                    {isSolved && (
                      <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold">
                        • <CheckCircle2 className="w-3 h-3" /> Solved
                      </span>
                    )}
                    {isAttempted && (
                      <span className="inline-flex items-center gap-0.5 text-amber-600 font-bold">
                        • <Clock className="w-3 h-3" /> Attempted
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/dashboard/dsa/problems/${prob.slug}` as React.ComponentProps<typeof Link>['href']}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      isSolved
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white'
                    }`}
                  >
                    <span>{isSolved ? 'Review' : 'Solve'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 text-center">
        <Link
          href="/dashboard/dsa"
          className="text-xs font-bold text-[#0b5c39] hover:underline"
        >
          View Full 8-Topic DSA Curriculum →
        </Link>
      </div>
    </div>
  );
}
