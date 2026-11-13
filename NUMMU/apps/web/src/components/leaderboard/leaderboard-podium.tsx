'use client';

import React from 'react';
import type { LeaderboardEntry } from '@/data/leaderboard-data';
import { CharacterAvatar } from '@/components/ui/character-avatar';

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
    <div className="w-full rounded-3xl bg-[#0c0e14] border border-[#1b202c] shadow-2xl p-4 sm:p-8 pt-6 select-none overflow-hidden">
      {/* ── Top Pill Switcher / Tabs Bar (matching top of screenshot) ── */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-1 bg-[#141822] p-1 rounded-2xl border border-[#232938]">
          <button
            type="button"
            className="px-5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#22293a] shadow-xs cursor-pointer"
          >
            All-Time Leaderboard
          </button>
          <button
            type="button"
            className="px-5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Weekly Circuit
          </button>
        </div>
      </div>

      {/* ── Floating Golden Trophy ── */}
      <div className="flex justify-center mb-2">
        <div className="text-3xl sm:text-4xl filter drop-shadow-[0_0_12px_rgba(234,179,8,0.6)] animate-pulse">
          🏆
        </div>
      </div>

      {/* ── 3D Monument Podium Stage ── */}
      <div className="flex items-end justify-center max-w-2xl sm:max-w-3xl mx-auto pt-2">
        
        {/* ══════════════════════════════════════════════════════════
            RANK 2 — LEFT (MID-ELEVATION 3D PEDESTAL)
           ══════════════════════════════════════════════════════════ */}
        <div
          onClick={() => onSelectUser?.(second)}
          className="flex-1 flex flex-col items-center cursor-pointer group z-10 -mr-[1px]"
        >
          {/* Avatar & Ident */}
          <div className="flex flex-col items-center mb-3 group-hover:-translate-y-1 transition-transform duration-200">
            {/* Warm Peachy-Tan Circular Avatar Frame */}
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#f6d2b5] p-1.5 overflow-hidden flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:scale-105 transition-transform">
              <CharacterAvatar type={second.avatar || 'male'} size="md" className="w-full h-full" />
            </div>

            {/* Name */}
            <div className="text-xs sm:text-sm font-medium text-white mt-2 truncate max-w-[100px] sm:max-w-[130px] text-center">
              {second.name}
            </div>

            {/* Streak Pill */}
            <div className="mt-1 flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#181c25] border border-[#293040] text-[10px] sm:text-[11px] font-semibold text-white shadow-sm">
              <span>{second.streak || 5} days</span>
              <span>🔥</span>
            </div>
          </div>

          {/* 3D Block #2 */}
          <div className="w-full flex flex-col items-center">
            {/* Top Isometric Perspective Surface */}
            <div
              className="w-full h-6 sm:h-8 bg-gradient-to-b from-[#4e5566] via-[#383f4f] to-[#282d3a] border-t border-x border-[#60687d]/70 shadow-inner"
              style={{
                clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
              }}
            />

            {/* Front Shaded Surface with Centered Numeral */}
            <div className="w-full h-36 sm:h-48 md:h-56 bg-gradient-to-b from-[#282d3b] via-[#1a1e28] to-[#0c0e14] border-l border-t border-[#3b4356]/60 border-r border-[#191c24] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
              <span className="text-5xl sm:text-7xl md:text-8xl font-black text-white/90 tracking-tighter font-sans select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
                2
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RANK 1 — CENTER (TALLEST 3D PEDESTAL)
           ══════════════════════════════════════════════════════════ */}
        <div
          onClick={() => onSelectUser?.(first)}
          className="flex-1 flex flex-col items-center cursor-pointer group z-20"
        >
          {/* Avatar & Ident */}
          <div className="flex flex-col items-center mb-3 group-hover:-translate-y-1 transition-transform duration-200">
            {/* Warm Peachy-Tan Circular Avatar Frame */}
            <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-[#f6d2b5] p-2 overflow-hidden flex items-center justify-center shadow-xl ring-2 ring-white/15 group-hover:scale-105 transition-transform">
              <CharacterAvatar type={first.avatar || 'male'} size="lg" className="w-full h-full" />
            </div>

            {/* Name */}
            <div className="text-xs sm:text-sm font-semibold text-white mt-2 truncate max-w-[120px] sm:max-w-[160px] text-center">
              {first.name}
            </div>

            {/* Streak Pill */}
            <div className="mt-1 flex items-center gap-1 px-3.5 py-0.5 rounded-full bg-[#181c25] border border-[#293040] text-[10px] sm:text-xs font-semibold text-white shadow-sm">
              <span>{first.streak || 10} days</span>
              <span>🔥</span>
            </div>
          </div>

          {/* 3D Block #1 (Tallest) */}
          <div className="w-full flex flex-col items-center">
            {/* Top Isometric Perspective Surface */}
            <div
              className="w-full h-7 sm:h-9 bg-gradient-to-b from-[#5c6478] via-[#434b5c] to-[#2f3544] border-t border-x border-[#727b91]/80 shadow-inner"
              style={{
                clipPath: 'polygon(12% 0%, 92% 0%, 100% 100%, 0% 100%)',
              }}
            />

            {/* Front Shaded Surface with Centered Numeral */}
            <div className="w-full h-48 sm:h-64 md:h-76 bg-gradient-to-b from-[#2e3444] via-[#1c212c] to-[#0c0e14] border-x border-t border-[#464f65]/70 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.08)]">
              <span className="text-6xl sm:text-8xl md:text-9xl font-black text-white/95 tracking-tighter font-sans select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                1
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            RANK 3 — RIGHT (LOWEST 3D PEDESTAL)
           ══════════════════════════════════════════════════════════ */}
        <div
          onClick={() => onSelectUser?.(third)}
          className="flex-1 flex flex-col items-center cursor-pointer group z-10 -ml-[1px]"
        >
          {/* Avatar & Ident */}
          <div className="flex flex-col items-center mb-3 group-hover:-translate-y-1 transition-transform duration-200">
            {/* Warm Peachy-Tan Circular Avatar Frame */}
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#f6d2b5] p-1.5 overflow-hidden flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:scale-105 transition-transform">
              <CharacterAvatar type={third.avatar || 'female'} size="md" className="w-full h-full" />
            </div>

            {/* Name */}
            <div className="text-xs sm:text-sm font-medium text-white mt-2 truncate max-w-[100px] sm:max-w-[130px] text-center">
              {third.name}
            </div>

            {/* Streak Pill */}
            <div className="mt-1 flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#181c25] border border-[#293040] text-[10px] sm:text-[11px] font-semibold text-white shadow-sm">
              <span>{third.streak || 3} days</span>
              <span>🔥</span>
            </div>
          </div>

          {/* 3D Block #3 */}
          <div className="w-full flex flex-col items-center">
            {/* Top Isometric Perspective Surface */}
            <div
              className="w-full h-5 sm:h-7 bg-gradient-to-b from-[#444a59] via-[#323744] to-[#222632] border-t border-x border-[#565e72]/70 shadow-inner"
              style={{
                clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
              }}
            />

            {/* Front Shaded Surface with Centered Numeral */}
            <div className="w-full h-28 sm:h-38 md:h-44 bg-gradient-to-b from-[#242835] via-[#171a23] to-[#0c0e14] border-r border-t border-[#353c4d]/60 border-l border-[#191c24] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
              <span className="text-4xl sm:text-6xl md:text-7xl font-black text-white/85 tracking-tighter font-sans select-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
                3
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Subtle Floor Base Glow ── */}
      <div className="w-full h-6 bg-gradient-to-b from-[#0c0e14] to-[#08090d]" />
    </div>
  );
}
