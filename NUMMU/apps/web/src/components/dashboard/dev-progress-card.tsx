'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Monitor, GitBranch } from 'lucide-react';
import { DUMMY_STATS } from '@/data/dashboard-mock';

function CircularProgress({ percent, size = 96, strokeWidth = 8, color = '#0284c7' }: { percent: number; size?: number; strokeWidth?: number; color?: string }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

const TRACKS = [
  { label: 'Frontend & UI', pct: 85, color: 'bg-teal-500' },
  { label: 'Backend & APIs', pct: 60, color: 'bg-blue-500' },
  { label: 'System Architecture', pct: 40, color: 'bg-purple-500' },
];

export function DevProgressCard() {
  const percent = Math.round((DUMMY_STATS.projectsBuilt / DUMMY_STATS.projectsTarget) * 100);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Monitor className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Fullstack Capstones</span>
          </div>
          <Link
            href="/dashboard/development"
            className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-0.5"
          >
            <span>Tracks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Content */}
        <div className="flex items-center gap-5">
          {/* Ring */}
          <div className="relative shrink-0">
            <CircularProgress percent={percent} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-slate-900 leading-none">{percent}%</span>
              <span className="text-[9px] font-semibold text-slate-400">Target</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="text-lg font-black text-slate-900 leading-none">
              {DUMMY_STATS.projectsBuilt} <span className="text-xs font-normal text-slate-400">/ {DUMMY_STATS.projectsTarget} Projects</span>
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mb-2 mt-0.5 flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              <span>DevPulse SaaS active</span>
            </div>

            <div className="space-y-1 text-xs">
              {TRACKS.map((t) => (
                <div key={t.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${t.color}`} />
                    <span className="text-slate-600 text-[11px]">{t.label}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">{t.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Portfolio: <strong className="text-slate-800">Production Ready</strong></span>
        <span className="text-blue-700 font-bold">Industry Vetted</span>
      </div>
    </div>
  );
}
