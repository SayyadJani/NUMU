'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  BookOpen,
  Trophy,
  Zap,
  Award,
} from 'lucide-react';
import { progressService } from '@/services/progress.service';
import { gamificationService } from '@/services/gamification.service';
import type {
  ProgressOverviewDto,
  TopicProgressSummary,
  GamificationSummaryDto,
} from '@numu/types';

export function QuickStatsRow() {
  const [overview, setOverview] = useState<ProgressOverviewDto | null>(null);
  const [topicSummary, setTopicSummary] = useState<TopicProgressSummary | null>(null);
  const [gamification, setGamification] = useState<GamificationSummaryDto | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      progressService.getOverview(),
      progressService.getTopicProgress(),
      gamificationService.getSummary(-new Date().getTimezoneOffset()),
    ]).then(([ovRes, topRes, gamRes]) => {
      if (!isMounted) return;
      if (ovRes.status === 'fulfilled') setOverview(ovRes.value);
      if (topRes.status === 'fulfilled') setTopicSummary(topRes.value);
      if (gamRes.status === 'fulfilled') setGamification(gamRes.value);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const dsaSolved = overview ? overview.totalProblemsSolved : 0;
  const dsaTotal = overview ? overview.totalAvailable.total : 0;
  const dsaEasy = overview ? overview.difficulty.easy : 0;
  const dsaMedium = overview ? overview.difficulty.medium : 0;
  const dsaHard = overview ? overview.difficulty.hard : 0;
  const dsaPercent = dsaTotal > 0 ? Math.min(100, Math.round((dsaSolved / dsaTotal) * 100)) : 0;

  const topics = topicSummary?.topics ?? [];
  const totalTopics = topicSummary?.totalTopics ?? topics.length;
  const activeTopics = topics.filter((t) => t.solvedProblems > 0).length;
  const fullyMasteredTopics = topics.filter(
    (t) => t.totalProblems > 0 && t.solvedProblems >= t.totalProblems,
  ).length;
  const topicPercent =
    totalTopics > 0 ? Math.min(100, Math.round((activeTopics / totalTopics) * 100)) : 0;

  const totalXp = gamification ? gamification.xp.total : 0;
  const currentLevel = gamification ? gamification.level.current : 1;
  const badgesEarned = gamification ? gamification.badgesSummary.totalEarned : 0;
  const badgesTotal = gamification ? gamification.badgesSummary.totalAvailable : 6;

  const acceptanceRate = overview ? overview.acceptanceRate : '0.0%';
  const acceptedSubs = overview ? overview.acceptedSubmissions : 0;
  const totalSubs = overview ? overview.totalSubmissions : 0;
  const accuracyNum = parseFloat(acceptanceRate) || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
      {/* 1. DSA Problems Solved */}
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
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>Easy: {dsaEasy}</span>
            <span>Med: {dsaMedium}</span>
            <span>Hard: {dsaHard}</span>
          </div>
        </div>
      </div>

      {/* 2. Shared Curriculum Topics Covered */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Curriculum Topics
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            {activeTopics}
            <span className="text-xs sm:text-sm font-normal text-slate-400 ml-1">
              / {totalTopics}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden my-2">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${topicPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-blue-700 font-semibold">
            <span>{fullyMasteredTopics} Fully Mastered</span>
            <span>{topicPercent}% Covered</span>
          </div>
        </div>
      </div>

      {/* 3. Total XP & Badges Earned */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Earned XP & Level
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <Trophy className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none">
            {totalXp.toLocaleString()}
            <span className="text-xs font-bold text-emerald-600 ml-1.5">
              XP
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold my-2">
            <Award className="w-3.5 h-3.5" />
            <span>Level {currentLevel} Developer</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>{badgesEarned}/{badgesTotal} Badges</span>
            <span>Verified Ledger</span>
          </div>
        </div>
      </div>

      {/* 4. Judge0 Acceptance Rate */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Judge0 Accuracy
          </span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs group-hover:bg-[#0b5c39] group-hover:text-white transition-colors">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>

        <div>
          <div className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight leading-none">
            {acceptanceRate}
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden my-2">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${Math.min(100, Math.round(accuracyNum))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>{acceptedSubs} Accepted</span>
            <span className="text-emerald-700 font-bold">{totalSubs} Submissions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
