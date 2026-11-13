'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Code2 } from 'lucide-react';
import { progressService } from '@/services/progress.service';
import type { ProgressOverviewDto } from '@numu/types';

function CircularProgress({
  percent,
  size = 96,
  strokeWidth = 8,
  color = '#10b981',
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

export function DsaProgressCard() {
  const [overview, setOverview] = useState<ProgressOverviewDto | null>(null);

  useEffect(() => {
    let isMounted = true;
    progressService
      .getOverview()
      .then((data) => {
        if (isMounted) setOverview(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const solved = overview ? overview.totalProblemsSolved : 0;
  const total = overview ? overview.totalAvailable.total : 0;
  const percent = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;

  const easy = overview ? overview.difficulty.easy : 0;
  const medium = overview ? overview.difficulty.medium : 0;
  const hard = overview ? overview.difficulty.hard : 0;
  const totalEasy = overview ? overview.totalAvailable.easy : 0;
  const totalMedium = overview ? overview.totalAvailable.medium : 0;
  const totalHard = overview ? overview.totalAvailable.hard : 0;
  const accuracy = overview ? overview.acceptanceRate : '0.0%';

  const DIFFICULTY = [
    { label: 'Easy', count: `${easy} / ${totalEasy}`, color: 'bg-emerald-500' },
    { label: 'Medium', count: `${medium} / ${totalMedium}`, color: 'bg-amber-400' },
    { label: 'Hard', count: `${hard} / ${totalHard}`, color: 'bg-rose-500' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Code2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">DSA Mastery Progress</span>
          </div>
          <Link
            href="/dashboard/dsa"
            className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Curriculum</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <CircularProgress percent={percent} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-900 leading-none">{percent}%</span>
              <span className="text-[9px] font-semibold text-slate-400">Solved</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-lg font-black text-slate-900 leading-none">
              {solved} <span className="text-xs font-normal text-slate-400">/ {total} Problems</span>
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mb-2 mt-0.5">
              Live PostgreSQL Progress
            </div>

            <div className="space-y-1 text-xs">
              {DIFFICULTY.map((d) => (
                <div key={d.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${d.color}`} />
                    <span className="text-slate-600 text-[11px]">{d.label}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          Accuracy: <strong className="text-slate-800">{accuracy}</strong>
        </span>
        <span className="text-emerald-700 font-bold">
          {overview?.totalSubmissions ?? 0} Judge0 Runs
        </span>
      </div>
    </div>
  );
}
