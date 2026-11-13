import React from 'react';
import {
  Code2,
  FolderGit2,
  Trophy,
  ClipboardCheck,
  Flame,
  Globe2,
  Quote,
  Sparkles,
} from 'lucide-react';
import type { ProfileStats } from '@/types/profile';

interface ProfileStatsBarProps {
  stats: ProfileStats;
  quote?: string;
}

export function ProfileStatsBar({ stats, quote }: ProfileStatsBarProps) {
  const conducted = stats.totalTestsConducted ?? 0;
  const attended = stats.testsAttended ?? (stats.testsCompleted ?? 0);
  const missed = stats.testsMissed ?? Math.max(0, conducted - attended);
  const attendanceRate = conducted > 0 ? Math.round((attended / conducted) * 100) : 0;

  const statItems = [
    {
      label: 'Problems Solved',
      value: stats.problemsSolved,
      subtext:
        stats.easySolved !== undefined
          ? `${stats.easySolved}E • ${stats.mediumSolved ?? 0}M • ${stats.hardSolved ?? 0}H`
          : 'DSA Practice',
      icon: Code2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-500/10',
      badgeText: 'VERIFIED',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      accentBorder: 'hover:border-emerald-300',
    },
    {
      label: 'Projects Built',
      value: stats.projectsCompleted,
      subtext: `${stats.projectsCompleted} Production ${stats.projectsCompleted === 1 ? 'App' : 'Apps'}`,
      icon: FolderGit2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
      badgeText: 'DEPLOYED',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      accentBorder: 'hover:border-blue-300',
    },
    {
      label: 'Test Rating',
      value: (stats.contestRating || 1200).toLocaleString(),
      subtext: (stats.contestRating || 1200) >= 1400 ? 'Knight Tier • Top 8%' : 'Specialist Tier',
      icon: Trophy,
      color: 'text-amber-600',
      bgColor: 'bg-amber-500/10',
      badgeText: 'TIER',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      accentBorder: 'hover:border-amber-300',
    },
    {
      label: 'Tests Attended',
      value: `${attended} / ${conducted}`,
      subtext: conducted > 0 ? `${attended} Attended • ${missed} Missed` : '0 Tests Taken',
      icon: ClipboardCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
      badgeText: `${attendanceRate}% ATTENDED`,
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      accentBorder: 'hover:border-purple-300',
    },
    {
      label: 'Practice Streak',
      value: `${stats.dayStreak} Days`,
      subtext: stats.maxStreak ? `Best: ${stats.maxStreak} Days` : 'Active Streak',
      icon: Flame,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      badgeText: 'STREAK',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200/80',
      accentBorder: 'hover:border-orange-300',
    },
    {
      label: 'Global Rank',
      value: `#${stats.globalRank ?? 2}`,
      subtext: 'Top 1% on NUMU',
      icon: Globe2,
      color: 'text-teal-600',
      bgColor: 'bg-teal-500/10',
      badgeText: 'GLOBAL',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200/80',
      accentBorder: 'hover:border-teal-300',
    },
  ];

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-[#0b2b1e] rounded-3xl border border-slate-200/90 dark:border-emerald-900/40 shadow-sm p-4 sm:p-5 transition-all">
        {/* Responsive Grid with clean vertical cards that never truncate text */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-3.5">
          {statItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`p-3.5 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-[#082218] border border-slate-200/80 dark:border-emerald-900/40 ${item.accentBorder} hover:shadow-md transition-all duration-200 flex flex-col justify-between min-w-0 group`}
              >
                {/* Top Row: Icon + Indicator Badge */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${item.bgColor} flex items-center justify-center transition-transform group-hover:scale-105`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${item.badgeBg}`}>
                    {item.badgeText}
                  </span>
                </div>

                {/* Stat Numbers & Labels - Stacked Vertically to prevent any truncation */}
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {item.value}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-snug mt-1.5 whitespace-normal">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-400 font-medium leading-snug mt-1 whitespace-normal">
                    {item.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Motivational Quote & Live Daily Pulse Strip */}
        {quote && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-emerald-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 italic min-w-0">
              <Quote className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 not-italic opacity-80" />
              <span className="truncate font-medium">{quote}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-800/40">
                <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>NUMU Daily Pulse</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
