'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Clock,
  GitBranch,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  Search,
  Filter,
  Code2,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  Check,
  Flame,
  Zap,
} from 'lucide-react';
import { progressService } from '@/services/progress.service';
import { dsaService } from '@/services/dsa.service';
import type { TopicProgressItem, ProblemListItem, TopicItem } from '@numu/types';

const TIPS = [
  'Solve all problems in each curriculum topic sequentially',
  'Understand the underlying time & space complexity',
  'Learn to identify the pattern from constraints',
  'Review official reference solutions after solving',
  'Take weekly proctored assessments to test retention',
];

interface TopicNodeData {
  id: string;
  name: string;
  slug: string;
  order: number;
  description: string;
  totalProblems: number;
  solvedProblems: number;
  percentage: number;
  problems: ProblemListItem[];
  tierIndex: number;
}

const TIER_DEFINITIONS = [
  {
    tier: 1,
    title: 'Tier 1: Core Foundations',
    subtitle: 'Array memory layout, hash lookups, and dual-pointer techniques',
    slugs: ['arrays', 'two-pointers'],
  },
  {
    tier: 2,
    title: 'Tier 2: Linear Data Structures',
    subtitle: 'String manipulation, sliding window slices, and linked memory chains',
    slugs: ['strings', 'linked-lists'],
  },
  {
    tier: 3,
    title: 'Tier 3: Abstract Memory Structures',
    subtitle: 'LIFO evaluation, FIFO queues, and monotonic stack heuristics',
    slugs: ['stacks-queues'],
  },
  {
    tier: 4,
    title: 'Tier 4: Hierarchies & Networks',
    subtitle: 'Tree recursion, binary search trees, BFS & DFS topological traversals',
    slugs: ['trees', 'graphs'],
  },
  {
    tier: 5,
    title: 'Tier 5: Advanced Optimization',
    subtitle: 'Subproblem memoization, state transition tables, and 1D/2D DP',
    slugs: ['dynamic-programming'],
  },
];

