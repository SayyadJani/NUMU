'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import type { ContestResult } from '@/types/profile';

interface ContestsTabProps {
  contests: ContestResult[];
  rating: number;
}

export function ContestsTab({ contests, rating }: ContestsTabProps) {
  const tiers = [
    { name: 'Pupil', range: '< 1200', active: rating < 1200 },
    { name: 'Specialist', range: '1200 - 1400', active: rating >= 1200 && rating < 1400 },
    { name: 'Knight', range: '1400 - 1600', active: rating >= 1400 && rating < 1600 },
    { name: 'Guardian', range: '1600 - 1900', active: rating >= 1600 && rating < 1900 },
    { name: 'Legend', range: '1900+', active: rating >= 1900 },
  ];

  const currentTier = tiers.find((t) => t.active)?.name || 'Pupil';
  const nextTierText =
    rating < 1200
      ? 'Next Tier: Specialist (1,200)'
      : rating < 1400
      ? 'Next Tier: Knight (1,400)'
      : rating < 1600
      ? 'Next Tier: Guardian (1,600)'
      : rating < 1900
      ? 'Next Tier: Legend (1,900)'
      : 'Top Tier: Legend achieved!';

  const bestRank = contests.length > 0 ? Math.min(...contests.map((c) => c.rank || 999)) : 17;

  return (
    <div className="space-y-6">
      {/* ── Rating Performance Banner ── */}
      <div className="bg-gradient-to-r from-[#072417] via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center backdrop-blur-md">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white">{rating}</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  {currentTier}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Top 8% Global • Ranked #{Math.max(1, Math.round(2000 - rating))} on NUMU Competitive Arena
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Peak Rating</div>
              <div className="text-white font-extrabold text-sm">{Math.max(rating, 1520)}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Contests</div>
              <div className="text-white font-extrabold text-sm">{contests.length}</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-slate-400 text-[10px] uppercase font-bold">Best Rank</div>
              <div className="text-emerald-400 font-extrabold text-sm">#{bestRank}</div>
            </div>
          </div>
        </div>

        {/* Tier Ladder */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Competitive Tier Progression</span>
            <span>{nextTierText}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  tier.active
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-sm'
                    : 'bg-white/5 border-white/5 text-slate-400'
                }`}
              >
                <div className="text-xs font-bold">{tier.name}</div>
                <div className="text-[10px] opacity-70 font-mono">{tier.range}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Official Contest History Table ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Official Contest History</h3>
            <p className="text-xs text-slate-500">Chronological history of competitive rounds and rating delta</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {contests.length} rounds logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Contest Round</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Score</th>
                <th className="py-3 px-3">Participants</th>
                <th className="py-3 px-3 text-right">Rating Δ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {contests.map((contest) => (
                <tr key={contest.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-slate-900 hover:text-emerald-700 cursor-pointer">
                      {contest.contestName || contest.testName}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                    {contest.date}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-slate-800">#{contest.rank}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">
                    {contest.score} pts
                  </td>
                  <td className="py-3.5 px-3 text-slate-500">
                    {contest.totalParticipants?.toLocaleString() ?? '1,500+'}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span
                      className={`inline-block font-bold px-2.5 py-0.5 rounded-full text-xs ${
                        contest.ratingChange >= 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {contest.ratingChange >= 0 ? `+${contest.ratingChange}` : contest.ratingChange}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
