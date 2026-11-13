'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Play, CheckCircle2 } from 'lucide-react';
import { progressService } from '@/services/progress.service';
import type { TopicProgressItem } from '@numu/types';

export function CurrentLearningPath() {
  const [topics, setTopics] = useState<TopicProgressItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    progressService
      .getTopicProgress()
      .then((res) => {
        if (isMounted) setTopics(res.topics || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine the first incomplete topic as 'current'
  const firstIncompleteIdx = topics.findIndex(
    (t) => t.totalProblems === 0 || t.solvedProblems < t.totalProblems,
  );
  const completedTopicsCount = topics.filter(
    (t) => t.totalProblems > 0 && t.solvedProblems >= t.totalProblems,
  ).length;
  const activeTopicsCount = topics.filter((t) => t.solvedProblems > 0).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-900">Shared DSA Curriculum Path</span>
          <Link
            href="/dashboard/dsa"
            className="text-xs text-emerald-700 font-semibold flex items-center gap-0.5 hover:underline"
          >
            <span>All {topics.length} Topics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="relative max-h-64 overflow-y-auto no-scrollbar pr-1">
          <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-slate-200" />

          <div className="space-y-2">
            {topics.map((topic, idx) => {
              const isCompleted =
                topic.totalProblems > 0 && topic.solvedProblems >= topic.totalProblems;
              const isCurrent =
                !isCompleted &&
                (idx === firstIncompleteIdx || topic.solvedProblems > 0);

              return (
                <div
                  key={topic.id}
                  className={`relative flex items-center gap-3 p-2 rounded-2xl transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/70 border border-emerald-200'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-white border-emerald-600 ring-4 ring-emerald-100'
                        : 'bg-white border-slate-300'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isCurrent && (
                      <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    )}
                    {!isCompleted && !isCurrent && (
                      <span className="text-[9px] font-bold text-slate-400">{topic.order}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${
                        isCurrent ? 'text-emerald-900 font-extrabold' : 'text-slate-800'
                      }`}
                    >
                      {topic.order}. {topic.name}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {topic.solvedProblems} / {topic.totalProblems} problems solved ({topic.percentage}%)
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/dsa?topic=${topic.slug}` as React.ComponentProps<typeof Link>['href']}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors shadow-2xs ${
                      isCompleted
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : isCurrent
                        ? 'bg-[#0b5c39] hover:bg-[#08482c] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>{isCompleted ? 'Review' : isCurrent ? 'Resume' : 'Start'}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          {activeTopicsCount} of {topics.length} Topics Active ({completedTopicsCount} Completed)
        </span>
        <span className="text-emerald-700 font-bold">Unified Curriculum</span>
      </div>
    </div>
  );
}
