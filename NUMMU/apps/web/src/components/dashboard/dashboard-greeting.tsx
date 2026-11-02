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
} from 'lucide-react';
import {
  DUMMY_USER_PROFILE,
  DUMMY_HEATMAP_DAYS,
  type ActivityDay,
} from '@/data/dashboard-mock';

import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/loading-state';
import { gamificationService } from '@/services/gamification.service';
import type { GamificationSummaryDto } from '@numu/types';

export function DashboardGreeting() {
  const [greeting, setGreeting] = useState('Good morning');
  const [hoveredDay, setHoveredDay] = useState<ActivityDay | null>(null);
  const [gamification, setGamification] = useState<GamificationSummaryDto | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    let isMounted = true;
    gamificationService
      .getSummary()
      .then((data) => {
        if (isMounted) setGamification(data);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const currentLevel = gamification ? gamification.level.current : DUMMY_USER_PROFILE.level;
  const levelTitle = gamification
    ? `Level ${gamification.level.current} Developer`
    : DUMMY_USER_PROFILE.levelTitle;
  const xpIntoLevel = gamification ? gamification.level.xpIntoLevel : DUMMY_USER_PROFILE.xp;
  const nextLevelSpan = gamification
    ? gamification.level.isMaxLevel
      ? gamification.level.currentLevelXp
      : gamification.level.nextLevelXp - gamification.level.currentLevelXp
    : DUMMY_USER_PROFILE.xpToNextLevel;
  const xpPercent = gamification
    ? gamification.level.progressPercentage
    : Math.round((DUMMY_USER_PROFILE.xp / DUMMY_USER_PROFILE.xpToNextLevel) * 100);
  const currentStreak = gamification ? gamification.streak.current : DUMMY_USER_PROFILE.streak;

  return (
    <div className="bg-white rounded-3xl border border-emerald-100/70 p-5 sm:p-6 lg:p-7 shadow-xs relative overflow-hidden">
      {/* Soft background ambient gradient glow matching mockup */}
      <div className="absolute top-0 right-1/4 -mt-16 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 left-1/3 w-64 h-64 rounded-full bg-teal-100/30 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* ── Left Column: Level Pill, Rank, Greeting & XP Progress ── */}
        <div className="space-y-3.5 max-w-lg text-left">
          {/* Badge & Rank Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-semibold shadow-2xs">
              <Star className="w-3.5 h-3.5 text-[#16a34a] fill-[#16a34a]" />
              <span>{levelTitle}</span>
            </div>
            <span className="text-slate-300 font-light select-none">|</span>
            <span className="text-xs text-slate-400 font-medium">
              Rank #{DUMMY_USER_PROFILE.globalRank} of {DUMMY_USER_PROFILE.totalStudents.toLocaleString()}
            </span>
          </div>

          {/* Greeting & Motivational Message */}
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
              <span>{greeting},</span>
              {loading ? (
                <Skeleton className="w-36 h-9 rounded-lg inline-block" />
              ) : (
                <span className="text-[#059669]">{user?.name || user?.username || DUMMY_USER_PROFILE.name}</span>
              )}
              <span className="inline-block hover:animate-wave origin-bottom-right cursor-default">👋</span>
            </h1>
            <p className="text-xs sm:text-[13px] text-slate-500 font-normal leading-relaxed mt-1">
              Consistency compounds into extraordinary results.
              <br className="hidden sm:inline" />
              {' '}You are on track for campus placements!
            </p>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-1.5 pt-1 max-w-md">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Level {currentLevel} Progress
              </span>
              <span className="font-mono font-bold text-[#059669]">
                {xpIntoLevel.toLocaleString()} / {nextLevelSpan.toLocaleString()} XP ({xpPercent}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#047857] via-[#059669] to-[#10b981] transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Middle Column: Coded Developer Illustration with Floating Badges & Icons ── */}
        <div className="relative hidden lg:flex items-center justify-center shrink-0 w-64 h-48 select-none mx-auto xl:mx-0">
          {/* Ambient soft glow aura */}
          <div className="absolute inset-0 m-auto w-44 h-44 rounded-full bg-gradient-to-tr from-emerald-200/50 via-teal-100/40 to-emerald-50/20 blur-2xl pointer-events-none" />

          {/* Floating Code Badge </> */}
          <div className="absolute left-2 top-8 z-20 w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0f766e] to-[#059669] text-white flex items-center justify-center font-mono font-extrabold text-sm shadow-md shadow-emerald-900/15 transform -rotate-12 animate-float">
            &lt;/&gt;
          </div>

          {/* Floating Analytics Bar Chart Badge */}
          <div className="absolute right-4 top-5 z-20 w-12 h-11 rounded-2xl bg-white border border-slate-100 shadow-md flex items-end justify-center gap-1 p-2.5 pb-2 transform rotate-6 animate-float-delayed">
            <div className="w-1.5 h-3 bg-emerald-400 rounded-full" />
            <div className="w-1.5 h-4.5 bg-emerald-500 rounded-full" />
            <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
          </div>

          {/* Floating Sparkles */}
          <div className="absolute right-2 top-16 z-10 text-amber-400 text-lg animate-pulse">
            ✦
          </div>
          <div className="absolute left-10 bottom-8 z-10 text-emerald-400 text-sm">
            ✦
          </div>
          <Sparkles className="absolute right-8 bottom-6 z-10 w-4 h-4 text-emerald-300 opacity-70" />

          {/* 3D Student Coder Avatar Image */}
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

        {/* ── Right Column: Nested 21-Day Activity Matrix & Streak Card ── */}
        <div className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col justify-between shrink-0 w-full xl:w-auto min-w-[340px]">
          {/* Top Header Row of Card */}
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
                  Keep building your consistency!
                </div>
              </div>
            </div>

            <Link
              href={user?.username ? `/profile/${encodeURIComponent(user.username)}` : '/profile'}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors group cursor-pointer"
            >
              <span>View Details</span>
              <span className="text-sm transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          {/* Bottom Row: Streak Box + 21-Day Heatmap Grid */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3.5">
            {/* 12-Day Streak Lockup */}
            <div className="flex items-center gap-3 pr-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-orange-50 to-amber-50/70 border border-orange-200/80 flex items-center justify-center shadow-2xs shrink-0">
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
                  <span>Freeze Active</span>
                </div>
              </div>
            </div>

            {/* Interactive 21-Day Activity Heatmap Grid (7 columns x 3 rows) */}
            <div className="flex flex-col items-end gap-1.5 ml-auto">
              <div className="grid grid-cols-7 grid-rows-3 gap-1.5 relative">
                {DUMMY_HEATMAP_DAYS.map((day, idx) => {
                  let color = 'bg-slate-200/80';
                  if (day.level === 1) color = 'bg-emerald-200';
                  if (day.level === 2) color = 'bg-emerald-400';
                  if (day.level === 3) color = 'bg-emerald-600';
                  if (day.level === 4) color = 'bg-[#064e3b]';

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-[5px] ${color} transition-transform duration-150 hover:scale-115 relative hover:z-10 cursor-pointer shadow-2xs`}
                      title={`${day.date}: ${day.count} problems solved`}
                    />
                  );
                })}
              </div>

              {/* Heatmap Legend */}
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

          {/* Status Bar with fixed height so card size never changes or jumps on hover */}
          <div className="h-5 flex items-center justify-end text-[10px] font-semibold text-right pt-1.5 overflow-hidden">
            {hoveredDay ? (
              <span className="text-emerald-700 animate-in fade-in duration-150">
                {hoveredDay.date}: {hoveredDay.count} problem{hoveredDay.count === 1 ? '' : 's'} solved
              </span>
            ) : (
              <span className="text-slate-400 font-normal">
                Past 21 days activity
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

