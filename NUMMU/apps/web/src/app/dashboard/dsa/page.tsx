'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Flame,
  Calendar,
  Zap,
  ChevronRight,
  Clock,
  Bookmark,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { progressService } from '@/services/progress.service';
import { dsaService } from '@/services/dsa.service';
import { practiceService, type DailyChallengeResponse, type CuratedPracticeItem } from '@/services/practice.service';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { ASSETS } from '@/lib/constants/assets';
import type {
  ProgressOverviewDto,
  TopicProgressSummary,
  ActivitySummaryDto,
  ProblemListItem,
  SubmissionListItem,
} from '@numu/types';

type NextLinkHref = React.ComponentProps<typeof Link>['href'];

interface LiveAssessmentItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  questionsCount?: number;
  _count?: { questions?: number };
  myLatestAttempt?: {
    status: string;
    score: number;
    percentage: number;
    passed: boolean;
  } | null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DonutRing({ solved, total }: { solved: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
  const r = 30;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg width={80} height={80} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="var(--ring-track, #e2e8f0)" strokeWidth={7} />
        <circle
          cx={40}
          cy={40}
          r={r}
          fill="none"
          stroke="#16a34a"
          strokeWidth={7}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-extrabold text-slate-900 leading-none">{solved}</span>
        <span className="text-[9px] text-slate-400">solved</span>
      </div>
    </div>
  );
}

const DIFF_CLS: Record<string, string> = {
  EASY: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200',
  HARD: 'text-red-600 bg-red-50 border-red-200',
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  Hard: 'text-red-600 bg-red-50 border-red-200',
};

