'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ASSETS } from '@/lib/constants/assets';
import {
  Flame,
  ShieldCheck,
  Star,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/loading-state';
import { gamificationService } from '@/services/gamification.service';
import { progressService } from '@/services/progress.service';
import type { GamificationSummaryDto, ProgressOverviewDto } from '@numu/types';

interface HeatmapDayCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

function buildEmpty21Days(): HeatmapDayCell[] {
  const cells: HeatmapDayCell[] = [];
  for (let i = 20; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    cells.push({
      date: d.toISOString().slice(0, 10),
      count: 0,
      level: 0,
    });
  }
  return cells;
}

export function DashboardGreeting() {
  const [greeting, setGreeting] = useState('Good morning');
  const [hoveredDay, setHoveredDay] = useState<HeatmapDayCell | null>(null);
  const [gamification, setGamification] = useState<GamificationSummaryDto | null>(null);
  const [overview, setOverview] = useState<ProgressOverviewDto | null>(null);
  const [heatmapDays, setHeatmapDays] = useState<HeatmapDayCell[]>(() => buildEmpty21Days());
  const { user, loading } = useAuth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    let isMounted = true;
    const tzOffsetMinutes = -new Date().getTimezoneOffset();

    Promise.allSettled([
      gamificationService.getSummary(tzOffsetMinutes),
      progressService.getOverview(),
      progressService.getActivity({ tzOffsetMinutes }),
    ]).then(([gamRes, ovRes, actRes]) => {
      if (!isMounted) return;
      if (gamRes.status === 'fulfilled') setGamification(gamRes.value);
      if (ovRes.status === 'fulfilled') setOverview(ovRes.value);
      if (actRes.status === 'fulfilled' && actRes.value.dailyActivity?.length) {
        const last21 = actRes.value.dailyActivity.slice(-21).map((d) => {
          const c = d.submissionCount || d.uniqueSolvedCount || 0;
          const level: 0 | 1 | 2 | 3 | 4 =
            c === 0 ? 0 : c === 1 ? 1 : c === 2 ? 2 : c <= 4 ? 3 : 4;
          return { date: d.date, count: c, level };
        });
        setHeatmapDays(last21);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentLevel = gamification ? gamification.level.current : 1;
  const levelTitle = `Level ${currentLevel} Developer`;
  const totalXp = gamification ? gamification.xp.total : 0;
  const xpIntoLevel = gamification ? gamification.level.xpIntoLevel : 0;
  const nextLevelSpan = gamification
    ? gamification.level.isMaxLevel
      ? Math.max(100, gamification.level.currentLevelXp)
      : Math.max(100, gamification.level.nextLevelXp - gamification.level.currentLevelXp)
    : 100;
  const xpPercent = gamification ? gamification.level.progressPercentage : 0;
  const currentStreak = gamification ? gamification.streak.current : 0;
  const badgesEarned = gamification ? gamification.badgesSummary.totalEarned : 0;
  const totalBadges = gamification ? gamification.badgesSummary.totalAvailable : 6;
  const solvedCount = overview ? overview.totalProblemsSolved : 0;
  const totalProblems = overview ? overview.totalAvailable.total : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 lg:p-7 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* ── Left Column: Level Pill, Live Stats, Greeting & XP Progress ── */}
        <div className="space-y-3.5 max-w-lg text-left">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shadow-2xs">
              <Star className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              <span>{levelTitle}</span>
            </div>
            <span className="text-slate-300 font-light select-none">|</span>
            <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {totalXp.toLocaleString()} Total XP • {badgesEarned}/{totalBadges} Badges
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
              <span>{greeting},</span>
              {loading ? (
                <Skeleton className="w-36 h-9 rounded-lg inline-block" />
              ) : (
                <span className="text-emerald-500">{user?.name || user?.username || 'Student'}</span>
              )}
              <span className="inline-block hover:animate-wave origin-bottom-right cursor-default">👋</span>
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed mt-1">
              You have completed <strong className="text-slate-800">{solvedCount} of {totalProblems}</strong> problems in the shared DSA curriculum ({totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0}% mastery).
            </p>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5 pt-1 max-w-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Level {currentLevel} Progress
              </span>
              <span className="font-mono font-bold text-emerald-500">
                {xpIntoLevel.toLocaleString()} / {nextLevelSpan.toLocaleString()} XP ({xpPercent}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#082c1c] via-[#10b981] to-[#cff07c] transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Middle Column: Coded Developer Illustration ── */}
        <div className="relative hidden lg:flex items-center justify-center shrink-0 w-64 h-48 select-none mx-auto xl:mx-0">
          <div className="absolute inset-0 m-auto w-44 h-44 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />

          <div className="absolute left-2 top-8 z-20 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#082c1c] to-[#193e2e] text-[#cff07c] flex items-center justify-center font-mono font-extrabold text-sm shadow-md shadow-emerald-900/15 transform -rotate-12 animate-float">
            &lt;/&gt;
          </div>

          <div className="absolute right-4 top-5 z-20 w-12 h-11 rounded-2xl bg-white border border-slate-100 shadow-md flex items-end justify-center gap-1 p-2.5 pb-2 transform rotate-6 animate-float-delayed">
            <div className="w-1.5 h-3 bg-emerald-400 rounded-full" />
            <div className="w-1.5 h-4.5 bg-emerald-500 rounded-full" />
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
          </div>

          <div className="absolute right-2 top-16 z-10 text-amber-400 text-lg animate-pulse">
            ✦
          </div>
          <div className="absolute left-10 bottom-8 z-10 text-emerald-400 text-sm">
            ✦
          </div>
          <Sparkles className="absolute right-8 bottom-6 z-10 w-4 h-4 text-emerald-300 opacity-70" />

          <div className="relative z-10 w-48 h-44 flex items-center justify-center bg-transparent transition-transform duration-300 hover:scale-105">
            <Image
              src={ASSETS.avatars.student3d.src}
              alt={ASSETS.avatars.student3d.alt}
              width={192}
              height={176}
              priority
              className="w-full h-full object-contain bg-transparent drop-shadow-md select-none pointer-events-none"
            />
          </div>
        </div>

        {/* ── Right Column: Live 21-Day Activity Matrix & Streak Card ── */}
        <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between shrink-0 w-full xl:w-auto min-w-[340px]">
          <div className="flex items-center justify-between gap-4 pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-center text-emerald-600 shrink-0">
                <Calendar className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800">
                  21-DAY ACTIVITY MATRIX
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-400 font-normal">
                  Live database submission tracker
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/dsa"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors group cursor-pointer"
            >
              <span>DSA Hub</span>
              <span className="text-sm transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5">
            <div className="flex items-center gap-3 pr-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center shadow-2xs shrink-0">
                <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {currentStreak}
                  </span>
                  <span className="text-xs font-bold text-orange-600">Days</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{gamification?.streak.activeToday ? 'Active Today' : 'Streak Tracked'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 ml-auto">
              <div className="grid grid-cols-7 grid-rows-3 gap-1.5 relative">
                {heatmapDays.map((day, idx) => {
                  let color = 'bg-slate-200/80';
                  if (day.level === 1) color = 'bg-[#cbeed3] dark:bg-[#193e2e]';
                  if (day.level === 2) color = 'bg-[#10b981]';
                  if (day.level === 3) color = 'bg-[#cff07c]';
                  if (day.level === 4) color = 'bg-[#082c1c] dark:bg-[#cff07c]';

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-[5px] ${color} transition-transform duration-150 hover:scale-115 relative hover:z-10 cursor-pointer shadow-2xs`}
                      title={`${day.date}: ${day.count} submissions`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-0.5 text-[9px] text-slate-400 font-medium">
                <span>Less</span>
                <span className="w-2.5 h-2.5 rounded-[3px] bg-slate-200/80" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-200" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-emerald-400" />
                <span className="w-2.5 h-2.5 rounded-[3px] bg-[#064e3b]" />
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="h-5 flex items-center justify-end text-[10px] font-semibold text-right pt-1.5 overflow-hidden">
            {hoveredDay ? (
              <span className="text-emerald-700 animate-in fade-in duration-150">
                {hoveredDay.date}: {hoveredDay.count} submission{hoveredDay.count === 1 ? '' : 's'}
              </span>
            ) : (
              <span className="text-slate-400 font-normal">
                Past 21 days activity (PostgreSQL)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
