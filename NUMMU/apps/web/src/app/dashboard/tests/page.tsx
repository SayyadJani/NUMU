'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DUMMY_TESTS } from '@/data/tests-data';
import { DUMMY_CONTESTS } from '@/data/profile';
import type { TestItem } from '@/types/tests';

const DUMMY_UPCOMING_CONTEST = {
  id: 'contest-43',
  title: 'NUMU Weekly Contest #43',
  date: 'Sunday, 10:00 AM IST',
  countdown: '2d 14h 22m',
  duration: '90 Minutes',
  problemCount: 4,
  registeredCount: 1420,
  isRegistered: false,
  prize: 'Top 50 Fast-Tracked to Recruiter Screening',
};
import { TestInstructionsModal } from '@/components/tests/TestInstructionsModal';
import { testsService } from '@/services/tests.service';
import {
  Trophy,
  Medal,
  ChevronRight,
  Users,
  CheckCircle2,
  Sparkles,
  Search,
  Bookmark,
  BookmarkCheck,
  FileText,
  RotateCcw,
  Crown,
  Globe,
  ChartNoAxesColumnIncreasing,
  CalendarDays,
  Gift,
  ArrowRight,
  Clock,
  Code,
  Layers,
  SlidersHorizontal,
  ClipboardList,
  Target,
  Loader2,
} from 'lucide-react';

const COMPETITIVE_TIERS = [
  { name: 'Pupil', range: '< 1200', active: false },
  { name: 'Specialist', range: '1200 - 1400', active: false },
  { name: 'Knight', range: '1400 - 1600', active: true },
  { name: 'Guardian', range: '1600 - 1900', active: false },
  { name: 'Legend', range: '1900+', active: false },
];

const LEADERBOARD_PREVIEW = [
  { rank: 1, name: 'Aarav Sharma', college: 'IIT Bombay', rating: 1984, tier: 'Legend', badge: '🥇' },
  { rank: 2, name: 'Sneha Reddy', college: 'NIT Trichy', rating: 1892, tier: 'Guardian', badge: '🥈' },
  { rank: 3, name: 'Rohan Mehta', college: 'BITS Pilani', rating: 1845, tier: 'Guardian', badge: '🥉' },
  { rank: 23, name: 'Jani Pasha (You)', college: 'BVRIT', rating: 1482, tier: 'Knight', isUser: true },
];

const CURRENT_RATING = 1482;
const NEXT_TIER_RATING = 1600;

// Initial contest countdown: 2d 14h 12m
const CONTEST_COUNTDOWN_START = (2 * 24 * 60 + 14 * 60 + 12) * 60;

function formatCountdown(totalSeconds: number) {
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

/* ─── Decorative: Shield rank badge ─────────────────────────────────────────── */
function RankShield() {
  return (
    <div className="relative w-[62px] h-[70px] shrink-0">
      <svg viewBox="0 0 62 70" className="absolute inset-0 w-full h-full drop-shadow-md" aria-hidden>
        <defs>
          <linearGradient id="shieldOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f8a55" />
            <stop offset="100%" stopColor="#0b4a2d" />
          </linearGradient>
          <linearGradient id="shieldInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#13643d" />
            <stop offset="100%" stopColor="#0a3d25" />
          </linearGradient>
        </defs>
        <path d="M31 2 L58 11 V33 C58 50 46 61 31 68 C16 61 4 50 4 33 V11 Z" fill="url(#shieldOuter)" stroke="#d6b45a" strokeWidth="2" />
        <path d="M31 9 L51 16 V33 C51 46 42 55 31 60 C20 55 11 46 11 33 V16 Z" fill="url(#shieldInner)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pb-1">
        <Trophy className="w-6 h-6 text-amber-300 fill-amber-400/80" />
      </div>
    </div>
  );
}

/* ─── Decorative: Hero illustration ─────────────────────────────────────────── */
function HeroIllustration() {
  return (
    <svg viewBox="0 0 220 110" className="w-[220px] h-[110px]" aria-hidden>
      <defs>
        <linearGradient id="docGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e9f7ef" />
          <stop offset="100%" stopColor="#cfeedd" />
        </linearGradient>
        <linearGradient id="codeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1a7a4a" />
          <stop offset="100%" stopColor="#0b5c39" />
        </linearGradient>
      </defs>
      {/* soft blob */}
      <ellipse cx="120" cy="62" rx="100" ry="44" fill="#eef8f2" />
      {/* back doc */}
      <rect x="70" y="30" width="62" height="70" rx="8" transform="rotate(-14 101 65)" fill="#ddf1e5" />
      {/* main doc */}
      <rect x="92" y="18" width="74" height="84" rx="9" transform="rotate(-8 129 60)" fill="url(#docGrad)" stroke="#bfe5cf" />
      <g transform="rotate(-8 129 60)" fill="#9fd6b7">
        <rect x="104" y="34" width="44" height="5" rx="2.5" />
        <rect x="104" y="46" width="50" height="5" rx="2.5" />
        <rect x="104" y="58" width="38" height="5" rx="2.5" />
        <rect x="104" y="70" width="46" height="5" rx="2.5" />
      </g>
      {/* check badge */}
      <circle cx="128" cy="98" r="9" fill="#0b5c39" stroke="#fff" strokeWidth="2.5" />
      <path d="M124 98 l3 3 l5 -6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* code tile */}
      <rect x="160" y="10" width="40" height="40" rx="9" fill="url(#codeGrad)" />
      <path d="M173 24 l-5 6 l5 6 M187 24 l5 6 l-5 6 M182 21 l-4 18" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* sparkles */}
      <circle cx="78" cy="22" r="2.5" fill="#bfe5cf" />
      <circle cx="206" cy="70" r="3" fill="#cfeedd" />
      <circle cx="60" cy="80" r="2" fill="#cfeedd" />
    </svg>
  );
}

