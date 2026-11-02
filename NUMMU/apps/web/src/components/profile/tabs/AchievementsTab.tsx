'use client';

import React, { useState } from 'react';
import {
  Award,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import type { Achievement } from '@/types/profile';

interface AchievementsTabProps {
  achievements: Achievement[];
}

const RARITY_BADGE: Record<string, string> = {
  Common: 'bg-slate-100 text-slate-700 border-slate-200',
  Rare: 'bg-blue-50 text-blue-700 border-blue-200',
  Epic: 'bg-purple-50 text-purple-700 border-purple-200',
  Legendary: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
};

export function AchievementsTab({ achievements }: AchievementsTabProps) {
  const [filter, setFilter] = useState<'All' | 'Earned' | 'In Progress'>('All');

  const earnedCount = achievements.filter((a) => a.earned).length;

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'Earned') return a.earned;
    if (filter === 'In Progress') return !a.earned;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Achievement Hero Banner ── */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-[#072417] rounded-2xl sm:rounded-3xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center backdrop-blur-md">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  {earnedCount} of {achievements.length} Badges Unlocked
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Earn badges by solving problems, coding projects, and participating in contests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-md">
            {(['All', 'Earned', 'In Progress'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Badges Grid or Empty State ── */}
      {filteredAchievements.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">No Badges Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {filter === 'Earned'
              ? 'You have not unlocked any badges yet. Solve problems or complete daily streaks to earn your first badge!'
              : 'No badges match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAchievements.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col justify-between p-5 rounded-2xl sm:rounded-3xl border transition-all ${
              item.earned
                ? 'bg-white border-slate-200/90 hover:border-emerald-200 hover:shadow-md'
                : 'bg-slate-50/70 border-slate-200/50 opacity-80'
            }`}
          >
            <div>
              {/* Badge Header: Rarity & Status */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-[9px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    RARITY_BADGE[item.rarity ?? 'Common']
                  }`}
                >
                  {item.rarity ?? 'Common'}
                </span>

                {item.earned ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Locked
                  </span>
                )}
              </div>

              {/* Icon & Title */}
              <div className="flex flex-col items-center text-center my-3">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3 ${
                    item.earned
                      ? 'bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 shadow-sm'
                      : 'bg-slate-200/50 grayscale'
                  }`}
                >
                  {item.icon}
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Footer: Progress or Unlocked Date */}
            <div className="pt-3 border-t border-slate-100 mt-2">
              {item.earned ? (
                <div className="text-[10px] text-slate-400 text-center font-mono">
                  Unlocked {item.unlockedAt ?? '2026'}
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                    <span>Progress</span>
                    <span>
                      {item.progress ?? 0} / {item.maxProgress ?? 100}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((item.progress ?? 0) / (item.maxProgress ?? 100)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
