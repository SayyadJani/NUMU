'use client';

import React from 'react';
import {
  X,
  Trophy,
  Flame,
  Zap,
  Code2,
  FolderGit2,
  School,
  Target,
  Swords,
} from 'lucide-react';
import type { LeaderboardEntry } from '@/data/leaderboard-data';
import { TIER_CONFIG } from '@/data/leaderboard-data';

interface CoderDetailModalProps {
  user: LeaderboardEntry | null;
  onClose: () => void;
  onChallenge?: ((user: LeaderboardEntry) => void) | undefined;
}

export function CoderDetailModal({ user, onClose, onChallenge }: CoderDetailModalProps) {
  if (!user) return null;

  const tierCfg = TIER_CONFIG[user.tier] || TIER_CONFIG.Pupil;
  const totalSolved = user.dsaSolved;
  const easyPct = totalSolved > 0 ? Math.round((user.easyCount / totalSolved) * 100) : 0;
  const medPct = totalSolved > 0 ? Math.round((user.mediumCount / totalSolved) * 100) : 0;
  const hardPct = totalSolved > 0 ? Math.round((user.hardCount / totalSolved) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Backdrop Dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-gradient-to-b from-[#0e1713] to-[#070d0a] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-emerald-950/60 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow Halos */}
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header: Player Identity Dossier */}
        <div className="flex items-start gap-4 sm:gap-5 mb-6">
          {/* Avatar with radiant ring */}
          <div className="relative shrink-0">
            <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-gradient-to-br ${user.avatarGradient || 'from-emerald-400 to-teal-600'} p-0.5 shadow-xl shadow-emerald-500/20`}>
              <div className="w-full h-full rounded-[14px] bg-[#0b1712] flex items-center justify-center font-black text-3xl sm:text-4xl text-emerald-300">
                {user.avatar}
              </div>
            </div>
            {/* Rank badge pin */}
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black font-mono shadow-md flex items-center gap-0.5">
              <Trophy className="w-2.5 h-2.5" />
              <span>#{user.rank}</span>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tierCfg.bg} ${tierCfg.color} ${tierCfg.border}`}>
                ★ {user.tier} Division
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                Class of {user.batch}
              </span>
              {user.isCurrentUser && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[#0b5c39] text-white">
                  YOU
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{user.name}</span>
              {user.badge && <span className="text-base">{user.badge}</span>}
            </h2>
            <div className="text-xs font-mono text-slate-400">@{user.username}</div>

            <div className="flex items-center gap-3 text-xs text-slate-300 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">{user.college}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-300 font-medium">{user.specialtyTitle}</span>
            </div>
          </div>
        </div>

        {/* Tactical Key Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-emerald-400" /> Rating
            </div>
            <div className="text-xl font-black font-mono text-emerald-300">{user.contestRating}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{user.tier} Tier</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Code2 className="w-3 h-3 text-cyan-400" /> Solved
            </div>
            <div className="text-xl font-black font-mono text-white">{user.dsaSolved}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{user.hardCount} Hard Problems</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Flame className="w-3 h-3 text-orange-400" /> Streak
            </div>
            <div className="text-xl font-black font-mono text-orange-400">{user.streak}d</div>
            <div className="text-[9px] text-slate-400 mt-0.5">Consecutive Days</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-amber-400" /> Win Rate
            </div>
            <div className="text-xl font-black font-mono text-amber-300">{user.winRate}%</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{user.xp.toLocaleString()} Total XP</div>
          </div>
        </div>

        {/* Solved Distribution Spectrum */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
            <span>Algorithmic Problem Spectrum</span>
            <span className="font-mono text-emerald-400">{user.dsaSolved} Total Solved</span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-3 rounded-full bg-slate-900/80 p-0.5 flex gap-1 overflow-hidden border border-white/10 mb-3">
            <div
              style={{ width: `${easyPct}%` }}
              className="h-full bg-emerald-500 rounded-l-full"
              title={`Easy: ${user.easyCount} (${easyPct}%)`}
            />
            <div
              style={{ width: `${medPct}%` }}
              className="h-full bg-amber-500"
              title={`Medium: ${user.mediumCount} (${medPct}%)`}
            />
            <div
              style={{ width: `${hardPct}%` }}
              className="h-full bg-rose-500 rounded-r-full"
              title={`Hard: ${user.hardCount} (${hardPct}%)`}
            />
          </div>

          {/* Difficulty Legend */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/20">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Easy</div>
              <div className="text-sm font-black font-mono text-white">{user.easyCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/20">
              <div className="text-[10px] text-amber-400 font-bold uppercase">Medium</div>
              <div className="text-sm font-black font-mono text-white">{user.mediumCount}</div>
            </div>
            <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-500/20">
              <div className="text-[10px] text-rose-400 font-bold uppercase">Hard</div>
              <div className="text-sm font-black font-mono text-white">{user.hardCount}</div>
            </div>
          </div>
        </div>

        {/* Primary Stack & Projects */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Core Weapon:</span>
            <span className="font-mono font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
              {user.primaryLang}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Capstones Built:</span>
            <span className="font-mono font-bold text-blue-300 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>{user.projectsBuilt} Projects</span>
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-3 pt-2">
          {onChallenge && !user.isCurrentUser && (
            <button
              onClick={() => onChallenge(user)}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Swords className="w-4 h-4" />
              <span>Challenge to 1v1 Arena Duel</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Close Dossier</span>
          </button>
        </div>
      </div>
    </div>
  );
}
