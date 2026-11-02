'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, CheckCircle2 } from 'lucide-react';

// ─── Data ─────────────────────────────────────────────────────────────────────
const PATTERN_GROUPS = [
  {
    category: 'Foundation',
    subtitle: 'Build core problem solving skills',
    color: 'border-emerald-500',
    patterns: [
      { name: 'Two Pointer', difficulty: 'Easy', problems: 42, pct: 78, color: 'bg-emerald-500', dot: 'bg-emerald-500' },
      { name: 'Sliding Window', difficulty: 'Medium', problems: 38, pct: 62, color: 'bg-emerald-500', dot: 'bg-amber-400' },
      { name: 'Prefix Sum', difficulty: 'Medium', problems: 40, pct: 48, color: 'bg-emerald-500', dot: 'bg-amber-400' },
    ],
  },
  {
    category: 'Data Structures',
    subtitle: 'Work with different data structures',
    color: 'border-blue-500',
    patterns: [
      { name: 'Hashing', difficulty: 'Easy', problems: 52, pct: 70, color: 'bg-emerald-500', dot: 'bg-emerald-500' },
      { name: 'Fast & Slow Pointer', difficulty: 'Medium', problems: 36, pct: 55, color: 'bg-emerald-500', dot: 'bg-amber-400' },
      { name: 'Binary Search', difficulty: 'Medium', problems: 48, pct: 66, color: 'bg-emerald-500', dot: 'bg-amber-400' },
    ],
  },
  {
    category: 'Advanced Techniques',
    subtitle: 'Tackle complex scenarios',
    color: 'border-orange-500',
    patterns: [
      { name: 'Monotonic Stack', difficulty: 'Hard', problems: 34, pct: 38, color: 'bg-red-500', dot: 'bg-red-500' },
      { name: 'Intervals', difficulty: 'Medium', problems: 42, pct: 52, color: 'bg-amber-500', dot: 'bg-amber-400' },
      { name: 'Greedy', difficulty: 'Medium', problems: 46, pct: 60, color: 'bg-emerald-500', dot: 'bg-amber-400' },
    ],
  },
  {
    category: 'Graph & DP',
    subtitle: 'Solve advanced problems',
    color: 'border-purple-500',
    patterns: [
      { name: 'Backtracking', difficulty: 'Hard', problems: 40, pct: 45, color: 'bg-red-500', dot: 'bg-red-500' },
      { name: 'DFS', difficulty: 'Medium', problems: 36, pct: 58, color: 'bg-emerald-500', dot: 'bg-amber-400' },
      { name: 'BFS', difficulty: 'Medium', problems: 34, pct: 62, color: 'bg-emerald-500', dot: 'bg-amber-400' },
      { name: 'Dynamic Programming', difficulty: 'Hard', problems: 68, pct: 36, color: 'bg-red-500', dot: 'bg-red-500' },
    ],
  },
];

const TIPS = [
  'Solve multiple problems per pattern',
  'Understand the underlying idea',
  'Learn to identify the pattern',
  'Practice mixed pattern problems',
  'Revise regularly',
];

const TABS = ['Pattern Map', 'All Patterns', 'Pattern Sheets', 'Practice Sets'];

const DIFF_BADGE: Record<string, string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  Medium: 'text-amber-600 bg-amber-50 border-amber-100',
  Hard: 'text-red-600 bg-red-50 border-red-100',
};