function Donut({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={88} height={88} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={44} cy={44} r={r} fill="none" stroke="var(--ring-track, #e2e8f0)" strokeWidth={10} />
      <circle
        cx={44}
        cy={44}
        r={r}
        fill="none"
        stroke="#16a34a"
        strokeWidth={10}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PatternsPage() {
  const [topicItems, setTopicItems] = useState<TopicItem[]>([]);
  const [progressTopics, setProgressTopics] = useState<TopicProgressItem[]>([]);
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const [attemptedSlugs, setAttemptedSlugs] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({ arrays: true });
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
  const [loading, setLoading] = useState(true);

  const toggleTopicAccordion = (slug: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      dsaService.getTopics(),
      progressService.getTopicProgress(),
      progressService.getSolvedProblems({ limit: 100 }),
      progressService.getSubmissionHistory({ limit: 50 }),
      dsaService.getProblems({ limit: 50 }),
    ]).then(([topicsRes, progressRes, solvedRes, subRes, probRes]) => {
      if (!isMounted) return;

      if (topicsRes.status === 'fulfilled' && topicsRes.value) {
        setTopicItems(topicsRes.value);
      }
      if (progressRes.status === 'fulfilled' && progressRes.value?.topics) {
        setProgressTopics(progressRes.value.topics);
      }
      if (solvedRes.status === 'fulfilled' && solvedRes.value?.items) {
        setSolvedSlugs(new Set(solvedRes.value.items.map((i) => i.slug)));
      }
      if (subRes.status === 'fulfilled' && subRes.value?.items) {
        setAttemptedSlugs(new Set(subRes.value.items.map((s) => s.problemSlug)));
      }
      if (probRes.status === 'fulfilled' && probRes.value?.items) {
        setProblems(probRes.value.items);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Merge baseline topic items with live progress
  const mergedTopics: TopicNodeData[] = useMemo(() => {
    const list = topicItems.length > 0 ? topicItems : [
      { id: '1', slug: 'arrays', name: 'Arrays & Hashing', description: 'Array manipulation and prefix logic', icon: 'brackets', order: 1, problemCount: 4, createdAt: '', updatedAt: '' },
      { id: '2', slug: 'strings', name: 'Strings', description: 'Pattern matching and string algorithms', icon: 'text', order: 2, problemCount: 2, createdAt: '', updatedAt: '' },
      { id: '3', slug: 'linked-lists', name: 'Linked Lists', description: 'Single, doubly and circular lists', icon: 'git-commit', order: 3, problemCount: 1, createdAt: '', updatedAt: '' },
      { id: '4', slug: 'stacks-queues', name: 'Stacks & Queues', description: 'LIFO and FIFO structures', icon: 'layers', order: 4, problemCount: 1, createdAt: '', updatedAt: '' },
      { id: '5', slug: 'trees', name: 'Trees', description: 'Hierarchical traversals and BST validation', icon: 'network', order: 5, problemCount: 1, createdAt: '', updatedAt: '' },
      { id: '6', slug: 'graphs', name: 'Graphs', description: 'BFS, DFS and shortest path algorithms', icon: 'share-2', order: 6, problemCount: 1, createdAt: '', updatedAt: '' },
      { id: '7', slug: 'dynamic-programming', name: 'Dynamic Programming', description: 'Memoization and tabulation', icon: 'cpu', order: 7, problemCount: 2, createdAt: '', updatedAt: '' },
      { id: '8', slug: 'two-pointers', name: 'Two Pointers', description: 'Opposite-end and sliding windows', icon: 'split', order: 8, problemCount: 4, createdAt: '', updatedAt: '' },
    ];

    const progressMap = new Map<string, TopicProgressItem>();
    progressTopics.forEach((t) => progressMap.set(t.slug, t));

    return list.map((t, index) => {
      const prog = progressMap.get(t.slug);
      const topicProblems = problems.filter((p) =>
        p.topics.some((pt) => pt.slug === t.slug),
      );

      const totalProbs = prog?.totalProblems ?? (topicProblems.length > 0 ? topicProblems.length : t.problemCount || 1);
      const solvedProbs = prog?.solvedProblems ?? topicProblems.filter((p) => solvedSlugs.has(p.slug)).length;
      const pct = totalProbs > 0 ? Math.min(100, Math.round((solvedProbs / totalProbs) * 100)) : 0;

      // Determine tier
      let tierIdx = 1;
      TIER_DEFINITIONS.forEach((def) => {
        if (def.slugs.includes(t.slug)) {
          tierIdx = def.tier;
        }
      });

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        order: t.order || index + 1,
        description: t.description || 'Core algorithmic pattern',
        totalProblems: totalProbs,
        solvedProblems: solvedProbs,
        percentage: pct,
        problems: topicProblems,
        tierIndex: tierIdx,
      };
    });
  }, [topicItems, progressTopics, problems, solvedSlugs]);

  // Statistics computations
  const totalCurriculumProblems = useMemo(() => {
    return problems.length > 0 ? problems.length : mergedTopics.reduce((acc, t) => acc + t.totalProblems, 0);
  }, [problems, mergedTopics]);

  const totalCurriculumSolved = solvedSlugs.size;
  const completedTopics = mergedTopics.filter((t) => t.totalProblems > 0 && t.solvedProblems >= t.totalProblems).length;
  const inProgressTopics = mergedTopics.filter((t) => t.solvedProblems > 0 && t.solvedProblems < t.totalProblems).length;
  const notStartedTopics = Math.max(0, mergedTopics.length - completedTopics - inProgressTopics);
  const overallPct = totalCurriculumProblems > 0 ? Math.min(100, Math.round((totalCurriculumSolved / totalCurriculumProblems) * 100)) : 0;

  const easyTotal = problems.filter((p) => p.difficulty === 'EASY').length || 4;
  const mediumTotal = problems.filter((p) => p.difficulty === 'MEDIUM').length || 8;
  const hardTotal = problems.filter((p) => p.difficulty === 'HARD').length || 2;

  // Next recommended problem to continue roadmap
  const nextProblemToSolve = useMemo(() => {
    for (const topic of mergedTopics) {
      for (const p of topic.problems) {
        if (!solvedSlugs.has(p.slug)) {
          return { problem: p, topicName: topic.name };
        }
      }
    }
    return null;
  }, [mergedTopics, solvedSlugs]);

  // Group topics by tier
  const tiersWithTopics = useMemo(() => {
    return TIER_DEFINITIONS.map((def) => {
      const tierTopics = mergedTopics.filter((t) => def.slugs.includes(t.slug));
      return {
        ...def,
        topics: tierTopics,
      };
    });
  }, [mergedTopics]);

  const renderTopicTreeNode = (topic: TopicNodeData) => {
    const isExpanded = Boolean(expandedTopics[topic.slug]);
    const isComplete = topic.totalProblems > 0 && topic.solvedProblems >= topic.totalProblems;
    const isStarted = topic.solvedProblems > 0;

    const filteredProblems = topic.problems.filter((p) => {
      if (difficultyFilter !== 'ALL' && p.difficulty !== difficultyFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.title.toLowerCase().includes(q) || topic.name.toLowerCase().includes(q);
      }
      return true;
    });

    return (
      <div
        key={topic.id}
        className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white shadow-xs hover:shadow-md ${
          isComplete
            ? 'border-emerald-400 ring-2 ring-emerald-400/20'
            : isStarted
            ? 'border-amber-400 ring-2 ring-amber-400/20'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Node Header */}
        <div
          onClick={() => toggleTopicAccordion(topic.slug)}
          className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/80 transition-colors"
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-mono font-black text-sm shadow-xs ${
                isComplete
                  ? 'bg-emerald-600 text-white'
                  : isStarted
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {isComplete ? '✓' : topic.order}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                  {topic.name}
                </h3>
                {isComplete ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Mastered
                  </span>
                ) : isStarted ? (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                    In Progress
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {topic.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className="text-xs font-black text-slate-800 tabular-nums">
                {topic.solvedProblems}/{topic.totalProblems}
              </div>
              <div className="text-[10px] font-bold text-slate-400">
                {topic.percentage}%
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center transition-transform ${
                isExpanded ? 'rotate-180 text-emerald-700' : 'text-slate-400'
              }`}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full h-1 bg-slate-100">
          <div
            className={`h-full transition-all duration-500 ${
              isComplete ? 'bg-emerald-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${topic.percentage}%` }}
          />
        </div>

        {/* Problems list drawer */}
        {isExpanded && (
          <div className="p-3 sm:p-4 bg-slate-50/70 border-t border-slate-100 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1 flex items-center justify-between">
              <span>Curriculum Problems ({filteredProblems.length})</span>
              <span className="text-emerald-700 font-semibold">{topic.solvedProblems} Solved</span>
            </div>

            {filteredProblems.length > 0 ? (
              filteredProblems.map((p) => {
                const isSolved = solvedSlugs.has(p.slug);
                const isAttempted = !isSolved && attemptedSlugs.has(p.slug);

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200/80 hover:border-emerald-300 transition-colors shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isSolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : isAttempted ? (
                        <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                      )}
                      <Link
                        href={`/dashboard/dsa/problems/${p.slug}` as React.ComponentProps<typeof Link>['href']}
                        className="text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 transition-colors truncate"
                      >
                        {p.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          p.difficulty === 'EASY'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                            : p.difficulty === 'MEDIUM'
                            ? 'text-amber-700 bg-amber-50 border-amber-200'
                            : 'text-rose-700 bg-rose-50 border-rose-200'
                        }`}
                      >
                        {p.difficulty}
                      </span>

                      <Link
                        href={`/dashboard/dsa/problems/${p.slug}` as React.ComponentProps<typeof Link>['href']}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          isSolved
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-[#0b5c39] text-white hover:bg-[#08482c]'
                        }`}
                      >
                        {isSolved ? 'Review' : 'Solve →'}
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-3 text-center text-xs text-slate-400">
                No problems match current filters.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
        <Link href="/dashboard/dsa" className="hover:text-emerald-700 transition-colors">
          DSA
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 font-medium">Curriculum Roadmap Tree</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Interactive Tree Syllabus
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">8 Mastery Tiers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            DSA Skill Tree & Curriculum Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Navigate through foundational patterns to advanced dynamic programming with visual progression paths and real-time Judge0 test execution tracking.
          </p>
        </div>

        {/* Next problem CTA pill */}
        {nextProblemToSolve && (
          <Link
            href={`/dashboard/dsa/problems/${nextProblemToSolve.problem.slug}` as React.ComponentProps<typeof Link>['href']}
            className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-[#0b5c39] hover:from-emerald-700 hover:to-[#08482c] text-white p-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
                Continue Learning Tree
              </div>
              <div className="text-xs sm:text-sm font-black text-white">
                {nextProblemToSolve.problem.title}
              </div>
            </div>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        )}
      </div>

      {/* View Switcher & Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-2.5 sm:px-4 mb-6 shadow-xs">
        {/* Toggle Mode */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'tree'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Interactive Tree</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Curriculum List</span>
          </button>
        </div>

        {/* Search & Difficulty Filter */}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topic or problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as any)}
            className="text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 cursor-pointer"
          >
            <option value="ALL">All Levels</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Main Layout: Tree / Roadmap on Left + Analytics on Right */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Left Column: Visual Roadmap / Tree */}
        <div className="flex-1 min-w-0">
          {viewMode === 'tree' ? (
            /* ════════════════════════════════════════════════════════
               GENUINE BRANCHING SVG SKILL TREE
               ════════════════════════════════════════════════════════ */
            <div className="bg-slate-50/60 rounded-3xl border border-slate-200/90 p-4 sm:p-8 relative overflow-hidden shadow-xs">
              {/* Subtle background grid pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#94a3b830_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

              {/* ── Tier 0: Root Skill Apex ── */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-900/10 border border-slate-700">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    🌱
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Roadmap Origin</div>
                    <div className="text-xs font-black text-white">DSA Algorithmic Core</div>
                  </div>
                </div>
              </div>

              {/* Connector: Root -> Tier 1 (Diverging Branch) */}
              <div className="w-full h-12 flex justify-center items-center relative my-1">
                <svg className="w-full max-w-2xl h-12 overflow-visible" viewBox="0 0 600 48" preserveAspectRatio="none">
                  <path
                    d="M 300 0 C 300 24, 150 24, 150 48"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <path
                    d="M 300 0 C 300 24, 450 24, 450 48"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <circle cx="300" cy="0" r="4" fill="#10b981" />
                  <circle cx="150" cy="48" r="4" fill="#10b981" />
                  <circle cx="450" cy="48" r="4" fill="#10b981" />
                </svg>
              </div>

              {/* ── Tier 1: Core Foundations (Arrays & Two Pointers) ── */}
              <div className="relative z-10 max-w-3xl mx-auto">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Tier 1 • Linear Memory &amp; Dual Pointers
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                  {['arrays', 'two-pointers'].map((slug) => {
                    const topic = mergedTopics.find((t) => t.slug === slug);
                    if (!topic) return null;
                    return renderTopicTreeNode(topic);
                  })}
                </div>
              </div>

              {/* Connector: Tier 1 -> Tier 2 (Direct Parallel Columns) */}
              <div className="w-full h-12 flex justify-center items-center relative my-1">
                <svg className="w-full max-w-2xl h-12 overflow-visible" viewBox="0 0 600 48" preserveAspectRatio="none">
                  <path
                    d="M 150 0 L 150 48"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <path
                    d="M 450 0 L 450 48"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <circle cx="150" cy="48" r="4" fill="#10b981" />
                  <circle cx="450" cy="48" r="4" fill="#10b981" />
                </svg>
              </div>

              {/* ── Tier 2: Linear Data Structures (Strings & Linked Lists) ── */}
              <div className="relative z-10 max-w-3xl mx-auto">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Tier 2 • String Slices &amp; Pointer Chains
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                  {['strings', 'linked-lists'].map((slug) => {
                    const topic = mergedTopics.find((t) => t.slug === slug);
                    if (!topic) return null;
                    return renderTopicTreeNode(topic);
                  })}
                </div>
              </div>

              {/* Connector: Tier 2 -> Tier 3 (Converging to Center Node) */}
              <div className="w-full h-12 flex justify-center items-center relative my-1">
                <svg className="w-full max-w-2xl h-12 overflow-visible" viewBox="0 0 600 48" preserveAspectRatio="none">
                  <path
                    d="M 150 0 C 150 24, 300 24, 300 48"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <path
                    d="M 450 0 C 450 24, 300 24, 300 48"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <circle cx="300" cy="48" r="4" fill="#10b981" />
                </svg>
              </div>

              {/* ── Tier 3: Abstract Memory (Stacks & Queues) ── */}
              <div className="relative z-10 max-w-md mx-auto">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Tier 3 • LIFO / FIFO Monotonic Bridges
                  </span>
                </div>
                {['stacks-queues'].map((slug) => {
                  const topic = mergedTopics.find((t) => t.slug === slug);
                  if (!topic) return null;
                  return renderTopicTreeNode(topic);
                })}
              </div>

              {/* Connector: Tier 3 -> Tier 4 (Diverging Branch to Non-Linear Trees & Graphs) */}
              <div className="w-full h-12 flex justify-center items-center relative my-1">
                <svg className="w-full max-w-2xl h-12 overflow-visible" viewBox="0 0 600 48" preserveAspectRatio="none">
                  <path
                    d="M 300 0 C 300 24, 150 24, 150 48"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <path
                    d="M 300 0 C 300 24, 450 24, 450 48"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <circle cx="150" cy="48" r="4" fill="#3b82f6" />
                  <circle cx="450" cy="48" r="4" fill="#3b82f6" />
                </svg>
              </div>

              {/* ── Tier 4: Hierarchies & Networks (Trees & Graphs) ── */}
              <div className="relative z-10 max-w-3xl mx-auto">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Tier 4 • Hierarchical Recursion &amp; Networks
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
                  {['trees', 'graphs'].map((slug) => {
                    const topic = mergedTopics.find((t) => t.slug === slug);
                    if (!topic) return null;
                    return renderTopicTreeNode(topic);
                  })}
                </div>
              </div>

              {/* Connector: Tier 4 -> Tier 5 (Converging to Apex DP) */}
              <div className="w-full h-12 flex justify-center items-center relative my-1">
                <svg className="w-full max-w-2xl h-12 overflow-visible" viewBox="0 0 600 48" preserveAspectRatio="none">
                  <path
                    d="M 150 0 C 150 24, 300 24, 300 48"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <path
                    d="M 450 0 C 450 24, 300 24, 300 48"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    className="opacity-80"
                  />
                  <circle cx="300" cy="48" r="4" fill="#8b5cf6" />
                </svg>
              </div>

              {/* ── Tier 5: Advanced Optimization (Dynamic Programming) ── */}
              <div className="relative z-10 max-w-md mx-auto">
                <div className="text-center mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                    Tier 5 • Memoization &amp; State Tabulation
                  </span>
                </div>
                {['dynamic-programming'].map((slug) => {
                  const topic = mergedTopics.find((t) => t.slug === slug);
                  if (!topic) return null;
                  return renderTopicTreeNode(topic);
                })}
              </div>

            </div>
          ) : (
            /* ════════════════════════════════════════════════════════
               CURRICULUM LIST VIEW
               ════════════════════════════════════════════════════════ */
            <div className="space-y-3">
              {mergedTopics.map((topic) => {
                const isExpanded = Boolean(expandedTopics[topic.slug]);
                const isComplete = topic.totalProblems > 0 && topic.solvedProblems >= topic.totalProblems;

                return (
                  <div
                    key={topic.id}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleTopicAccordion(topic.slug)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer group select-none hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <ChevronRight
                          className={`w-4 h-4 shrink-0 transition-transform ${
                            isExpanded ? 'rotate-90 text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                          {topic.name}
                        </span>
                        {isComplete && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Completed ✓
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="w-24 sm:w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${topic.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-slate-600 font-mono">
                          {topic.solvedProblems} / {topic.totalProblems}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 p-4 divide-y divide-slate-100">
                        {topic.problems.map((p, idx) => {
                          const isSolved = solvedSlugs.has(p.slug);
                          return (
                            <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-xs font-semibold text-slate-400 w-4 text-right">
                                  {idx + 1}.
                                </span>
                                <Link
                                  href={`/dashboard/dsa/problems/${p.slug}` as React.ComponentProps<typeof Link>['href']}
                                  className="text-xs sm:text-sm font-bold text-slate-800 hover:text-emerald-700 truncate"
                                >
                                  {p.title}
                                </Link>
                              </div>
                              <Link
                                href={`/dashboard/dsa/problems/${p.slug}` as React.ComponentProps<typeof Link>['href']}
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              >
                                {isSolved ? 'Review' : 'Solve'}
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel: Analytics, Difficulty & Tips */}
        <div className="w-full xl:w-72 shrink-0 space-y-4">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="text-sm font-bold text-slate-900 mb-4">Your Curriculum Progress</div>
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <Donut pct={overallPct} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-black text-slate-900">{overallPct}%</span>
                </div>
              </div>
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mastered:</span>
                  <span className="font-bold text-emerald-700">{completedTopics}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">In Progress:</span>
                  <span className="font-bold text-amber-600">{inProgressTopics}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Not Started:</span>
                  <span className="font-bold text-slate-400">{notStartedTopics}</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] font-semibold text-slate-500 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span>Total Problems:</span>
              <span className="font-bold text-slate-800">{totalCurriculumSolved} / {totalCurriculumProblems}</span>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="text-sm font-bold text-slate-900 mb-4">Curriculum Difficulty</div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="text-[10px] uppercase font-bold text-emerald-800">Easy</div>
                <div className="text-base font-black text-emerald-700 mt-0.5">{easyTotal}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                <div className="text-[10px] uppercase font-bold text-amber-800">Medium</div>
                <div className="text-base font-black text-amber-700 mt-0.5">{mediumTotal}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                <div className="text-[10px] uppercase font-bold text-rose-800">Hard</div>
                <div className="text-base font-black text-rose-700 mt-0.5">{hardTotal}</div>
              </div>
            </div>
          </div>

          {/* Curriculum Study Tips */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">💡</span>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Curriculum Study Tips
              </h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              {TIPS.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </main>
  );
}
