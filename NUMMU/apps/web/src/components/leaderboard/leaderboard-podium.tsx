'use client';

import {
  Crown,
  Flame,
  Trophy,
  ArrowUpRight,
} from 'lucide-react';
import type { LeaderboardEntry } from '@/data/leaderboard-data';

interface LeaderboardPodiumProps {
  topThree: LeaderboardEntry[];
  onSelectUser?: ((user: LeaderboardEntry) => void) | undefined;
}

export function LeaderboardPodium({ topThree, onSelectUser }: LeaderboardPodiumProps) {
  if (topThree.length < 3) return null;

  const first = topThree[0]!;
  const second = topThree[1]!;
  const third = topThree[2]!;

  return (
    <div className="space-y-4">
      {/* ── Section Title & Tournament Division Badge ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/25">
            <Crown className="w-4 h-4 fill-slate-950" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Hall of Champions</span>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-300">
                Podium Stage
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              The supreme grandmasters currently dominating the global algorithmic circuit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Season 4 Live Circuit</span>
          </span>
        </div>
      </div>

      {/* ── Stepped Tournament Stage Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-4">

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2: SILVER TITANIUM (Rank #2 - Left, Elevation 2)
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center order-2 md:order-1">
          <div
            onClick={() => onSelectUser?.(second)}
            className="w-full relative rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-100/90 border-2 border-slate-300/80 hover:border-cyan-400/80 p-5.5 shadow-lg hover:shadow-cyan-500/15 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Cyan/Silver Glow Sweep */}
            <div className="pointer-events-none absolute -top-16 -left-16 w-36 h-36 bg-cyan-400/10 rounded-full blur-2xl group-hover:bg-cyan-400/20 transition-colors" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-slate-400 via-cyan-300 to-slate-400" />

            <div>
              {/* Card Header & Rank Emblem */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 border border-slate-400 flex items-center justify-center font-mono font-black text-xs text-slate-800 shadow-2xs">
                    #2
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-full">
                    Silver Laureate
                  </span>
                </div>
                <span className="text-2xl drop-shadow-sm">🥈</span>
              </div>

              {/* Avatar & Ident */}
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center font-black text-xl text-cyan-300">
                      {second.avatar}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-xs">⚡</span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                    {second.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">@{second.username}</div>
                  <div className="text-[11px] font-bold text-blue-700 truncate mt-0.5">
                    {second.college}
                  </div>
                </div>
              </div>

              {/* Specialty Flair */}
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-700 mb-3 flex items-center justify-between shadow-2xs">
                <span className="truncate font-semibold text-slate-800">{second.specialtyTitle}</span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 shrink-0 ml-1">
                  {second.primaryLang}
                </span>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 gap-2 text-center mb-3.5">
                <div className="p-2.5 rounded-2xl bg-white/80 border border-slate-200/80">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Arena Rating</div>
                  <div className="text-lg font-black text-slate-900 font-mono">{second.contestRating}</div>
                  <span className="text-[9px] font-bold text-blue-600">Top 0.5%</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/80 border border-slate-200/80">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">DSA Solved</div>
                  <div className="text-lg font-black text-emerald-700 font-mono">{second.dsaSolved}</div>
                  <span className="text-[9px] font-bold text-slate-500">{second.hardCount} Hard</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-orange-600 font-bold font-mono text-[11px]">
                <Flame className="w-3.5 h-3.5 fill-orange-500" /> {second.streak}d streak
              </span>
              <span className="font-extrabold text-blue-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>Dossier</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Stepped Pedestal Base (Rank 2) */}
          <div className="w-[88%] h-7 mt-2 rounded-b-2xl bg-gradient-to-b from-slate-200 to-slate-300 border-x border-b border-slate-400/60 shadow-inner flex items-center justify-center">
            <span className="text-[11px] font-black font-mono text-slate-600 tracking-widest">
              PODIUM II
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 1: GOLD CHAMPION (Rank #1 - Center, Elevated Supreme)
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center order-1 md:order-2 md:-translate-y-3 z-10">
          {/* Champion Crown Halo */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-400/40 mb-2 animate-bounce">
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>Reigning Arena Sovereign</span>
          </div>

          <div
            onClick={() => onSelectUser?.(first)}
            className="w-full relative rounded-3xl bg-gradient-to-b from-[#0f1f17] via-[#091710] to-[#050e0a] border-2 border-amber-400 p-6 text-white shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            {/* Radiant Golden Glow Beam */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl group-hover:bg-amber-400/30 transition-colors" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500" />

            <div className="relative z-10">
              {/* Header & Rank Emblem */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 flex items-center justify-center font-mono font-black text-sm shadow-md shadow-amber-400/40 ring-2 ring-amber-400/40">
                    #1
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-400/15 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                    Season #4 Grandmaster
                  </span>
                </div>
                <Crown className="w-6 h-6 text-amber-300 fill-amber-400 animate-pulse" />
              </div>

              {/* Avatar & Ident */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-orange-400 to-amber-600 p-1 shadow-xl shadow-amber-500/40 group-hover:scale-105 transition-transform ring-4 ring-amber-400/25">
                    <div className="w-full h-full rounded-[12px] bg-[#071912] flex items-center justify-center font-black text-2xl text-amber-300">
                      {first.avatar}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-sm">👑</span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors truncate">
                    {first.name}
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">@{first.username}</div>
                  <div className="text-xs font-bold text-amber-300 truncate mt-0.5">
                    {first.college}
                  </div>
                </div>
              </div>

              {/* Specialty Flair */}
              <div className="p-3 rounded-2xl bg-white/5 border border-amber-400/30 text-xs text-slate-200 mb-4 flex items-center justify-between">
                <span className="truncate font-bold text-white">{first.specialtyTitle}</span>
                <span className="text-[10px] font-mono font-black bg-amber-400/25 px-2.5 py-0.5 rounded-md text-amber-300 border border-amber-400/40 shrink-0 ml-1">
                  {first.primaryLang}
                </span>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 gap-2.5 text-center mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-amber-400/20 backdrop-blur-xs">
                  <div className="text-[9px] uppercase tracking-wider text-amber-300/80 font-bold">Arena Rating</div>
                  <div className="text-2xl font-black text-amber-300 font-mono">{first.contestRating}</div>
                  <span className="text-[9px] font-black text-emerald-400">Legend Rank 1</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">DSA Solved</div>
                  <div className="text-2xl font-black text-emerald-400 font-mono">{first.dsaSolved}</div>
                  <span className="text-[9px] font-bold text-slate-300">{first.hardCount} Hard Solved</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="relative z-10 pt-3.5 border-t border-amber-400/20 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1 text-orange-400 font-bold font-mono text-[11px]">
                <Flame className="w-4 h-4 fill-orange-400" /> {first.streak}d streak 🔥
              </span>
              <span className="font-black text-amber-300 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>View Dossier</span>
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Stepped Pedestal Base (Rank 1 - Highest) */}
          <div className="w-[92%] h-10 mt-2 rounded-b-2xl bg-gradient-to-b from-amber-400 to-amber-600 border-x border-b border-amber-700 shadow-lg shadow-amber-500/30 flex items-center justify-center">
            <span className="text-xs font-black font-mono text-slate-950 tracking-widest flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5" /> PODIUM I • CHAMPION
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 3: BRONZE AMBER (Rank #3 - Right, Elevation 3)
           ══════════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center order-3 md:order-3">
          <div
            onClick={() => onSelectUser?.(third)}
            className="w-full relative rounded-3xl bg-gradient-to-b from-white via-orange-50/30 to-amber-50/50 border-2 border-orange-200/90 hover:border-amber-500/80 p-5.5 shadow-lg hover:shadow-amber-500/15 transition-all duration-300 cursor-pointer group flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient Bronze/Orange Glow Sweep */}
            <div className="pointer-events-none absolute -top-16 -right-16 w-36 h-36 bg-orange-400/10 rounded-full blur-2xl group-hover:bg-orange-400/20 transition-colors" />
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-700 via-orange-400 to-amber-700" />

            <div>
              {/* Card Header & Rank Emblem */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 border border-orange-300 flex items-center justify-center font-mono font-black text-xs text-amber-900 shadow-2xs">
                    #3
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-orange-100/80 px-2 py-0.5 rounded-full">
                    Bronze Laureate
                  </span>
                </div>
                <span className="text-2xl drop-shadow-sm">🥉</span>
              </div>

              {/* Avatar & Ident */}
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-orange-600 p-0.5 shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center font-black text-xl text-amber-300">
                      {third.avatar}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 text-xs">🔥</span>
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors truncate">
                    {third.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">@{third.username}</div>
                  <div className="text-[11px] font-bold text-amber-800 truncate mt-0.5">
                    {third.college}
                  </div>
                </div>
              </div>

              {/* Specialty Flair */}
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/90 text-xs text-slate-700 mb-3 flex items-center justify-between shadow-2xs">
                <span className="truncate font-semibold text-slate-800">{third.specialtyTitle}</span>
                <span className="text-[10px] font-mono font-bold bg-orange-50 px-2 py-0.5 rounded-md text-amber-900 shrink-0 ml-1">
                  {third.primaryLang}
                </span>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 gap-2 text-center mb-3.5">
                <div className="p-2.5 rounded-2xl bg-white/80 border border-slate-200/80">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Arena Rating</div>
                  <div className="text-lg font-black text-slate-900 font-mono">{third.contestRating}</div>
                  <span className="text-[9px] font-bold text-amber-700">Top 1.2%</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-white/80 border border-slate-200/80">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">DSA Solved</div>
                  <div className="text-lg font-black text-emerald-700 font-mono">{third.dsaSolved}</div>
                  <span className="text-[9px] font-bold text-slate-500">{third.hardCount} Hard</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1 text-orange-600 font-bold font-mono text-[11px]">
                <Flame className="w-3.5 h-3.5 fill-orange-500" /> {third.streak}d streak
              </span>
              <span className="font-extrabold text-amber-800 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                <span>Dossier</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Stepped Pedestal Base (Rank 3) */}
          <div className="w-[88%] h-5 mt-2 rounded-b-2xl bg-gradient-to-b from-orange-200 to-amber-300 border-x border-b border-amber-500/60 shadow-inner flex items-center justify-center">
            <span className="text-[10px] font-black font-mono text-amber-900 tracking-widest">
              PODIUM III
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
