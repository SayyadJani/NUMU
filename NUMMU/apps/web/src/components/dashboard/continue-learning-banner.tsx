'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, BookOpen } from 'lucide-react';
import { progressService } from '@/services/progress.service';
import { dsaService } from '@/services/dsa.service';
import type { TopicProgressItem, ProblemListItem } from '@numu/types';

export function ContinueLearningBanner() {
  const [topics, setTopics] = useState<TopicProgressItem[]>([]);
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const [totalSolved, setTotalSolved] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      progressService.getOverview(),
      progressService.getTopicProgress(),
      progressService.getSolvedProblems({ limit: 100 }),
      dsaService.getProblems({ limit: 50 }),
    ]).then(([ovRes, topRes, solvedRes, probRes]) => {
      if (!isMounted) return;
      if (ovRes.status === 'fulfilled') {
        setTotalSolved(ovRes.value.totalProblemsSolved);
        setTotalAvailable(ovRes.value.totalAvailable.total);
      }
      if (topRes.status === 'fulfilled') {
        setTopics(topRes.value.topics || []);
      }
      if (solvedRes.status === 'fulfilled') {
        setSolvedSlugs(new Set(solvedRes.value.items.map((i) => i.slug)));
      }
      if (probRes.status === 'fulfilled') {
        setProblems(probRes.value.items || []);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Pick the first topic in curriculum order that still has remaining problems
  const currentTopic =
    topics.find((t) => t.totalProblems > 0 && t.solvedProblems < t.totalProblems) ??
    topics[0];

  // Find the next unsolved problem in this topic (or across all problems)
  const nextProblem =
    problems.find(
      (p) =>
        !solvedSlugs.has(p.slug) &&
        currentTopic &&
        p.topics.some((t) => t.slug === currentTopic.slug),
    ) ??
    problems.find((p) => !solvedSlugs.has(p.slug)) ??
    problems[0];

  const overallPercent =
    totalAvailable > 0 ? Math.min(100, Math.round((totalSolved / totalAvailable) * 100)) : 0;

  const badgeLabel = nextProblem
    ? nextProblem.difficulty.charAt(0) + nextProblem.difficulty.slice(1).toLowerCase()
    : 'Curriculum';

  const resumeHref = nextProblem
    ? `/dashboard/dsa/problems/${nextProblem.slug}`
    : currentTopic
    ? `/dashboard/dsa/problems?topic=${currentTopic.slug}`
    : '/dashboard/dsa';

  return (
    <div className="relative bg-gradient-to-r from-[#082c1c] via-[#0d3b27] to-[#193e2e] text-white rounded-3xl p-5 sm:p-6 overflow-hidden shadow-md border border-[#193e2e] text-left">
      <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#cff07c]/15 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 -mb-20 w-60 h-60 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-[#cff07c]/20 text-[#cff07c] border border-[#cff07c]/30">
              <Code2 className="w-3.5 h-3.5" />
              <span>Shared DSA Curriculum Track</span>
            </span>
            {currentTopic && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-white/10 text-white/90 border border-white/15">
                <BookOpen className="w-3.5 h-3.5 text-[#cff07c]" />
                <span>
                  Topic {currentTopic.order} of {topics.length}: {currentTopic.solvedProblems}/{currentTopic.totalProblems} Solved
                </span>
              </span>
            )}
          </div>

          <div>
            <div className="text-[11px] font-bold text-[#cff07c] uppercase tracking-wider mb-0.5">
              Current Focus Topic
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight truncate">
              {currentTopic ? `${currentTopic.order}. ${currentTopic.name}` : 'DSA Mastery Curriculum'}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-white/75">
              <span>
                Next Problem:{' '}
                <strong className="text-white font-semibold">
                  {nextProblem ? nextProblem.title : 'All Problems Completed!'}
                </strong>
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffd449]/20 text-[#ffd449] text-[10px] font-bold">
                {badgeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="w-full lg:max-w-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>
              {totalSolved} of {totalAvailable} curriculum problems solved
            </span>
            <span className="font-mono font-bold text-[#cff07c]">
              {overallPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#10b981] to-[#cff07c] rounded-full transition-all duration-500"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={resumeHref as React.ComponentProps<typeof Link>['href']}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#cff07c] hover:brightness-95 text-[#082c1c] font-extrabold text-xs sm:text-sm shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Resume Solving</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