const ContestCountdown = React.memo(function ContestCountdown({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-1 rounded-xl bg-gradient-to-b from-emerald-50 to-emerald-50/40 border border-emerald-100/80 flex flex-col items-center justify-center py-2.5">
      <span className="text-[11px] text-slate-500 font-medium">Starts in</span>
      <span className="text-xl font-extrabold text-[#0b5c39] tabular-nums mt-0.5">
        {formatCountdown(seconds)}
      </span>
    </div>
  );
});

export default function DashboardTestsPage() {
  // Main view tab: 'tests' | 'contests'
  const [mainTab, setMainTab] = useState<'tests' | 'contests'>('tests');

  // Sub status filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected test for instructions modal
  const [modalTest, setModalTest] = useState<TestItem | null>(null);

  // Bookmarks map
  const [bookmarkedMap, setBookmarkedMap] = useState<Record<string, boolean>>({});

  // Upcoming Contest registration state
  const [isContestRegistered, setIsContestRegistered] = useState(DUMMY_UPCOMING_CONTEST.isRegistered);
  const [contestParticipants, setContestParticipants] = useState(DUMMY_UPCOMING_CONTEST.registeredCount);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedMap((prev) => {
      const next = !prev[id];
      showToast(next ? 'Saved to bookmarks! 📌' : 'Removed from bookmarks');
      return { ...prev, [id]: next };
    });
  };

  const toggleRegisterContest = () => {
    if (isContestRegistered) {
      setIsContestRegistered(false);
      setContestParticipants((c) => c - 1);
      showToast('Unregistered from Weekly Contest');
    } else {
      setIsContestRegistered(true);
      setContestParticipants((c) => c + 1);
      showToast('Registered for NUMU Weekly Contest #43! 🎉');
    }
  };

  const [testsList, setTestsList] = useState<TestItem[]>([]);
  const [loadingTests, setLoadingTests] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTests() {
      try {
        setLoadingTests(true);
        const data = await testsService.getPublishedTests();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: TestItem[] = data.map((t: any) => ({
              id: t.slug || t.id,
              title: t.title,
              status: (t.userAttemptStatus === 'COMPLETED' ? 'past' : 'ongoing') as any,
              dateBadge: `Week ${t.weekNumber || 1}`,
              fullDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              questionsCount: t.totalQuestions ?? t.questions?.length ?? 0,
              durationMinutes: t.durationMinutes || 90,
              typeBadge: 'Coding',
              passPercentage: t.passPercentage || 60,
              syllabusTags: (t.questions || []).map((q: any) => q.problemTitle).filter(Boolean).length > 0
                ? (t.questions || []).map((q: any) => q.problemTitle).filter(Boolean)
                : ['DSA', 'Algorithms'],
              score: t.userScore ?? undefined,
              userRank: t.userPassed ? 1 : undefined,
              questions: [],
            }));
            setTestsList(mapped);
          } else {
            setTestsList([]);
          }
        }
      } catch {
        if (isMounted) setTestsList([]);
      } finally {
        if (isMounted) setLoadingTests(false);
      }
    }
    loadTests();
    return () => {
      isMounted = false;
    };
  }, []);

  const searchParams = useSearchParams();
  const testParam = searchParams?.get('test');

  useEffect(() => {
    if (!testParam) return;
    const found = testsList.find((t) => t.id === testParam || t.slug === testParam);
    if (found) {
      setModalTest(found);
    } else {
      testsService
        .getTestBySlug(testParam)
        .then((res) => {
          if (res) {
            setModalTest({
              id: res.slug || res.id,
              slug: res.slug,
              title: res.title,
              status: 'ongoing',
              dateBadge: `Week ${res.weekNumber || 1}`,
              fullDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              questionsCount: res.totalQuestions || res.questions?.length || 0,
              durationMinutes: res.durationMinutes || 90,
              typeBadge: 'Coding',
              passPercentage: res.passPercentage || 60,
              syllabusTags: (res.topics || []).map((t: any) => t.name),
              questions: [],
            });
          }
        })
        .catch(() => {});
    }
  }, [testParam, testsList]);

  // Filtered Tests
  const filteredTests = useMemo(() => {
    return testsList.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(q);
        const matchesTags = t.syllabusTags.some((tag) => tag.toLowerCase().includes(q));
        return matchesTitle || matchesTags;
      }
      return true;
    });
  }, [testsList, statusFilter, searchQuery]);

  // Filtered Contests
  const filteredContests = useMemo(() => {
    return DUMMY_CONTESTS.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.contestName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery]);

  const liveTest = testsList.find((t) => t.status === 'ongoing') ?? testsList[0] ?? null;
  const progressPct = Math.round((CURRENT_RATING / NEXT_TIER_RATING) * 100);

  return (
    <>
      <main className="flex-1 px-6 pb-8 pt-4 space-y-4">

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ══ Page Hero ═════════════════════════════════════════════════════ */}
          <section className="flex items-start justify-between gap-4">
            <div className="pt-1">
              <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2.5" aria-label="Breadcrumb">
                <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
                  Dashboard
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-semibold">Tests &amp; Assessments</span>
              </nav>
              <h1 className="text-[28px] leading-tight font-extrabold text-slate-900 tracking-tight">
                Tests &amp; Assessments
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Practice, take assessments, and join contests to improve your skills and track your progress.
              </p>
            </div>
            <div className="hidden md:block -mt-1 -mb-6 shrink-0">
              <HeroIllustration />
            </div>
          </section>

          {/* ══ Rating & Stats Strip ══════════════════════════════════════════ */}
          <section className="relative bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] px-3 py-3 flex flex-wrap xl:flex-nowrap items-center gap-4">
            {/* Current rating */}
            <div className="flex items-center gap-3.5 pl-1 pr-2">
              <RankShield />
              <div>
                <div className="text-[11px] font-medium text-slate-500">Current Rating</div>
                <div className="text-[26px] font-extrabold text-slate-900 leading-none my-1">
                  {CURRENT_RATING.toLocaleString()}
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  <Crown className="w-3 h-3 text-amber-600" />
                  Knight Tier
                </span>
              </div>
            </div>

            {/* Progress to next tier */}
            <div className="flex-1 min-w-[200px] max-w-[230px] border border-slate-200/80 rounded-xl px-3.5 py-3">
              <div className="flex items-center justify-between text-[11px] mb-2">
                <span className="font-bold text-slate-800">Progress to Guardian</span>
                <span className="text-slate-500 font-medium">
                  {CURRENT_RATING.toLocaleString()} / {NEXT_TIER_RATING.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#0b5c39] rounded-full" style={{ width: `${progressPct}%` }} />
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                {NEXT_TIER_RATING - CURRENT_RATING} points to reach Guardian
              </div>
            </div>

            {/* Metric items */}
            <div className="flex-[2] grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { icon: Globe, label: 'Global Rank', value: '#842', sub: 'Top 8%', tint: 'bg-slate-100 text-slate-600' },
                { icon: ChartNoAxesColumnIncreasing, label: 'Peak Rating', value: '1,520', sub: '', tint: 'bg-emerald-50 text-emerald-600' },
                { icon: Trophy, label: 'Contests', value: '28', sub: 'Participated', tint: 'bg-orange-50 text-orange-500' },
                { icon: FileText, label: 'Tests Completed', value: '23', sub: 'Total tests', tint: 'bg-emerald-50 text-emerald-600' },
              ].map(({ icon: Icon, label, value, sub, tint }) => (
                <div key={label} className="flex items-start gap-2.5 px-2 py-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-500 font-medium truncate">{label}</div>
                    <div className="text-[17px] font-extrabold text-slate-900 leading-tight">{value}</div>
                    {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ══ Featured Cards: Weekly Contest + Live Test ════════════════════ */}
          <section className="grid grid-cols-1 lg:grid-cols-[1.25fr_1fr] gap-3">
            {/* ── Weekly Contest ── */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3.5 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block text-[9px] font-extrabold tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                      WEEKLY CONTEST
                    </span>
                    <h2 className="text-[15px] font-extrabold text-slate-900 mt-1.5 leading-snug">
                      {DUMMY_UPCOMING_CONTEST.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      4 algorithmic challenges • 90 minutes
                      <br />
                      LeetCode &amp; Codeforces style rating delta.
                    </p>
                    <div className="flex items-center gap-5 text-[11px] text-slate-600 mt-3">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                        Sun, Oct 12 • 10:00 AM IST
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {contestParticipants.toLocaleString()} registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Countdown + CTA */}
                <div className="sm:w-[150px] shrink-0 flex flex-col gap-2">
                  <ContestCountdown initialSeconds={CONTEST_COUNTDOWN_START} />
                  <button
                    id="register-contest-btn"
                    onClick={toggleRegisterContest}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] ${
                      isContestRegistered
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-[#0b5c39] hover:bg-[#08482c] text-white shadow-sm'
                    }`}
                  >
                    {isContestRegistered ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Registered</span>
                      </>
                    ) : (
                      <>
                        <span>Register for Free</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => showToast('Prize details coming soon 🎁')}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-[11px] font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Gift className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Top 3 win 6-month Pro subscription &amp; certificates</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              </button>
            </div>

            {/* ── Live Test ── */}
            {liveTest ? (
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-3.5 flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block text-[9px] font-extrabold tracking-wider text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
                      LIVE TEST
                    </span>
                    <h2 className="text-[15px] font-extrabold text-slate-900 mt-1.5 leading-snug">
                      {liveTest.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {liveTest.questionsCount} Questions (MCQ + Live Coding)
                      <br />
                      Passing score: {liveTest.passPercentage}%
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                      <span className="relative flex w-2 h-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                        <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                      </span>
                      Ends in {liveTest.endsIn ?? '2h 14m'}
                    </span>
                    <button
                      id="attempt-live-test-btn"
                      onClick={() => setModalTest(liveTest)}
                      className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#0b5c39] hover:bg-[#08482c] text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-[0.98]"
                    >
                      Attempt Test Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Clock, label: 'Duration', value: `${liveTest.durationMinutes} mins` },
                    { icon: Code, label: 'Format', value: 'Coding + MCQ' },
                    { icon: Layers, label: 'Topics', value: (liveTest.syllabusTags || []).slice(0, 3).join(', ') || 'DSA & Algorithms' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5 border border-slate-200/80 dark:border-slate-800 rounded-lg px-2.5 py-2 bg-slate-50/70 dark:bg-slate-900/60">
                      <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-slate-500">{label}</div>
                        <div className="text-[11px] font-bold text-slate-800 truncate">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No Assessments Live</h3>
                <p className="text-xs text-slate-500 mt-1">Check back soon for the next scheduled weekly proctored test.</p>
              </div>
            )}
          </section>

          {/* ══ Tabs + Filters Row ════════════════════════════════════════════ */}
          <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-6 border-b border-slate-200 self-start">
              {([
                { key: 'tests', label: 'All Tests & Assessments', icon: ClipboardList, count: testsList.length },
                { key: 'contests', label: 'Contests & Competitive Arena', icon: Trophy, count: DUMMY_CONTESTS.length },
              ] as const).map(({ key, label, icon: Icon, count }) => {
                const active = mainTab === key;
                return (
                  <button
                    key={key}
                    id={`tab-${key}`}
                    onClick={() => setMainTab(key)}
                    className={`relative flex items-center gap-2 pb-2.5 text-xs font-bold transition-colors cursor-pointer ${
                      active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-slate-800' : 'text-slate-400'}`} />
                    <span>{label}</span>
                    <span
                      className={`text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center font-bold ${
                        active ? 'bg-[#0b5c39] text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                    {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#0b5c39] rounded-full" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="tests-search"
                  type="text"
                  placeholder={mainTab === 'tests' ? 'Search tests or syllabus...' : 'Search contests...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0b5c39] focus:ring-2 focus:ring-emerald-500/10 w-48 sm:w-[180px] transition"
                />
              </div>

              {mainTab === 'tests' && (
                <div className="flex items-center gap-1 text-xs">
                  {(['all', 'ongoing', 'upcoming', 'past'] as const).map((st) => (
                    <button
                      key={st}
                      id={`filter-${st}`}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                        statusFilter === st
                          ? 'bg-[#0b5c39] text-white shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                      }`}
                    >
                      {st === 'ongoing' ? 'Live' : st}
                    </button>
                  ))}
                </div>
              )}

              <button
                id="tests-filter-btn"
                onClick={() => showToast('Advanced filters coming soon')}
                className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:border-slate-300 transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </button>
            </div>
          </section>

          {/* ══ TAB 1: TESTS & ASSESSMENTS LIST ═══════════════════════════════ */}
          {mainTab === 'tests' && (
            <section className="space-y-1.5">
              {loadingTests ? (
                <div className="bg-white rounded-xl border border-slate-200/80 py-10 flex flex-col items-center justify-center text-xs text-slate-500 gap-2">
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                  <span>Loading assessments from database...</span>
                </div>
              ) : filteredTests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200/80 py-10 text-center text-xs text-slate-500">
                  No tests found. Assessments created by trainers in the Admin Console will appear here live.
                </div>
              ) : null}

              {filteredTests.map((test) => {
                const isBookmarked = !!bookmarkedMap[test.id];
                const [mon, day] = test.dateBadge.split(' ');
                const year = test.fullDate.split(', ')[1] ?? '2026';

                return (
                  <div
                    key={test.id}
                    className="group bg-white rounded-xl border border-slate-200/80 px-2.5 py-2 grid grid-cols-[64px_minmax(0,1fr)] md:grid-cols-[64px_minmax(0,1fr)_84px_84px_84px_100px_120px_28px] items-center gap-x-3 gap-y-2 hover:border-emerald-300 hover:shadow-[0_2px_10px_rgba(11,92,57,0.06)] transition-all"
                  >
                    {/* Date */}
                    <div className="rounded-lg bg-slate-100/80 text-center py-1.5">
                      <div className="text-[11px] font-extrabold text-slate-800 leading-tight">
                        {mon} {day}
                      </div>
                      <div className="text-[10px] text-slate-500">{year}</div>
                    </div>

                    {/* Title + tags */}
                    <div className="min-w-0 pl-3">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[13px] font-bold text-slate-900 truncate group-hover:text-[#0b5c39] transition-colors">
                          {test.title}
                        </h3>
                        <span
                          className={`text-[9px] font-extrabold tracking-wide px-1.5 py-0.5 rounded shrink-0 ${
                            test.status === 'ongoing'
                              ? 'bg-emerald-100 text-emerald-800'
                              : test.status === 'upcoming'
                              ? 'bg-blue-100/80 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {test.status === 'ongoing' ? 'LIVE NOW' : test.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {test.syllabusTags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="hidden md:flex items-start gap-1.5">
                      <ClipboardList className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">{test.questionsCount}</div>
                        <div className="text-[10px] text-slate-500">Questions</div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="hidden md:flex items-start gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">{test.durationMinutes}m</div>
                        <div className="text-[10px] text-slate-500">Duration</div>
                      </div>
                    </div>

                    {/* Passing */}
                    <div className="hidden md:flex items-start gap-1.5">
                      <Target className="w-3.5 h-3.5 text-orange-500 mt-0.5" />
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">{test.passPercentage}%</div>
                        <div className="text-[10px] text-slate-500">Passing</div>
                      </div>
                    </div>

                    {/* Score badge (past only) */}
                    <div className="hidden md:flex justify-end">
                      {test.score !== undefined && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-md whitespace-nowrap">
                          {test.score}% • Rank #{test.userRank}
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      {test.status === 'ongoing' ? (
                        <button
                          id={`attempt-${test.id}`}
                          onClick={() => setModalTest(test)}
                          className="w-full md:w-[112px] py-2 rounded-md text-[11px] font-bold bg-[#0b5c39] hover:bg-[#08482c] text-white shadow-sm transition-all cursor-pointer active:scale-[0.98]"
                        >
                          Attempt Now
                        </button>
                      ) : test.status === 'upcoming' ? (
                        <button
                          id={`syllabus-${test.id}`}
                          onClick={() => setModalTest(test)}
                          className="w-full md:w-[112px] py-2 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 transition-all cursor-pointer"
                        >
                          View Syllabus
                        </button>
                      ) : (
                        <Link
                          id={`review-${test.id}`}
                          href={`/tests/${test.id}` as React.ComponentProps<typeof Link>['href']}
                          className="w-full md:w-[112px] py-2 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-800 hover:border-emerald-500 hover:text-emerald-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Review Solutions
                        </Link>
                      )}
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={() => toggleBookmark(test.id)}
                      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark test'}
                      className="hidden md:flex justify-center p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </section>
          )}

          {/* ══ TAB 2: CONTESTS & ARENA VIEW ══════════════════════════════════ */}
          {mainTab === 'contests' && (
            <div className="space-y-6">

              {/* Competitive Tier Progression Ladder */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Competitive Tier Ranking System</h3>
                    <p className="text-xs text-slate-500">Solve contested rounds, gain rating points, climb tiers.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Your Tier: Knight (1,482)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {COMPETITIVE_TIERS.map((tier) => (
                    <div
                      key={tier.name}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${
                        tier.active
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{tier.name}</div>
                      <div className="text-[10px] font-mono opacity-80 mt-0.5">{tier.range}</div>
                      {tier.active && (
                        <div className="mt-1 text-[9px] font-bold text-emerald-700">★ Current Rank</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contest History Table & Leaderboard Preview */}
              <div className="grid grid-cols-12 gap-5">

                {/* ── Left 8 Cols: Official Contest History Table ── */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Official Contest Round History</h3>
                      <p className="text-xs text-slate-500">Your historical rankings and performance rating delta.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {filteredContests.length} rounds logged
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Contest</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Score</th>
                          <th className="py-2.5 px-3">Rating Delta</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredContests.map((c) => {
                          const isPositive = c.ratingChange > 0;
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-3 font-bold text-slate-900">
                                {c.contestName}
                              </td>
                              <td className="py-3 px-3 text-slate-500 text-[11px]">
                                {c.date}
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-800">
                                #{c.rank} <span className="text-[10px] text-slate-400">/ {c.totalParticipants}</span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-800">
                                {c.score}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
                                    isPositive
                                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                      : 'text-red-700 bg-red-50 border border-red-200'
                                  }`}
                                >
                                  {isPositive ? `+${c.ratingChange}` : c.ratingChange}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <button
                                  onClick={() => showToast(`Opening editorial for ${c.contestName}...`)}
                                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                                >
                                  Editorial →
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ── Right 4 Cols: Top Solvers / Leaderboard ── */}
                <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Medal className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-extrabold text-slate-900">Global Leaderboard</h3>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Top Coders
                      </span>
                    </div>

                    <div className="space-y-2">
                      {LEADERBOARD_PREVIEW.map((user) => (
                        <div
                          key={user.rank}
                          className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between ${
                            user.isUser
                              ? 'bg-emerald-50/80 border-emerald-300 font-bold'
                              : 'bg-slate-50/60 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 text-center text-xs font-bold text-slate-600">
                              {user.badge || `#${user.rank}`}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate">
                                {user.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {user.college}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono font-bold text-slate-900">
                              {user.rating}
                            </div>
                            <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                              {user.tier}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 text-center">
                    <button
                      onClick={() => showToast('Full seasonal leaderboard opening...')}
                      className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      View All 12,400+ Rankings →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

      {/* ── Test Instructions & Agreement Modal ── */}
      {modalTest && (
        <TestInstructionsModal
          test={modalTest}
          isOpen={!!modalTest}
          onClose={() => setModalTest(null)}
        />
      )}
    </>
  );
}
