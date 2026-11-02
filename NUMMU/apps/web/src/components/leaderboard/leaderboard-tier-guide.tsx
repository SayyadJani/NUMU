'use client';

import { ShieldCheck, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import type { CompetitiveTier } from '@/data/leaderboard-data';

interface LeaderboardTierGuideProps {
  currentTier?: CompetitiveTier;
}

export function LeaderboardTierGuide({ currentTier = 'Knight' }: LeaderboardTierGuideProps) {
  const ladderTiers: {
    name: CompetitiveTier;
    range: string;
    description: string;
    perk: string;
    gemColor: string;
    textColor: string;
    bgAccent: string;
  }[] = [
    {
      name: 'Legend',
      range: '1,900+ Rating',
      description: 'Top 1% Global Elite Coders. Masters of NP-hard approximations & graph flows.',
      perk: 'Direct Interview Referrals & Legend Hall Tag',
      gemColor: 'from-purple-500 to-indigo-600',
      textColor: 'text-purple-600',
      bgAccent: 'bg-purple-500/10 border-purple-500/30',
    },
    {
      name: 'Guardian',
      range: '1,600 – 1,899 Rating',
      description: 'High-speed problem solvers fluent in Tree DP, Segment Trees, and Math.',
      perk: 'Weekly Grand Prix Access',
      gemColor: 'from-rose-500 to-orange-500',
      textColor: 'text-rose-600',
      bgAccent: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      name: 'Knight',
      range: '1,400 – 1,599 Rating',
      description: 'Strong competitive pattern recognition across DP, Graphs, and Greedy.',
      perk: 'Contest Sprints & Batch Leaderboard',
      gemColor: 'from-amber-400 to-emerald-500',
      textColor: 'text-amber-600',
      bgAccent: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      name: 'Specialist',
      range: '1,200 – 1,399 Rating',
      description: 'Intermediate problem solvers with solid Binary Search and 2-Pointer foundations.',
      perk: 'Curated Daily Challenges',
      gemColor: 'from-sky-400 to-blue-500',
      textColor: 'text-sky-600',
      bgAccent: 'bg-sky-500/10 border-sky-500/30',
    },
    {
      name: 'Pupil',
      range: '< 1,200 Rating',
      description: 'Foundational algorithmic apprentices building fundamental problem solving instincts.',
      perk: 'Beginner Bootcamps & Hints',
      gemColor: 'from-slate-400 to-slate-500',
      textColor: 'text-slate-600',
      bgAccent: 'bg-slate-500/10 border-slate-500/20',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shadow-2xs">
            <Award className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 leading-none">
              Competitive Division Ladder
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Rating tiers &amp; progression rewards</p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-full">
          Elo Ladder
        </span>
      </div>

      {/* Visual Progression Ladder */}
      <div className="relative space-y-2.5 before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-amber-400 before:to-slate-300">
        {ladderTiers.map((tier) => {
          const isCurrent = tier.name === currentTier;
          return (
            <div
              key={tier.name}
              className={`relative pl-8 p-3 rounded-2xl border transition-all duration-200 ${
                isCurrent
                  ? 'bg-gradient-to-r from-emerald-50/90 to-emerald-50/40 border-emerald-500/50 shadow-xs'
                  : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
              }`}
            >
              {/* Connector Gem Pin */}
              <div
                className={`absolute left-2.5 top-4 w-3.5 h-3.5 -translate-x-1/2 rounded-full bg-gradient-to-br ${tier.gemColor} ring-4 ring-white shadow-2xs`}
              />

              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-black ${tier.textColor}`}>
                    {tier.name}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                    {tier.range}
                  </span>
                </div>

                {isCurrent && (
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    <span>Your Tier</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed mb-1.5">
                {tier.description}
              </p>

              <div className="text-[10px] font-semibold text-slate-700 bg-white/80 px-2 py-1 rounded-lg border border-slate-200/60 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">{tier.perk}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Official contest ratings update live after each algorithm sprint.</span>
      </div>
    </div>
  );
}
