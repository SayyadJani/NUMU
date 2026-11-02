'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronRight,
  Map,
  CheckCircle2,
  Clock,
  Flame,
  BookOpen,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Zap,
  Trophy,
  Target,
  TrendingUp,
  Code2,
  Brain,
  Award,
  Sparkles,
} from 'lucide-react';
import { progressService } from '@/services/progress.service';
import { dsaService } from '@/services/dsa.service';
import { gamificationService } from '@/services/gamification.service';
import type {
  ProgressOverviewDto,
  TopicProgressSummary,
  ActivitySummaryDto,
  SolvedProblemItemDto,
  ProblemListItem,
  Difficulty as ApiDifficulty,
} from '@numu/types';

// ─── Helpers & Types ──────────────────────────────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

function normalizeDifficulty(diff?: string): Difficulty {
  if (!diff) return 'Easy';
  const lower = diff.toLowerCase();
  if (lower === 'hard') return 'Hard';
  if (lower === 'medium') return 'Medium';
  return 'Easy';
}

const DIFF_STYLES: Record<Difficulty, string> = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  Hard: 'text-red-700 bg-red-50 border-red-200',
};

function DiffBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${DIFF_STYLES[difficulty]}`}>
      {difficulty}
    </span>
  );
}

const TOPIC_METADATA: Record<string, { icon: string; color: string }> = {
  arrays: { icon: '▦', color: 'bg-blue-50 border-blue-100 text-blue-600' },
  strings: { icon: 'T', color: 'bg-purple-50 border-purple-100 text-purple-600' },
  'linked-lists': { icon: '⛓', color: 'bg-pink-50 border-pink-100 text-pink-600' },
  'stacks-queues': { icon: '⊞', color: 'bg-orange-50 border-orange-100 text-orange-600' },
  trees: { icon: '🌲', color: 'bg-green-50 border-green-100 text-green-700' },
  graphs: { icon: '⬡', color: 'bg-teal-50 border-teal-100 text-teal-600' },
  'dynamic-programming': { icon: '⚡', color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
  'two-pointers': { icon: '◈', color: 'bg-rose-50 border-rose-100 text-rose-600' },
};

function formatSolvedDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (isToday) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

// ─── Heatmap ──────────────────────────────────────────────────────────────────

const LEVEL_CLASSES = [
  'bg-slate-100',
  'bg-emerald-100',
  'bg-emerald-300',
  'bg-emerald-500',
  'bg-emerald-700',
];

interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

function ConsistencyHeatmap({ days }: { days: HeatmapDay[] }) {
  return (
    <div className="space-y-1">
      <div className="flex gap-1 flex-wrap">
        {days.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.count} activities`}
            className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 cursor-default ${LEVEL_CLASSES[day.level] || LEVEL_CLASSES[0]}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[9px] text-slate-400">Less</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
        ))}
        <span className="text-[9px] text-slate-400">More</span>
      </div>
    </div>
  );
}

// ─── Donut chart (SVG) for solved breakdown ───────────────────────────────────

