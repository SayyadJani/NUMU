'use client';

import React from 'react';
import { LeaderboardRow } from './leaderboard-row';
import type { LeaderboardEntry } from '@/data/leaderboard-data';
import { Compass, SearchX, Award, FilterX } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  onSelectUser?: ((user: LeaderboardEntry) => void) | undefined;
  onJumpToMe?: (() => void) | undefined;
  onResetFilters?: (() => void) | undefined;
  currentUserRank?: number;
}

export function LeaderboardTable({
  entries,
  onSelectUser,
  onJumpToMe,
  onResetFilters,
  currentUserRank,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center flex flex-col items-center justify-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5 border border-slate-200">
          <SearchX className="w-7 h-7 text-slate-400" />
        </div>
        <h4 className="text-base font-black text-slate-900 mb-1">No competitors found</h4>
        <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-5">
          We couldn&apos;t find any rankers matching your active search or division filter.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0b5c39] to-[#08482c] hover:from-[#094d30] hover:to-[#073c24] text-white text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-950/20 cursor-pointer"
          >
            <FilterX className="w-4 h-4" />
            <span>Reset Search &amp; Filters</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* ── Table Top Control Bar ── */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-slate-50/50 via-white to-slate-50/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">
              Circuit Standings
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">
            {entries.length} Qualified Coders
          </span>
        </div>

        {onJumpToMe && (
          <button
            onClick={onJumpToMe}
            className="text-xs font-black text-emerald-800 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer bg-emerald-50 border border-emerald-200/90 px-3 py-1.5 rounded-xl transition-all shadow-2xs hover:bg-emerald-100 active:scale-95"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Locate My Rank (#{currentUserRank || 1})</span>
          </button>
        )}
      </div>

      {/* ── High Density Rankings Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Rank &amp; Delta</th>
              <th className="py-3 px-4">Competitor Dossier</th>
              <th className="py-3 px-4">Institution &amp; Stack</th>
              <th className="py-3 px-4">Algorithmic Spectrum</th>
              <th className="py-3 px-4">Arena Rating</th>
              <th className="py-3 px-4 text-right">XP &amp; Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((user) => (
              <LeaderboardRow key={user.id} user={user} onSelect={onSelectUser} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
