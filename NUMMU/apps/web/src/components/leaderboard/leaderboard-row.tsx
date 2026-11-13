'use client';

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Code2,
  ArrowUpRight,
  Crown,
} from 'lucide-react';
import type { LeaderboardEntry } from '@/data/leaderboard-data';
import { TIER_CONFIG } from '@/data/leaderboard-data';

interface LeaderboardRowProps {
  user: LeaderboardEntry;
  onSelect?: ((user: LeaderboardEntry) => void) | undefined;
}

export function LeaderboardRow({ user, onSelect }: LeaderboardRowProps) {
  const delta = user.previousRank - user.rank;
  const tierConfig = TIER_CONFIG[user.tier] || TIER_CONFIG.Pupil;

  // Problem difficulty ratios for visual micro-bar
  const total = user.dsaSolved || 1;
  const easyRatio = Math.round((user.easyCount / total) * 100);
  const medRatio = Math.round((user.mediumCount / total) * 100);
  const hardRatio = Math.round((user.hardCount / total) * 100);

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-400/40 ring-1 ring-amber-300">
          <Crown className="w-3 h-3 text-slate-950" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-slate-300 text-slate-800 font-black text-xs shadow-xs border border-slate-300">
          2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 text-amber-900 font-black text-xs shadow-xs border border-amber-300">
          3
        </div>
      );
    }
    if (rank <= 10) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300/80 font-mono font-black text-xs shadow-2xs">
          #{rank}
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-mono font-bold text-xs">
        #{rank}
      </div>
    );
  };

  return (
    <tr
      onClick={() => onSelect?.(user)}
      className={`group transition-all duration-200 cursor-pointer ${
        user.isCurrentUser
          ? 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/50 to-transparent font-medium hover:bg-emerald-100/70 border-l-4 border-l-emerald-600'
          : 'hover:bg-slate-50/90'
      }`}
    >
      {/* ── 1. Rank & Delta ── */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2.5">
          {renderRankBadge(user.rank)}

          {/* Delta Indicator */}
          {delta > 0 ? (
            <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/90 px-1.5 py-0.5 rounded-md shadow-2xs">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>+{delta}</span>
            </span>
          ) : delta < 0 ? (
            <span className="flex items-center gap-0.5 text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-200/90 px-1.5 py-0.5 rounded-md shadow-2xs">
              <TrendingDown className="w-3 h-3 text-rose-500" />
              <span>{delta}</span>
            </span>
          ) : (
            <span className="text-[10px] text-slate-300 font-bold px-1.5">
              <Minus className="w-3 h-3" />
            </span>
          )}
        </div>
      </td>

      {/* ── 2. Coder Identity & Avatar ── */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${user.avatarGradient || 'from-slate-400 to-slate-600'} p-0.5 shadow-sm shrink-0 group-hover:scale-105 transition-transform overflow-hidden`}
          >
            {user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://') || user.avatar.startsWith('/')) ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-[14px] object-cover bg-slate-900"
              />
            ) : (
              <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center font-black text-xs text-white">
                {user.avatar || user.name?.charAt(0).toUpperCase() || 'C'}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                {user.name}
              </span>
              {user.isCurrentUser && (
                <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full bg-[#0b5c39] text-white shadow-2xs">
                  YOU
                </span>
              )}
              {user.badge && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {user.badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
              <span className="font-mono text-slate-500">@{user.username}</span>
              <span>•</span>
              <span className="text-slate-600 font-semibold truncate max-w-[160px]">
                {user.specialtyTitle}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* ── 3. University & Tech Stack ── */}
      <td className="py-3.5 px-4 text-xs">
        <div className="font-bold text-slate-800 truncate max-w-[180px]">
          {user.college}
        </div>
        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
          <span>Class {user.batch}</span>
          <span>•</span>
          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
            {user.primaryLang}
          </span>
        </div>
      </td>

      {/* ── 4. Algorithmic Spectrum & Projects ── */}
      <td className="py-3.5 px-4">
        <div className="min-w-[140px]">
          <div className="flex items-center justify-between text-xs font-mono font-black text-slate-900 mb-1">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user.dsaSolved}</span>
              <span className="text-[10px] text-slate-400 font-normal">solved</span>
            </div>
            <span className="text-[10px] text-rose-600 font-bold">{user.hardCount} Hard</span>
          </div>

          {/* Micro Spectrum Bar */}
          <div className="h-1.5 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200/60" title={`Easy: ${user.easyCount} | Med: ${user.mediumCount} | Hard: ${user.hardCount}`}>
            <div style={{ width: `${easyRatio}%` }} className="bg-emerald-500 h-full" />
            <div style={{ width: `${medRatio}%` }} className="bg-amber-400 h-full" />
            <div style={{ width: `${hardRatio}%` }} className="bg-rose-500 h-full" />
          </div>
        </div>
      </td>

      {/* ── 5. Contest Rating & Division ── */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-sm text-slate-900">
            {user.contestRating}
          </span>
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierConfig.bg} ${tierConfig.color} ${tierConfig.border}`}
          >
            {user.tier}
          </span>
        </div>
      </td>

      {/* ── 6. Win Rate, XP, Streak & Action ── */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-3 text-xs">
          <div className="text-right">
            <div className="font-mono font-black text-slate-900">
              {user.xp.toLocaleString()} <span className="text-[9px] text-slate-400 font-sans font-normal">XP</span>
            </div>
            <div className="text-[10px] text-emerald-700 font-extrabold">
              {user.winRate}% Win Rate
            </div>
          </div>

          <span className="flex items-center gap-0.5 text-orange-600 font-mono text-xs font-black px-2 py-1 rounded-xl bg-orange-50 border border-orange-200/80 shadow-2xs">
            <Flame className="w-3.5 h-3.5 fill-orange-500" />
            <span>{user.streak}d</span>
          </span>

          {/* Dossier trigger arrow */}
          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#0b5c39] group-hover:text-white text-slate-400 flex items-center justify-center transition-all duration-150">
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </td>
    </tr>
  );
}