function SolvedDonut({
  total,
  easy,
  medium,
  hard,
}: {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const safeTotal = total > 0 ? total : 1;

  const easFrac = easy / safeTotal;
  const medFrac = medium / safeTotal;
  const hardFrac = hard / safeTotal;

  const easyLen = total > 0 ? circ * easFrac : 0;
  const medLen = total > 0 ? circ * medFrac : 0;
  const hardLen = total > 0 ? circ * hardFrac : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16 shrink-0">
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          {/* Easy */}
          {easyLen > 0 && (
            <circle
              cx="36"
              cy="36"
              r={r}
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeDasharray={`${easyLen} ${circ - easyLen}`}
              strokeDashoffset="0"
              strokeLinecap="butt"
            />
          )}
          {/* Medium */}
          {medLen > 0 && (
            <circle
              cx="36"
              cy="36"
              r={r}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="8"
              strokeDasharray={`${medLen} ${circ - medLen}`}
              strokeDashoffset={-easyLen}
              strokeLinecap="butt"
            />
          )}
          {/* Hard */}
          {hardLen > 0 && (
            <circle
              cx="36"
              cy="36"
              r={r}
              fill="none"
              stroke="#ef4444"
              strokeWidth="8"
              strokeDasharray={`${hardLen} ${circ - hardLen}`}
              strokeDashoffset={-(easyLen + medLen)}
              strokeLinecap="butt"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-extrabold text-slate-900 leading-none">{total}</span>
          <span className="text-[8px] text-slate-400 leading-none mt-0.5">solved</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
          <span className="text-[10px] text-slate-500">Easy</span>
          <span className="text-[10px] font-bold text-slate-900 ml-auto pl-2">{easy}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
          <span className="text-[10px] text-slate-500">Medium</span>
          <span className="text-[10px] font-bold text-slate-900 ml-auto pl-2">{medium}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block shrink-0" />
          <span className="text-[10px] text-slate-500">Hard</span>
          <span className="text-[10px] font-bold text-slate-900 ml-auto pl-2">{hard}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DsaPage() {
  const [overview, setOverview] = useState<ProgressOverviewDto | null>(null);
  const [topicProgress, setTopicProgress] = useState<TopicProgressSummary | null>(null);
  const [solvedList, setSolvedList] = useState<SolvedProblemItemDto[]>([]);
  const [activity, setActivity] = useState<ActivitySummaryDto | null>(null);
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [gamificationStreak, setGamificationStreak] = useState<number>(0);

  const [topicPage, setTopicPage] = useState(0);
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  // Load live data from backend services with parallelized batching
  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      progressService.getOverview(),
      progressService.getTopicProgress(),
      progressService.getSolvedProblems({ limit: 10 }),
      progressService.getActivity(),
      dsaService.getProblems({ limit: 20 }),
      gamificationService.getSummary(),
    ]).then(([resOverview, resTopic, resSolved, resActivity, resProblems, resGamification]) => {
      if (!mounted) return;

      if (resOverview.status === 'fulfilled' && resOverview.value) {
        setOverview(resOverview.value);
      }
      if (resTopic.status === 'fulfilled' && resTopic.value) {
        setTopicProgress(resTopic.value);
      }
      if (resSolved.status === 'fulfilled' && resSolved.value?.items) {
        setSolvedList(resSolved.value.items);
      }
      if (resActivity.status === 'fulfilled' && resActivity.value) {
        setActivity(resActivity.value);
      }
      if (resProblems.status === 'fulfilled' && resProblems.value?.items) {
        setProblems(resProblems.value.items);
      }
      if (resGamification.status === 'fulfilled' && resGamification.value?.streak?.current !== undefined) {
        setGamificationStreak(resGamification.value.streak.current);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Compute Solved Slugs for quick lookup
  const solvedSlugs = useMemo(() => {
    return new Set(solvedList.map((p) => p.slug));
  }, [solvedList]);

  // Derived Metrics
  const totalSolved = overview?.totalProblemsSolved ?? solvedList.length;
  const totalAvailable = overview?.totalAvailable.total ?? (problems.length > 0 ? problems.length : 7);
  const easyCount = overview?.difficulty.easy ?? 0;
  const medCount = overview?.difficulty.medium ?? 0;
  const hardCount = overview?.difficulty.hard ?? 0;
  const progressPct = totalAvailable > 0 ? Math.min(100, Math.round((totalSolved / totalAvailable) * 100)) : 0;

  // Streak: use gamification or activity or fallback
  const streakDays = gamificationStreak || activity?.currentStreak || 0;
  const daysActive = activity?.activeDays || (streakDays > 0 ? streakDays : 1);

  // Active Topic for "Continue Learning"
  const activeTopic = useMemo(() => {
    if (!topicProgress?.topics || topicProgress.topics.length === 0) {
      return {
        name: 'Arrays',
        slug: 'arrays',
        totalProblems: 3,
        solvedProblems: 1,
        percentage: 33,
      };
    }
    return (
      topicProgress.topics.find((t) => t.solvedProblems < t.totalProblems && t.solvedProblems > 0) ||
      topicProgress.topics.find((t) => t.solvedProblems < t.totalProblems) ||
      topicProgress.topics[0]!
    );
  }, [topicProgress]);

  // Next problem in active topic or global
  const nextProblem = useMemo(() => {
    if (problems.length === 0) {
      return {
        slug: 'valid-parentheses',
        title: 'Valid Parentheses',
        difficulty: 'EASY' as ApiDifficulty,
      };
    }
    const matchingUnsolved = problems.find(
      (p) =>
        !solvedSlugs.has(p.slug) &&
        (p.topics?.some((t) => t.slug === activeTopic.slug) || p.primaryTopic?.slug === activeTopic.slug)
    );
    if (matchingUnsolved) return matchingUnsolved;
    const anyUnsolved = problems.find((p) => !solvedSlugs.has(p.slug));
    return anyUnsolved || problems[0]!;
  }, [problems, solvedSlugs, activeTopic]);

  // Featured Daily Challenge Problem (prefer a medium/easy problem)
  const dailyChallengeProblem = useMemo(() => {
    if (problems.length === 0) {
      return {
        slug: 'container-with-most-water',
        title: 'Container With Most Water',
        difficulty: 'MEDIUM' as ApiDifficulty,
        topics: [{ slug: 'two-pointers', name: 'Two Pointers' }],
      };
    }
    const mediumProblem = problems.find((p) => p.difficulty === 'MEDIUM') || problems[0]!;
    return mediumProblem;
  }, [problems]);

  // XP for daily challenge based on Phase 6B policy
  const dailyChallengeXp = dailyChallengeProblem.difficulty === 'HARD' ? 30 : dailyChallengeProblem.difficulty === 'MEDIUM' ? 20 : 10;

  // Heatmap generation (21 days)
  const heatmapDays = useMemo<HeatmapDay[]>(() => {
    const cells: HeatmapDay[] = [];
    const now = new Date();
    const activityMap: Record<string, number> = {};

    if (activity?.dailyActivity) {
      for (const d of activity.dailyActivity) {
        activityMap[d.date] = d.submissionCount || d.uniqueSolvedCount || 1;
      }
    }

    for (let i = 20; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]!;
      const count = activityMap[dateStr] ?? (i === 0 && streakDays > 0 ? 2 : i === 1 && streakDays > 1 ? 1 : 0);
      let level = 0;
      if (count >= 5) level = 4;
      else if (count >= 3) level = 3;
      else if (count >= 2) level = 2;
      else if (count >= 1) level = 1;

      cells.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
        level,
      });
    }
    return cells;
  }, [activity, streakDays]);

  const submissionsThisWeek = useMemo(() => {
    return heatmapDays.slice(-7).reduce((acc, curr) => acc + curr.count, 0) || (streakDays > 0 ? streakDays : 1);
  }, [heatmapDays, streakDays]);

  // Weak Topics (lowest percentage)
  const weakTopics = useMemo(() => {
    if (!topicProgress?.topics || topicProgress.topics.length === 0) {
      return [
        { rank: 1, label: 'Dynamic Programming', pct: 0, barColor: 'bg-red-400' },
        { rank: 2, label: 'Trees', pct: 0, barColor: 'bg-orange-400' },
        { rank: 3, label: 'Stacks & Queues', pct: 0, barColor: 'bg-orange-400' },
        { rank: 4, label: 'Two Pointers', pct: 33, barColor: 'bg-amber-400' },
        { rank: 5, label: 'Arrays', pct: 67, barColor: 'bg-emerald-400' },
      ];
    }
    const sorted = [...topicProgress.topics].sort((a, b) => a.percentage - b.percentage);
    return sorted.slice(0, 5).map((t, idx) => {
      let barColor = 'bg-red-400';
      if (t.percentage >= 60) barColor = 'bg-emerald-400';
      else if (t.percentage >= 30) barColor = 'bg-amber-400';
      else if (t.percentage > 0) barColor = 'bg-orange-400';
      return {
        rank: idx + 1,
        label: t.name,
        pct: t.percentage,
        barColor,
      };
    });
  }, [topicProgress]);

  // Today's practice problems (top 5 from catalog)
  const practiceProblems = useMemo(() => {
    return problems.slice(0, 5);
  }, [problems]);

  // Explore Topics pagination
  const topicsList = useMemo(() => {
    if (!topicProgress?.topics || topicProgress.topics.length === 0) {
      return Object.entries(TOPIC_METADATA).map(([slug, meta]) => ({
        slug,
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        totalProblems: 2,
        solvedProblems: 0,
        percentage: 0,
        icon: meta.icon,
        color: meta.color,
      }));
    }
    return topicProgress.topics.map((t) => {
      const meta = TOPIC_METADATA[t.slug] || {
        icon: '⚡',
        color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
      };
      return {
        ...t,
        icon: meta.icon,
        color: meta.color,
      };
    });
  }, [topicProgress]);

  const topicsPerPage = 8;
  const totalPages = Math.ceil(topicsList.length / topicsPerPage);
  const visibleTopics = topicsList.slice(topicPage * topicsPerPage, (topicPage + 1) * topicsPerPage);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
    dsaService.toggleBookmark(id).catch(() => {});
  };

  return (
    <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      {/* ══ Row 1: Hero | Stats Panel | Consistency Heatmap ══════════════ */}
      <div className="grid grid-cols-12 gap-4">
        {/* ─ Hero Card (Upgraded Design Asset with Interactive Buttons & Overlay Copy) ── */}
        <div className="col-span-12 lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 group bg-slate-900 aspect-[2525/1457] flex items-center justify-center">
          <Image
            src="/assets/dsa-hero-card.png"
            alt="Master DSA, one pattern at a time"
            fill
            className="object-cover block select-none pointer-events-none"
            priority
          />

          {/* Text Copy & Re-styled Interactive Buttons */}
          <div className="absolute inset-0 p-5 sm:p-6 lg:p-7 flex flex-col justify-between z-10 w-[58%] sm:w-[55%]">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-[10px] sm:text-xs font-semibold tracking-wide w-fit shadow-xs">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Pattern-Based DSA</span>
              </div>

              <h2 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                Master DSA, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  One Pattern
                </span>{' '}
                at a Time
              </h2>

              <p className="text-[10px] sm:text-xs text-purple-100/80 leading-relaxed font-medium line-clamp-2 drop-shadow-xs max-w-[300px]">
                Curated problems, verified judge execution, and habit-building gamification.
              </p>
            </div>

            {/* Restyled Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-2.5 pt-1">
              <Link
                href="/dashboard/dsa/problems"
                className="group/btn flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:via-emerald-400 hover:to-teal-300 text-slate-950 text-[11px] sm:text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-950/40 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                <span>Start Practicing</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/dashboard/dsa/patterns"
                className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-xs border border-white/25 hover:border-white/40 backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              >
                <Map className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300" />
                <span>View Roadmap</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ─ Stats Panel ───────────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-3">
          {/* Problems Solved Donut */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Problems Solved</span>
              <span className="text-[10px] text-emerald-700 font-bold">
                {totalSolved}/{totalAvailable}
              </span>
            </div>
            <SolvedDonut total={totalSolved} easy={easyCount} medium={medCount} hard={hardCount} />
            <div className="mt-3 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-slate-400">Overall Progress</span>
              <span className="text-[9px] font-bold text-slate-700">{progressPct}%</span>
            </div>
          </div>

          {/* Current Topic + Streak */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex flex-col gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-[9px] text-slate-400">Current Topic</div>
              <div className="text-xs font-bold text-slate-900 truncate">{activeTopic.name}</div>
              <Link
                href={`/dashboard/dsa/problems?topic=${activeTopic.slug}`}
                className="text-[9px] font-semibold text-emerald-700 flex items-center gap-0.5 hover:text-emerald-800 mt-auto"
              >
                Continue <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-sm flex flex-col gap-1.5">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-400" />
              <div className="text-[9px] text-slate-400">Streak</div>
              <div className="text-lg font-extrabold text-slate-900 leading-tight">{streakDays}</div>
              <div className="text-[9px] text-slate-400 -mt-1">days 🔥</div>
            </div>
          </div>
        </div>

        {/* ─ Consistency Heatmap ───────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Your Consistency</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              {streakDays > 0 ? `${streakDays} Days Active 🔥` : 'Start Today!'}
            </span>
          </div>

          <ConsistencyHeatmap days={heatmapDays} />

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
            {[
              { val: streakDays, label: 'Day Streak', icon: '🔥' },
              { val: daysActive, label: 'Days Active', icon: '📅' },
              { val: submissionsThisWeek, label: 'This Week', icon: '⚡' },
            ].map(({ val, label, icon }) => (
              <div key={label} className="text-center">
                <div className="text-base font-extrabold text-slate-900">{val}</div>
                <div className="text-[9px] text-slate-400">
                  {icon} {label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 italic leading-relaxed">
              &ldquo;Discipline in DSA now, freedom later.&rdquo;
            </div>
          </div>
        </div>
      </div>

      {/* ══ Row 2: Continue Learning | Today's Practice | Daily Challenge ═ */}
      <div className="grid grid-cols-12 gap-4">
        {/* ─ Continue Learning ─────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-800">Continue Learning</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                In Progress
              </span>
            </div>

            <div className="flex items-start gap-3 mb-4 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate">{activeTopic.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                  Next: <span className="font-medium text-slate-700">{nextProblem.title}</span>
                </div>
                <div className="mt-1">
                  <DiffBadge difficulty={normalizeDifficulty(nextProblem.difficulty)} />
                </div>
              </div>
            </div>

            <div className="mb-1">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1.5">
                <span>
                  {activeTopic.solvedProblems} of {activeTopic.totalProblems} completed
                </span>
                <span className="font-semibold text-slate-700">{activeTopic.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-700"
                  style={{ width: `${activeTopic.percentage}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            href={`/dashboard/dsa/problems/${nextProblem.slug}`}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-sm"
          >
            Continue Solving <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ─ Today's Practice ──────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-slate-800">Today&apos;s Practice</span>
            <Link
              href="/dashboard/dsa/problems"
              className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 hover:text-emerald-800"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-[10px] text-slate-400 mb-3">{practiceProblems.length} curated problems from catalog</div>

          <div className="space-y-1.5">
            {practiceProblems.map((p, i) => {
              const isSolved = solvedSlugs.has(p.slug);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 rounded-lg -mx-1 cursor-pointer group transition-colors"
                >
                  <Link href={`/dashboard/dsa/problems/${p.slug}`} className="flex items-center gap-2.5 min-w-0 flex-1">
                    {isSolved ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium truncate group-hover:text-emerald-700 ${
                        isSolved ? 'text-slate-400 line-through' : 'text-slate-700'
                      }`}
                    >
                      {p.title}
                    </span>
                  </Link>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <DiffBadge difficulty={normalizeDifficulty(p.difficulty)} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(p.id);
                      }}
                      className="text-slate-300 hover:text-amber-400 transition-colors"
                    >
                      {bookmarked[p.id] ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─ Daily Challenge ───────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-800">Daily Challenge</span>
              <div className="flex items-center gap-1 text-[10px] text-orange-600 font-semibold bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5" /> Active Today
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900 mb-2 leading-tight">
                  {dailyChallengeProblem.title}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <DiffBadge difficulty={normalizeDifficulty(dailyChallengeProblem.difficulty)} />
                  {dailyChallengeProblem.topics?.map((t) => (
                    <span
                      key={t.slug}
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full border text-slate-600 bg-slate-100 border-slate-200"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* XP reward */}
              <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-[10px] font-semibold text-amber-800">
                  Earn +{dailyChallengeXp} XP on accepted submission
                </span>
              </div>
            </div>
          </div>

          <div>
            <Link
              href={`/dashboard/dsa/problems/${dailyChallengeProblem.slug}`}
              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all hover:shadow-sm"
            >
              Solve Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Complete daily challenges to sustain your streak!</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Row 3: Weak Topics | Upcoming Test | Recent Problems ═════════ */}
      <div className="grid grid-cols-12 gap-4">
        {/* ─ Weak Topics ───────────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span className="text-sm font-bold text-slate-800">Focus Topics</span>
            </div>
            <Link
              href="/dashboard/dsa/patterns"
              className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 hover:text-emerald-800"
            >
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="text-[10px] text-slate-400 mb-4">Focus here to level up your mastery faster.</div>

          <div className="space-y-3.5">
            {weakTopics.map((t) => (
              <div key={t.rank} className="flex items-center gap-2.5 group cursor-pointer hover:opacity-90 transition-opacity">
                <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[9px] font-bold flex items-center justify-center shrink-0">
                  {t.rank}
                </span>
                <span className="text-xs text-slate-700 w-36 truncate font-medium">{t.label}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${t.barColor}`}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-500 w-7 text-right">{t.pct}%</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
            <div className="text-[10px] font-semibold text-rose-700 flex items-center gap-1.5">
              <Brain className="w-3 h-3" />
              Practice tip: Solving problems across diverse topics unlocks achievement badges!
            </div>
          </div>
        </div>

        {/* ─ Upcoming Test ─────────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-800">Upcoming Assessment</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                Weekly Sprint
              </span>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Weekly Coding Assessment #4</div>
                <div className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-1">
                  Arrays, Two Pointers, Stacks & Queues
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { icon: '❓', val: '4', label: 'Problems' },
                { icon: '⏱', val: '60m', label: 'Duration' },
                { icon: '⚡', val: 'Proctored', label: 'Mode' },
              ].map(({ icon, val, label }) => (
                <div key={label} className="flex flex-col items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-sm">{icon}</span>
                  <span className="text-xs font-bold text-slate-900">{val}</span>
                  <span className="text-[9px] text-slate-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Link
              href="/dashboard/tests"
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-emerald-300 text-xs font-bold rounded-xl transition-all mb-3"
            >
              View Test Catalog <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2 mt-auto">
              <div className="flex -space-x-1.5">
                {['#10b981', '#3b82f6', '#f59e0b', '#ef4444'].map((c, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="text-[10px] text-slate-400">Join peers on the weekly leaderboard</span>
            </div>
          </div>
        </div>

        {/* ─ Recently Solved ───────────────────────────────────────────── */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-800">Recently Solved</span>
              </div>
              <Link
                href="/dashboard/dsa/problems"
                className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5 hover:text-emerald-800"
              >
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {solvedList.length > 0 ? (
              <>
                {/* Table header */}
                <div className="grid grid-cols-4 text-[9px] font-bold text-slate-400 uppercase mb-2 px-1 tracking-wide">
                  <span className="col-span-2">Problem</span>
                  <span>Difficulty</span>
                  <span>Solved</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {solvedList.slice(0, 5).map((p) => (
                    <Link
                      key={p.id}
                      href={`/dashboard/dsa/problems/${p.slug}`}
                      className="grid grid-cols-4 items-center py-2 px-1 hover:bg-slate-50 rounded-lg cursor-pointer group transition-colors"
                    >
                      <div className="col-span-2 flex items-center gap-1.5 min-w-0">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="text-[10px] font-medium text-slate-700 truncate group-hover:text-emerald-700">
                          {p.title}
                        </span>
                      </div>
                      <DiffBadge difficulty={normalizeDifficulty(p.difficulty)} />
                      <span className="text-[9px] text-slate-400">{formatSolvedDate(p.solvedAt)}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-slate-700">No solved problems yet</div>
                <div className="text-[10px] text-slate-400 max-w-[200px]">
                  Submit your first solution to earn XP and initiate your streak!
                </div>
              </div>
            )}
          </div>

          {/* Category breakdown mini pills */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
            {['Arrays', 'Two Pointers', 'Stacks & Queues'].map((c) => (
              <span
                key={c}
                className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700"
              >
                {c}
              </span>
            ))}
            <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* ══ Row 4: Explore DSA by Topic ════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-bold text-slate-800">Explore DSA by Topic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400">{topicsList.length} topics</span>
            <button
              onClick={() => setTopicPage((p) => Math.max(0, p - 1))}
              disabled={topicPage === 0}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={() => setTopicPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={topicPage >= totalPages - 1}
              className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
          {visibleTopics.map((t) => {
            const pct = t.totalProblems > 0 ? Math.round((t.solvedProblems / t.totalProblems) * 100) : 0;
            const colorCls = t.color ? t.color.split(' ').slice(0, 2).join(' ') : 'bg-emerald-50 text-emerald-700';
            const iconText = t.icon || '⚡';
            return (
              <Link
                key={t.slug}
                href={`/dashboard/dsa/problems?topic=${t.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 hover:-translate-y-0.5 transition-all group cursor-pointer"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${colorCls} flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}
                >
                  {iconText}
                </div>
                <div className="text-center w-full">
                  <div className="text-[10px] font-bold text-slate-800 group-hover:text-emerald-700 leading-tight mb-1 truncate">
                    {t.name}
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-[8px] text-slate-400 mt-0.5">
                    {t.solvedProblems}/{t.totalProblems}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