// ─── Donut ────────────────────────────────────────────────────────────────────
function Donut({ pct }: { pct: number }) {
  const r = 36; const circ = 2 * Math.PI * r;
  return (
    <svg width={88} height={88} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={44} cy={44} r={r} fill="none" stroke="#e2e8f0" strokeWidth={10} />
      <circle cx={44} cy={44} r={r} fill="none" stroke="#16a34a" strokeWidth={10}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PatternsPage() {
  const [activeTab, setActiveTab] = React.useState('Pattern Map');

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <Link href="/dashboard/dsa" className="hover:text-emerald-700 transition-colors">DSA</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 font-medium">Patterns</span>
          </div>

          {/* Page header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">DSA Patterns</h1>
              <p className="text-sm text-slate-500 mt-1">Recognize patterns. Solve faster. Build stronger intuition.</p>
            </div>
            <div className="hidden lg:flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4 max-w-xs shadow-sm">
              <div className="text-2xl">🔗</div>
              <div>
                <div className="text-xs font-bold text-slate-800">Patterns connect problems.</div>
                <div className="text-xs font-bold text-slate-800">Master the patterns, master DSA.</div>
                <div className="text-[10px] text-slate-400 mt-1">— NUMU</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 mb-5">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-2 text-sm font-semibold transition-all relative ${
                  activeTab === t
                    ? 'text-emerald-700'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t}
                {activeTab === t && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex gap-5">
            {/* Pattern Map — left */}
            <div className="flex-1 space-y-4 min-w-0">
              {PATTERN_GROUPS.map((group) => (
                <div key={group.category} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-1 h-12 rounded-full ${group.color.replace('border-', 'bg-')} shrink-0`} />
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{group.category}</div>
                      <div className="text-[11px] text-slate-400">{group.subtitle}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {group.patterns.map((p, i) => (
                      <div key={i} className="border border-slate-100 rounded-xl p-3 hover:border-emerald-200 hover:bg-emerald-50/40 transition-all cursor-pointer group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate pr-1">
                            {p.name}
                          </span>
                          <span className={`w-2 h-2 rounded-full shrink-0 ${p.dot}`} />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${DIFF_BADGE[p.difficulty]}`}>
                            {p.difficulty}
                          </span>
                          <span className="text-[9px] text-slate-400">{p.problems} problems</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                        </div>
                        <div className="text-[9px] text-slate-400 mt-1">{p.pct}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* CTA Banner */}
              <div className="bg-[#0f1f16] rounded-2xl p-5 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Not sure where to start?</div>
                    <div className="text-xs text-slate-400">Take a short assessment and get a personalized pattern learning path.</div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shrink-0 ml-4">
                  Get My Path <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right panel */}
            <div className="w-64 shrink-0 space-y-4">

              {/* Pattern Progress */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-3">Your Pattern Progress</div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <Donut pct={58} />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'none' }}>
                      <span className="text-lg font-extrabold text-slate-900">58%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-600">Completed</span>
                      <span className="font-bold text-slate-900 ml-auto">5</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="text-slate-600">In Progress</span>
                      <span className="font-bold text-slate-900 ml-auto">6</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-slate-200" />
                      <span className="text-slate-600">Not Started</span>
                      <span className="font-bold text-slate-900 ml-auto">2</span>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">13 Total Patterns</div>
                  </div>
                </div>
              </div>

              {/* Difficulty Distribution */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <div className="text-sm font-bold text-slate-800 mb-3">Difficulty Distribution</div>
                <div className="flex items-end gap-4 h-16">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-emerald-400 rounded-t-md" style={{ height: '40px' }} />
                    <span className="text-[9px] text-slate-400">Easy</span>
                    <span className="text-[9px] font-bold text-emerald-600">3</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-amber-400 rounded-t-md" style={{ height: '55px' }} />
                    <span className="text-[9px] text-slate-400">Medium</span>
                    <span className="text-[9px] font-bold text-amber-600">7</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-red-400 rounded-t-md" style={{ height: '25px' }} />
                    <span className="text-[9px] text-slate-400">Hard</span>
                    <span className="text-[9px] font-bold text-red-600">3</span>
                  </div>
                </div>
              </div>

              {/* Learning Tips */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">💡</span>
                  <span className="text-sm font-bold text-slate-800">Pattern Learning Tips</span>
                </div>
                <div className="space-y-2">
                  {TIPS.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-slate-600">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quote */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
                <div className="text-2xl text-emerald-200 font-serif leading-none mb-2">&ldquo;</div>
                <blockquote className="text-xs font-semibold text-slate-700 italic leading-relaxed">
                  A problem is just a story. The pattern is the genre.
                </blockquote>
                <div className="text-[10px] text-slate-400 mt-2">— NUMU</div>
              </div>
            </div>
          </div>
        </main>
  );
}
