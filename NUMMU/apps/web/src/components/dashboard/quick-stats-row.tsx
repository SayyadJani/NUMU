'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  FolderGit2,
  Trophy,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { DUMMY_STATS, DUMMY_USER_PROFILE } from '@/data/dashboard-mock';
import { progressService } from '@/services/progress.service';
import type { ProgressOverviewDto } from '@numu/types';

export function QuickStatsRow() {
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

  const dsaSolved = overview ? overview.totalProblemsSolved : DUMMY_STATS.dsaSolved;
  const dsaTotal = overview ? overview.totalAvailable.total : DUMMY_STATS.dsaTotal;
  const dsaEasy = overview ? overview.difficulty.easy : DUMMY_STATS.dsaEasy;
  const dsaMedium = overview ? overview.difficulty.medium : DUMMY_STATS.dsaMedium;
  const dsaHard = overview ? overview.difficulty.hard : DUMMY_STATS.dsaHard;
  const dsaPercent = dsaTotal > 0 ? Math.min(100, Math.round((dsaSolved / dsaTotal) * 100)) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
      {/* 1. Problems Solved */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            DSA Problems
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs group-hover:bg-[#0b5c39] group-hover:text-white transition-colors">
            <Code2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            {dsaSolved}
            <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1">
              / {dsaTotal}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden my-2">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${dsaPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Easy: {dsaEasy}</span>
            <span>Med: {dsaMedium}</span>
            <span>Hard: {dsaHard}</span>
          </div>
        </div>
      </div>

      {/* 2. Projects Built */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Capstones
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <FolderGit2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            {DUMMY_STATS.projectsBuilt}
            <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1">
              / {DUMMY_STATS.projectsTarget}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden my-2">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${Math.round((DUMMY_STATS.projectsBuilt / DUMMY_STATS.projectsTarget) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-blue-700 font-semibold">
            <span>DevPulse SaaS active</span>
            <span>Sprint 3/5</span>
          </div>
        </div>
      </div>

      {/* 3. Contest Rating */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Contest Rating
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Trophy className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            {DUMMY_STATS.contestRating}
            <span className="text-xs font-bold text-emerald-600 ml-1.5">
              {DUMMY_STATS.contestRatingDelta}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold my-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Top 8% globally</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Rank #{DUMMY_USER_PROFILE.globalRank}</span>
            <span>Weekly #43 soon</span>
          </div>
        </div>
      </div>

      {/* 4. Placement Readiness */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Placement Ready
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs group-hover:bg-[#0b5c39] group-hover:text-white transition-colors">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight leading-none">
            {DUMMY_USER_PROFILE.readinessScore}%
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden my-2">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${DUMMY_USER_PROFILE.readinessScore}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>High Readiness</span>
            <span className="text-emerald-700 font-bold">Offer Track ↗</span>
          </div>
        </div>
      </div>
    </div>
  );
}
