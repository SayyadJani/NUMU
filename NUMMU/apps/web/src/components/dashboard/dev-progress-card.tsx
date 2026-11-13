'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
import { progressService } from '@/services/progress.service';
import type { TopicProgressItem } from '@numu/types';

function CircularProgress({
  percent,
  size = 96,
  strokeWidth = 8,
  color = '#2563eb',
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track, #e2e8f0)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

export function DevProgressCard() {
  const [topics, setTopics] = useState<TopicProgressItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    progressService
      .getTopicProgress()
      .then((res) => {
        if (isMounted) setTopics(res.topics || []);
      })
      .catch(() => { });

    return () => {
      isMounted = false;
    };
  }, []);

  const totalTopics = topics.length;
  const activeTopics = topics.filter((t) => t.solvedProblems > 0).length;
  const percent = totalTopics > 0 ? Math.min(100, Math.round((activeTopics / totalTopics) * 100)) : 0;
  const topFourTopics = topics.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all text-left flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Topic Coverage</span>
          </div>
          <Link
            href="/dashboard/dsa"
            className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Syllabus</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <CircularProgress percent={percent} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-900 leading-none">{percent}%</span>
              <span className="text-[9px] font-semibold text-slate-400">Topics</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-lg font-black text-slate-900 leading-none">
              {activeTopics} <span className="text-xs font-normal text-slate-400">/ {totalTopics} Topics</span>
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mb-2 mt-0.5 truncate">
              8-Topic DSA Curriculum
            </div>

            <div className="space-y-1 text-xs">
              {topFourTopics.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2">
                  <span className="text-slate-600 text-[11px] truncate">{t.name}</span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] shrink-0">
                    {t.solvedProblems}/{t.totalProblems} ({t.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Shared Student Syllabus</span>
        <Link href="/dashboard/dsa" className="text-blue-700 font-bold hover:underline">
          View All 8 Topics →
        </Link>
      </div>
    </div>
  );
}
