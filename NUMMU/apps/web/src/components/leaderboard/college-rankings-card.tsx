'use client';

import { School, ChevronRight, Trophy } from 'lucide-react';
import { COLLEGE_RANKINGS } from '@/data/leaderboard-data';

interface CollegeRankingsCardProps {
  onViewAllColleges?: (() => void) | undefined;
  onSelectCollege?: ((collegeName: string) => void) | undefined;
}

export function CollegeRankingsCard({ onViewAllColleges, onSelectCollege }: CollegeRankingsCardProps) {
  // Max score for relative rating bar
  const maxScore = 2000;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/20">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 leading-none">
                Inter-University Cup
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Campus institutional scoreboard</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Trophy className="w-2.5 h-2.5 text-blue-600" />
            <span>Collegiate Circuit</span>
          </span>
        </div>

        {/* College Standings List */}
        <div className="space-y-2.5">
          {COLLEGE_RANKINGS.map((c) => {
            const barWidth = Math.min(100, Math.round((c.averageScore / maxScore) * 100));
            const isBvrit = c.college.toLowerCase().includes('bvrit');

            return (
              <div
                key={c.rank}
                onClick={() => onSelectCollege?.(c.college)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer group ${
                  isBvrit
                    ? 'bg-emerald-50/70 border-emerald-300/80 hover:bg-emerald-100/70'
                    : 'bg-slate-50/60 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5 mb-1.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 text-center font-black text-xs shrink-0">
                      {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : `#${c.rank}`}
                    </span>

                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-black text-xs text-slate-700 shrink-0 shadow-2xs">
                      {c.logoChar}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                        <span>{c.college}</span>
                        {isBvrit && (
                          <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                            YOUR CAMPUS
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                        <span>{c.studentsCount} coders</span>
                        <span>•</span>
                        <span className="text-slate-600 font-semibold truncate">Lead: {c.topCoder}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <div className="text-xs font-black text-slate-900">{c.averageScore}</div>
                    <div className="text-[9px] text-slate-400 uppercase font-semibold">Avg Rating</div>
                  </div>
                </div>

                {/* Relative Power Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden mt-2">
                  <div
                    style={{ width: `${barWidth}%` }}
                    className={`h-full rounded-full ${
                      isBvrit
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-slate-100 mt-3 text-center">
        <button
          onClick={onViewAllColleges}
          className="text-xs font-black text-blue-700 hover:text-blue-800 flex items-center justify-center gap-1 w-full cursor-pointer py-1 transition-colors"
        >
          <span>Explore All 200+ Engineering Campuses</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
