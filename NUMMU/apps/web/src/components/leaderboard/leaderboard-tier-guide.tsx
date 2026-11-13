'use client';

import { Award, CheckCircle2, Sparkles } from 'lucide-react';
import type { CompetitiveTier } from '@/data/leaderboard-data';

interface LeaderboardTierGuideProps {
  currentTier?: CompetitiveTier;
}

const ladderTiers: {
  name: CompetitiveTier;
  range: string;
  description: string;
  perk: string;
  dotBorderColor: string;
  dotBgColor: string;
  nameColor: string;
}[] = [
  {
    name: 'Legend',
    range: '1,900+ Rating',
    description: 'Top 1% Global Elite Coders. Masters of NP-hard approximations & graph flows.',
    perk: 'Direct Interview Referrals & Legend Hall Tag',
    dotBorderColor: '#a855f7',
    dotBgColor: '#ffffff',
    nameColor: '#a855f7',
  },
  {
    name: 'Guardian',
    range: '1,600 – 1,899 Rating',
    description: 'High-speed problem solvers fluent in Tree DP, Segment Trees, and Math.',
    perk: 'Weekly Grand Prix Access',
    dotBorderColor: '#ef4444',
    dotBgColor: '#ffffff',
    nameColor: '#ef4444',
  },
  {
    name: 'Knight',
    range: '1,400 – 1,599 Rating',
    description: 'Strong competitive pattern recognition across DP, Graphs, and Greedy.',
    perk: 'Contest Sprints & Batch Leaderboard',
    dotBorderColor: '#22c55e',
    dotBgColor: '#ffffff',
    nameColor: '#eab308',
  },
  {
    name: 'Specialist',
    range: '1,200 – 1,399 Rating',
    description: 'Intermediate problem solvers with solid Binary Search and 2-Pointer foundations.',
    perk: 'Curated Daily Challenges',
    dotBorderColor: '#3b82f6',
    dotBgColor: '#ffffff',
    nameColor: '#38bdf8',
  },
  {
    name: 'Pupil',
    range: '< 1,200 Rating',
    description: 'Foundational algorithmic apprentices building fundamental problem solving instincts.',
    perk: 'Beginner Bootcamps & Hints',
    dotBorderColor: '#64748b',
    dotBgColor: '#ffffff',
    nameColor: '#94a3b8',
  },
];

export function LeaderboardTierGuide({ currentTier = 'Knight' }: LeaderboardTierGuideProps) {
  return (
    <div
      className="rounded-3xl border p-5 shadow-2xl"
      style={{
        backgroundColor: '#0c1017',
        borderColor: 'rgba(34,197,94,0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
            style={{ backgroundColor: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            <Award className="w-4 h-4" style={{ color: '#c084fc' }} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white leading-none">
              Competitive Division Ladder
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Rating tiers &amp; progression rewards
            </p>
          </div>
        </div>

        <span
          className="text-[10px] font-mono font-black px-2.5 py-1 rounded-full shadow-xs"
          style={{
            color: '#c084fc',
            backgroundColor: 'rgba(168,85,247,0.15)',
            border: '1px solid rgba(168,85,247,0.35)',
          }}
        >
          Elo Ladder
        </span>
      </div>

      {/* Visual Progression Ladder */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div
          className="absolute"
          style={{
            left: '10px',
            top: '22px',
            bottom: '22px',
            width: '2px',
            backgroundColor: '#10b981',
            opacity: 0.5,
          }}
        />

        <div className="space-y-3.5">
          {ladderTiers.map((tier) => {
            const isCurrent = tier.name === currentTier;
            return (
              <div key={tier.name} className="relative flex items-start gap-3.5">
                {/* Concentric colored circular dot on vertical line */}
                <div
                  className="relative z-10 w-5 h-5 rounded-full shrink-0 mt-3 flex items-center justify-center shadow-md"
                  style={{
                    backgroundColor: tier.dotBorderColor,
                    boxShadow: `0 0 10px ${tier.dotBorderColor}60`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>

                {/* Tier card */}
                <div
                  className="flex-1 rounded-2xl p-3.5 transition-all"
                  style={{
                    backgroundColor: isCurrent ? 'rgba(16,185,129,0.06)' : '#131926',
                    border: isCurrent
                      ? '1px solid rgba(16,185,129,0.5)'
                      : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {/* Top row: name + range + YOUR TIER badge */}
                  <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-black tracking-tight"
                        style={{ color: tier.nameColor }}
                      >
                        {tier.name}
                      </span>
                      <span
                        className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ color: '#94a3b8', backgroundColor: 'rgba(255,255,255,0.05)' }}
                      >
                        {tier.range}
                      </span>
                    </div>

                    {isCurrent && (
                      <span
                        className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                        style={{
                          color: '#34d399',
                          border: '1px solid #10b981',
                          backgroundColor: 'rgba(16,185,129,0.12)',
                        }}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                        <span>YOUR TIER</span>
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    className="text-[11px] leading-relaxed mb-2.5 text-slate-300 font-medium"
                  >
                    {tier.description}
                  </p>

                  {/* Perk pill */}
                  <div
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{
                      backgroundColor: '#1a2336',
                      color: '#cbd5e1',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{tier.perk}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-4 pt-3 text-[10px] leading-relaxed text-slate-400"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        Official contest ratings update live after each algorithm sprint.
      </div>
    </div>
  );
}