function DiffBadge({ d }: { d: string }) {
  const label = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
        DIFF_CLS[d] ?? 'text-slate-600 bg-slate-100 border-slate-200'
      }`}
    >
      {label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DsaPage() {
  const searchParams = useSearchParams();
  const [overview, setOverview] = useState<ProgressOverviewDto | null>(null);
  const [topicSummary, setTopicSummary] = useState<TopicProgressSummary | null>(null);
  const [activity, setActivity] = useState<ActivitySummaryDto | null>(null);
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());
  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionListItem[]>([]);
  const [liveTests, setLiveTests] = useState<LiveAssessmentItem[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallengeResponse | null>(null);
  const [curatedProblems, setCuratedProblems] = useState<CuratedPracticeItem[]>([]);
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      setExpandedTopics((prev) => ({
        ...prev,
        [topicParam]: true,
      }));
    }
  }, [searchParams]);

  const toggleTopicAccordion = (slug: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const focusTopicAccordion = (slug: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [slug]: true,
    }));
    const el = document.getElementById(`topic-row-${slug}`) ?? document.getElementById('dsa-curriculum-topics');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  useEffect(() => {
    let isMounted = true;
    const tzOffsetMinutes = -new Date().getTimezoneOffset();

    Promise.allSettled([
      progressService.getOverview(),
      progressService.getTopicProgress(),
      progressService.getActivity({ tzOffsetMinutes }),
      progressService.getSolvedProblems({ limit: 100 }),
      progressService.getSubmissionHistory({ limit: 10 }),
      dsaService.getProblems({ limit: 50 }),
      apiClient.get<LiveAssessmentItem[] | { items: LiveAssessmentItem[] }>(ENDPOINTS.TESTS.LIST),
      practiceService.getDailyChallenge(),
      practiceService.getCuratedPractice(),
    ]).then(([ovRes, topRes, actRes, solvedRes, subRes, probRes, testRes, dailyRes, curatedRes]) => {
      if (!isMounted) return;

      if (ovRes.status === 'fulfilled') setOverview(ovRes.value);
      if (topRes.status === 'fulfilled') setTopicSummary(topRes.value);
      if (actRes.status === 'fulfilled') setActivity(actRes.value);
      if (solvedRes.status === 'fulfilled') {
        setSolvedSlugs(new Set(solvedRes.value.items.map((item) => item.slug)));
      }
      if (subRes.status === 'fulfilled') {
        setRecentSubmissions(subRes.value.items);
      }
      if (probRes.status === 'fulfilled') {
        setProblems(probRes.value.items);
      }
      if (testRes.status === 'fulfilled') {
        const list = Array.isArray(testRes.value)
          ? testRes.value
          : testRes.value?.items ?? [];
        setLiveTests(list);
      }
      if (dailyRes.status === 'fulfilled' && dailyRes.value) {
        setDailyChallenge(dailyRes.value);
      }
      if (curatedRes.status === 'fulfilled' && curatedRes.value) {
        setCuratedProblems(curatedRes.value);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleBm = (id: string) =>
    setBookmarked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  // Derived real metrics
  const solvedCount = overview?.totalProblemsSolved ?? 0;
  const totalCount = overview?.totalAvailable.total ?? (problems.length || 0);
  const easySolved = overview?.difficulty.easy ?? 0;
  const medSolved = overview?.difficulty.medium ?? 0;
  const hardSolved = overview?.difficulty.hard ?? 0;
  const overallPct = totalCount > 0 ? Math.min(100, Math.round((solvedCount / totalCount) * 100)) : 0;

  const currentStreak = activity?.currentStreak ?? 0;
  const totalActiveDays = activity?.activeDays ?? 0;
  const thisWeekCount = activity?.dailyActivity
    ? activity.dailyActivity.slice(-7).reduce((acc, d) => acc + d.submissionCount, 0)
    : 0;

  const heatmapCells: (0 | 1 | 2 | 3)[] =
    activity?.dailyActivity && activity.dailyActivity.length > 0
      ? activity.dailyActivity.slice(-21).map((d) => {
          if (d.submissionCount === 0) return 0;
          if (d.submissionCount === 1) return 1;
          if (d.submissionCount <= 3) return 2;
          return 3;
        })
      : Array.from({ length: 21 }, () => 0 as const);

  const topicsList = topicSummary?.topics ?? [];
  const activeTopic =
    topicsList.find((t) => t.solvedProblems > 0 && t.solvedProblems < t.totalProblems) ??
    topicsList.find((t) => t.totalProblems > 0 && t.solvedProblems < t.totalProblems) ??
    topicsList[0];

  const nextUnsolvedProblem =
    problems.find(
      (p) =>
        !solvedSlugs.has(p.slug) &&
        activeTopic &&
        p.topics.some((t) => t.slug === activeTopic.slug),
    ) ??
    problems.find((p) => !solvedSlugs.has(p.slug)) ??
    problems[0];

  const dailyProblem = (dailyChallenge?.problem as any) ?? nextUnsolvedProblem ?? problems[0];
  const dailyXpBonus = dailyChallenge?.xpBonus ?? (dailyProblem?.difficulty === 'MEDIUM' ? 50 : 30);

  const attemptedSlugs = new Set(recentSubmissions.map((s) => s.problemSlug));

  const weakTopics = [...topicsList]
    .filter((t) => t.totalProblems > 0 && t.percentage < 100)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 4);

  const activeAssessment =
    liveTests.find((t: any) => t.isFeaturedOnDashboard) ??
    liveTests.find(
      (t) => !t.myLatestAttempt || t.myLatestAttempt.status === 'IN_PROGRESS',
    ) ?? liveTests[0];

  const allExpanded =
    topicsList.length > 0 && topicsList.every((t) => Boolean(expandedTopics[t.slug]));

  const toggleExpandAll = () => {
    if (allExpanded) {
      setExpandedTopics({});
    } else {
      const next: Record<string, boolean> = {};
      for (const t of topicsList) {
        next[t.slug] = true;
      }
      setExpandedTopics(next);
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* ══ ROW 1: Hero | Stats 2x2 | Consistency ════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Hero Card */}
        <div
          className="col-span-1 lg:col-span-5 relative rounded-2xl overflow-hidden p-6 flex flex-col justify-between min-h-[220px] bg-[#140e38] shadow-sm border border-slate-200/80"
          style={{
            backgroundImage: `url(${ASSETS.hero.dsaHeroCard.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="relative z-10 flex flex-col h-full justify-between max-w-[65%]">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full mb-3">
                ✨ Shared 8-Topic DSA Curriculum
              </span>
              <h2 className="text-xl font-extrabold text-white leading-snug">
                Master DSA, <span className="text-emerald-400">One Topic</span> at a Time
              </h2>
              <p className="text-xs text-slate-200 mt-2 leading-relaxed line-clamp-2">
                {topicsList.length} structured topics, {totalCount} curated coding problems, live Judge0 grading, and per-student progress tracking.
              </p>
            </div>

            <div className="flex items-center gap-2.5 mt-4">
              <Link
                href={
                  (nextUnsolvedProblem
                    ? `/dashboard/dsa/problems/${nextUnsolvedProblem.slug}`
                    : '/dashboard/dsa/problems/two-sum') as NextLinkHref
                }
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/40"
              >
                Start Practicing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/dashboard/dsa/patterns"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all backdrop-blur-md"
              >
                View Roadmap
              </Link>
            </div>
          </div>
        </div>

        {/* Center 2x2 Grid */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-2 grid-rows-2 gap-3">
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Problems Solved
              </span>
              <span className="text-xs font-extrabold text-emerald-700">
                {solvedCount}/{totalCount}
              </span>
            </div>
            <div className="flex items-center gap-3 my-1">
              <DonutRing solved={solvedCount} total={totalCount} />
              <div className="space-y-1 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Easy
                  </span>
                  <span className="font-bold text-slate-800">{easySolved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Medium
                  </span>
                  <span className="font-bold text-slate-800">{medSolved}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Hard
                  </span>
                  <span className="font-bold text-slate-800">{hardSolved}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Curriculum Progress</span>
                <span className="font-bold text-slate-600">{overallPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-xs">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Current Topic</div>
              <div className="text-xs font-extrabold text-slate-900 leading-tight mt-0.5 truncate">
                {activeTopic?.name ?? 'Arrays'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => activeTopic && focusTopicAccordion(activeTopic.slug)}
              className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Continue <ArrowRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 flex flex-col justify-between shadow-xs">
            <div className="w-7 h-7 rounded-xl bg-orange-50 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Streak</div>
              <div className="text-xl font-extrabold text-slate-900 leading-none">
                {currentStreak}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">days 🔥</div>
            </div>
          </div>
        </div>

        {/* Your Consistency */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">Your Consistency</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {currentStreak > 0 ? '🔥 Streak Active' : 'Start Today!'}
            </span>
          </div>

          <div>
            <div className="grid grid-cols-10 gap-1 my-2">
              {heatmapCells.map((v, i) => (
                <div
                  key={i}
                  className={`h-3 rounded-xs ${
                    v === 0
                      ? 'bg-slate-100'
                      : v === 1
                      ? 'bg-emerald-200'
                      : v === 2
                      ? 'bg-emerald-400'
                      : 'bg-emerald-600'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 text-[9px] text-slate-400">
              <span>Less</span>
              {[0, 1, 2, 3].map((v) => (
                <div
                  key={v}
                  className={`w-2.5 h-2.5 rounded-xs ${
                    v === 0
                      ? 'bg-slate-100'
                      : v === 1
                      ? 'bg-emerald-200'
                      : v === 2
                      ? 'bg-emerald-400'
                      : 'bg-emerald-600'
                  }`}
                />
              ))}
              <span>More</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-100 pt-2">
            <div>
              <div className="text-sm font-extrabold text-slate-900">{currentStreak}</div>
              <div className="text-[9px] text-slate-400">🔥 Day Streak</div>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">{totalActiveDays}</div>
              <div className="text-[9px] text-slate-400">📅 Days Active</div>
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">{thisWeekCount}</div>
              <div className="text-[9px] text-slate-400">⚡ This Week</div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-2">
            &ldquo;Discipline in DSA now, freedom later.&rdquo;
          </p>
        </div>
      </div>

      {/* ══ ROW 2: EXPANDABLE TOPIC ACCORDION LIST (CLICK TOPIC TO VIEW QUESTIONS) ══ */}
      <div id="dsa-curriculum-topics" className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 shrink-0">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  DSA Topics & Curriculum Questions
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {solvedCount} / {totalCount} Solved ({overallPct}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any topic below to expand and solve questions related to that topic.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleExpandAll}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            {allExpanded ? 'Collapse All' : 'Expand All Topics'}
          </button>
        </div>

        {/* Vertical Accordion List of Topics */}
        <div className="space-y-2.5">
          {topicsList.map((topic) => {
            const topicProblems = problems.filter((p) =>
              p.topics.some((pt) => pt.slug === topic.slug),
            );
            const isExpanded = Boolean(expandedTopics[topic.slug]);
            const isTopicComplete =
              topic.totalProblems > 0 && topic.solvedProblems >= topic.totalProblems;

            return (
              <div
                key={topic.id}
                id={`topic-row-${topic.slug}`}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded
                    ? 'border-emerald-300 bg-white shadow-xs'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                {/* Clickable Topic Accordion Bar */}
                <button
                  type="button"
                  onClick={() => toggleTopicAccordion(topic.slug)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer group select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isExpanded
                          ? 'rotate-90 text-emerald-600'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span className="text-sm sm:text-[15px] font-bold text-slate-800 group-hover:text-emerald-800 transition-colors truncate">
                      {topic.name}
                    </span>
                    {isTopicComplete && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Completed ✓
                      </span>
                    )}
                  </div>

                  {/* Right Side: Horizontal Progress Bar + Solved / Total Counter */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-28 sm:w-52 h-1.5 bg-slate-200/90 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTopicComplete ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-600 tabular-nums min-w-[46px] text-right">
                      {topic.solvedProblems} / {topic.totalProblems}
                    </span>
                  </div>
                </button>

                {/* Expanded Topic Questions Table */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-white px-4 sm:px-6 py-3">
                    {topicProblems.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No problems published in this topic yet.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {topicProblems.map((prob, idx) => {
                          const isSolved = solvedSlugs.has(prob.slug);
                          const isAttempted = !isSolved && attemptedSlugs.has(prob.slug);

                          return (
                            <div
                              key={prob.id}
                              className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="text-xs font-semibold text-slate-400 w-5 text-right shrink-0">
                                  {idx + 1}.
                                </span>
                                {isSolved ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : isAttempted ? (
                                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                                ) : (
                                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 inline-block" />
                                )}
                                <Link
                                  href={`/dashboard/dsa/problems/${prob.slug}` as NextLinkHref}
                                  className={`text-xs sm:text-sm font-bold truncate hover:text-emerald-700 transition-colors ${
                                    isSolved ? 'text-emerald-950' : 'text-slate-800'
                                  }`}
                                >
                                  {prob.title}
                                </Link>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                <DiffBadge d={prob.difficulty} />
                                <button
                                  type="button"
                                  onClick={() => toggleBm(prob.id)}
                                  className="text-slate-300 hover:text-emerald-600 transition-colors cursor-pointer"
                                  title="Bookmark problem"
                                >
                                  <Bookmark
                                    className={`w-3.5 h-3.5 ${
                                      bookmarked.includes(prob.id)
                                        ? 'fill-emerald-600 text-emerald-600'
                                        : ''
                                    }`}
                                  />
                                </button>
                                <Link
                                  href={`/dashboard/dsa/problems/${prob.slug}` as NextLinkHref}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                                    isSolved
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-[#0b5c39] text-white hover:bg-[#08482c]'
                                  }`}
                                >
                                  {isSolved ? 'Solved ✓' : isAttempted ? 'Resume →' : 'Solve →'}
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ ROW 3: Continue Learning | Today's Practice | Daily Challenge ═ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Continue Learning */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">Continue Learning</span>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                In Progress
              </span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-slate-900">
                    {activeTopic?.name ?? 'Arrays'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Next: {nextUnsolvedProblem?.title ?? 'Two Sum'}
                  </div>
                </div>
              </div>
              {nextUnsolvedProblem && (
                <div className="mt-2">
                  <DiffBadge d={nextUnsolvedProblem.difficulty} />
                </div>
              )}
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>
                  {activeTopic?.solvedProblems ?? 0} of {activeTopic?.totalProblems ?? 0} completed
                </span>
                <span className="font-bold text-slate-700">{activeTopic?.percentage ?? 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all"
                  style={{ width: `${activeTopic?.percentage ?? 0}%` }}
                />
              </div>
            </div>
          </div>

          <Link
            href={
              (nextUnsolvedProblem
                ? `/dashboard/dsa/problems/${nextUnsolvedProblem.slug}`
                : '/dashboard/dsa/problems/two-sum') as NextLinkHref
            }
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            Continue Solving <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Today's Practice */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-xs font-bold text-slate-800">Today&apos;s Practice</span>
                <div className="text-[10px] text-slate-400">
                  {problems.length} curated problems from database
                </div>
              </div>
              <button
                type="button"
                onClick={toggleExpandAll}
                className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {(curatedProblems.length > 0 ? curatedProblems.map((cp) => cp.problem) : problems.slice(0, 5)).map((p, i) => {
                const isSolved = solvedSlugs.has(p.slug);
                return (
                  <div key={p.id} className="flex items-center gap-2 py-2">
                    <span
                      className={`text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isSolved
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isSolved ? '✓' : i + 1}
                    </span>
                    <Link
                      href={`/dashboard/dsa/problems/${p.slug}` as NextLinkHref}
                      className="text-xs font-medium text-slate-800 flex-1 truncate hover:text-emerald-700 transition-colors"
                    >
                      {p.title}
                    </Link>
                    <DiffBadge d={p.difficulty as any} />
                    <button
                      onClick={() => toggleBm(p.id)}
                      className="text-slate-300 hover:text-emerald-600 transition-colors shrink-0"
                    >
                      <Bookmark
                        className={`w-3.5 h-3.5 ${
                          bookmarked.includes(p.id) ? 'fill-emerald-600 text-emerald-600' : ''
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800">Daily Challenge</span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                <Clock className="w-2.5 h-2.5" /> Active Today
              </span>
            </div>

            <div className="text-sm font-extrabold text-slate-900 mb-2">
              {dailyProblem?.title ?? 'Two Sum'}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              {dailyProblem && <DiffBadge d={dailyProblem.difficulty} />}
              {dailyProblem?.topics?.map((t: any) => (
                <span
                  key={t.slug || t.topic?.slug}
                  className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"
                >
                  {t.name || t.topic?.name}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[10px] font-semibold text-amber-800">
                Earn +{dailyXpBonus} XP on accepted Judge0 submission
              </span>
            </div>
          </div>

          <div>
            <Link
              href={
                (dailyProblem
                  ? `/dashboard/dsa/problems/${dailyProblem.slug}`
                  : '/dashboard/dsa/problems/two-sum') as NextLinkHref
              }
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Solve Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <div className="text-center text-[10px] text-slate-400 mt-2">
              🏆 Complete daily challenges to sustain your streak!
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 4: Recently Practiced | Weak Areas | Live Proctored Assessment ══════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Recently Practiced */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-800">Recently Practiced</span>
            <span className="text-[10px] font-bold text-emerald-700">
              {recentSubmissions.length} Recent Runs
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center gap-2.5 py-2.5">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      s.verdict === 'ACCEPTED' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/dsa/problems/${s.problemSlug}` as NextLinkHref}
                      className="text-xs font-semibold text-slate-800 truncate block hover:text-emerald-700"
                    >
                      {s.problemTitle}
                    </Link>
                    <div className="text-[10px] text-slate-400">
                      {s.language.toUpperCase()} • {(s.verdict || s.status || '').replace(/_/g, ' ')}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.verdict === 'ACCEPTED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {s.verdict === 'ACCEPTED' ? 'AC' : `${s.testsPassed ?? 0}/${s.totalTests ?? 10}`}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent submissions yet. Start solving to track your history!
              </div>
            )}
          </div>
        </div>

        {/* Weak Areas */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">Topics to Focus Next</span>
              </div>
              <span className="text-[10px] text-slate-400">Needs practice</span>
            </div>

            <div className="space-y-3 mt-3">
              {weakTopics.map((w) => (
                <div key={w.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">
                      {w.order}. {w.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-amber-600">
                        {w.solvedProblems}/{w.totalProblems} ({w.percentage}%)
                      </span>
                      <button
                        type="button"
                        onClick={() => focusTopicAccordion(w.slug)}
                        className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        Practice <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.max(8, w.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => weakTopics[0] && focusTopicAccordion(weakTopics[0].slug)}
            className="w-full mt-4 py-2 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-xs font-bold text-slate-700 hover:text-emerald-800 rounded-xl transition-all text-center block cursor-pointer"
          >
            Practice Weak Topics
          </button>
        </div>

        {/* Live Proctored Assessment (from PostgreSQL /api/v1/tests) */}
        <div className="col-span-1 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-xs font-bold text-slate-800">Proctored Assessment</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {activeAssessment?.myLatestAttempt?.status === 'SUBMITTED'
                  ? `Scored ${activeAssessment.myLatestAttempt.percentage}%`
                  : 'Published'}
              </span>
            </div>

            <div className="text-sm font-extrabold text-slate-900 mb-3">
              {activeAssessment?.title ?? 'Weekly DSA Assessment #1'}
            </div>

            <div className="space-y-1.5 text-xs text-slate-500 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Fullscreen & Tab-Switch Proctored</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Duration: {activeAssessment?.durationMinutes ?? 60} mins</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {activeAssessment?.questionsCount ??
                    activeAssessment?._count?.questions ??
                    3}{' '}
                  Assigned DSA Problems
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/tests"
              className="flex-1 py-2 border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 rounded-xl transition-all text-center"
            >
              All Tests ({liveTests.length})
            </Link>
            <Link
              href={(activeAssessment ? `/tests/${activeAssessment.id}` : '/tests') as NextLinkHref}
              className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              {activeAssessment?.myLatestAttempt?.status === 'SUBMITTED' ? 'View Result' : 'Start Test'}{' '}
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
