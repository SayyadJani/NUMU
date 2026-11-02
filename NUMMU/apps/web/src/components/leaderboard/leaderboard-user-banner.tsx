'use client';

import {
  Trophy,
  TrendingUp,
  Flame,
  School,
  Zap,
  Compass,
} from 'lucide-react';
import { CURRENT_USER_LEADERBOARD_STATS, TIER_CONFIG } from '@/data/leaderboard-data';

interface LeaderboardUserBannerProps {
  onJumpToMe?: (() => void) | undefined;
  onInspectMe?: (() => void) | undefined;
}

export function LeaderboardUserBanner({ onJumpToMe, onInspectMe: _onInspectMe }: LeaderboardUserBannerProps) {
  const stats = CURRENT_USER_LEADERBOARD_STATS;
  const rankDelta = stats.previousGlobalRank - stats.globalRank;
  const tierConfig = TIER_CONFIG[stats.tier];

  // Calculate rating progress towards next tier (Guardian: 1600 - 1899)
  // Current: 1640. Next tier boundary: 1900 for Legend, or 1600 threshold
  const currentRating = stats.contestRating;
  const nextTierRating = 1900;
  const prevTierRating = 1600;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round(((currentRating - prevTierRating) / (nextTierRating - prevTierRating)) * 100))
  );
  const pointsNeeded = nextTierRating - currentRating;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071710] via-[#091a13] to-[#040e0a] border-2 border-emerald-500/30 p-6 sm:p-7 text-white shadow-2xl shadow-emerald-950/40">
      {/* ── High-Tech Cyber Atmosphere ── */}
      <div className="pointer-events-none absolute -top-28 -left-28 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px]" />
      {/* Circuit Grid matrix */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#10b98115_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-80" />
      {/* Corner laser notches */}
      <div className="pointer-events-none absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-3xl opacity-60" />
      <div className="pointer-events-none absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-3xl opacity-60" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">

        {/* ── Left: Player Card Identity ── */}
        <div className="flex items-start sm:items-center gap-4.5">
          {/* Avatar with Radiant Glowing Tier Ring */}
          <div className="relative shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-700 p-1 shadow-xl shadow-emerald-500/35 ring-4 ring-emerald-500/20">
              <div className="w-full h-full rounded-[12px] bg-[#061811] flex items-center justify-center font-black text-2xl sm:text-3xl text-emerald-300">
                J
              </div>
            </div>
            {/* Live beacon indicator */}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-[#081510] shadow-md">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          {/* Identity details */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-300 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40">
                Season 4 Competitor Pass
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${tierConfig.bg} ${tierConfig.color} ${tierConfig.border}`}>
                ★ {stats.tier} Division
              </span>
              <span className="text-[10px] font-mono text-emerald-400/90 bg-white/5 px-2 py-0.5 rounded-full">
                Top {stats.percentile}% Global Percentile
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Jani Pasha</span>
                <span className="text-xs font-mono font-normal text-slate-400">@jani_pasha</span>
              </h1>
              <span className="text-xs text-emerald-400 font-black flex items-center gap-1 bg-emerald-950/90 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5" /> +{rankDelta} Ranks Climbed
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 font-medium">
                <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-white font-semibold">BVRIT</span>
                <span className="text-emerald-400/80 font-mono text-[11px]">(Campus #{stats.collegeRank})</span>
              </span>
              <span className="text-emerald-700 font-bold">•</span>
              <span className="text-emerald-300 font-medium">{stats.specialtyTitle}</span>
              <span className="text-emerald-700 font-bold">•</span>
              <span className="font-mono text-slate-400">{stats.primaryLang}</span>
            </div>
          </div>
        </div>

        {/* ── Center / Middle: Division Progression Track ── */}
        <div className="hidden 2xl:flex flex-col justify-center min-w-[240px] px-5 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
            <span className="flex items-center gap-1 text-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Next: Legend Tier</span>
            </span>
            <span className="font-mono text-emerald-400">-{pointsNeeded} pts to unlock</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 shadow-sm"
            />
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
            <span>Knight (1,600)</span>
            <span className="text-amber-300 font-bold">Legend (1,900)</span>
          </div>
        </div>

        {/* ── Right: Live Esports Matrix & Quick Action ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Global Standing Pod */}
          <div className="px-5 py-3.5 rounded-2xl bg-[#0e271e]/90 border border-emerald-500/30 backdrop-blur-md flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              <span>Global Rank</span>
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono leading-none">
              #{stats.globalRank}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-1">
              of {stats.totalStudents.toLocaleString()} competitors
            </div>
          </div>

          {/* Rating Pod */}
          <div className="px-5 py-3.5 rounded-2xl bg-[#0e271e]/90 border border-emerald-500/30 backdrop-blur-md flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              <span>Arena Rating</span>
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono leading-none">
              {stats.contestRating}
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">
              +56 rating last round
            </div>
          </div>

          {/* Streak Pod */}
          <div className="px-5 py-3.5 rounded-2xl bg-[#0e271e]/90 border border-emerald-500/30 backdrop-blur-md flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              <span>Active Streak</span>
              <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            </div>
            <div className="text-2xl font-black text-orange-400 font-mono leading-none flex items-center gap-1">
              <span>{stats.streak}</span>
              <span className="text-xs font-sans text-slate-400">days</span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold mt-1">
              {stats.dsaSolved} Solved • {stats.winRate}% Win
            </div>
          </div>

          {/* Locate My Rank Button */}
          {onJumpToMe && (
            <button
              onClick={onJumpToMe}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/30 flex sm:flex-col items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              title="Locate my position in standings"
            >
              <Compass className="w-5 h-5 text-slate-950 animate-spin-slow" />
              <span>Locate Me</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
