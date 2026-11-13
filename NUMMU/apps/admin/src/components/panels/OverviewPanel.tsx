'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  FileCode2,
  ClipboardCheck,
  ShieldAlert,
  Activity,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Building2,
  Terminal,
  Award,
  Sparkles,
  Plus,
  Laptop,
  Cpu,
  Database,
} from 'lucide-react';
import { adminApi, type AdminOverviewData } from '@/lib/api';
import {
  StatCard,
  DataTable,
  Button,
  StatusBadge,
} from '@/components/ui/primitives';

export type AdminModuleTab =
  | 'overview'
  | 'dsa-hub'
  | 'questions'
  | 'topics'
  | 'development'
  | 'system-design'
  | 'core-cs'
  | 'tests'
  | 'notifications'
  | 'students'
  | 'batches'
  | 'submissions';

export function OverviewPanel({
  onNavigate,
  onNotify,
}: {
  onNavigate: (tab: AdminModuleTab) => void;
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getOverview();
      setData(res);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load dashboard overview', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  const stats = data?.stats;
  const totalProbs = stats?.totalProblems ?? 0;
  const pubProbs = stats?.publishedProblems ?? 0;
  const pubPercent = totalProbs > 0 ? Math.round((pubProbs / totalProbs) * 100) : 0;
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (pubPercent / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* NUMU Signature Hero Banner (Matches apps/web/src/app/dashboard/dsa/page.tsx) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#06331e] via-[#0b5c39] to-[#08482c] text-white shadow-xs p-6 sm:p-7 flex flex-col justify-between min-h-[220px]">
          {/* Ambient radial emerald glow + subtle tech grid */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-400/20 blur-[80px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:20px_20px] [mask-image:linear-gradient(to_left,rgba(0,0,0,0.8),transparent)]"
            aria-hidden
          />

          <div className="relative z-10 space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-[#cff07c]" />
              NUMU Platform Governance &amp; Live Proctoring
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Engineering Curriculum &amp; Assessment Command Center
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Manage the shared DSA problem bank, arrange proctored weekly assessments with fullscreen &amp; copy-paste locks, and inspect real-time student &amp; cohort performance.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-2.5 pt-5">
            <Button
              className="bg-[#cff07c] hover:bg-[#bde864] text-slate-900 border-none font-extrabold shadow-sm"
              icon={Plus}
              onClick={() => onNavigate('tests')}
            >
              Arrange Weekly Test
            </Button>
            <button
              type="button"
              onClick={() => onNavigate('questions')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-xs"
            >
              + Problem / Bulk Upload
            </button>
            <button
              type="button"
              onClick={loadOverview}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sync Live Metrics</span>
            </button>
          </div>
        </div>

        {/* Right Readiness & Pass Rate Donut Card (Matches apps/web Donut Stat Card) */}
        <div className="lg:col-span-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Repository & Judge0 Health
              </span>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">
                Content & Verdict Readiness
              </h3>
            </div>
            <StatusBadge value="PUBLISHED" label="Live Shared DB" />
          </div>

          <div className="flex items-center gap-5 my-3">
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 88 88">
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="8"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="36"
                  fill="none"
                  stroke="#0b5c39"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-slate-900 leading-none">
                  {pubProbs}/{totalProbs}
                </span>
                <span className="text-[9px] font-bold uppercase text-slate-400 mt-0.5">
                  Published
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Published DSA</span>
                <span className="font-extrabold text-emerald-700">{pubProbs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Draft Queue</span>
                <span className="font-extrabold text-amber-600">{stats?.draftProblems ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Judge0 AC Rate</span>
                <span className="font-extrabold text-slate-900">
                  {stats?.submissionPassRate ?? 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Avg Test Score</span>
                <span className="font-extrabold text-[#0b5c39]">
                  {stats?.averageAssessmentScore ?? 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">
              Active Students: <strong className="text-slate-800">{stats?.activeStudents ?? 0}</strong>
            </span>
            <button
              onClick={() => onNavigate('submissions')}
              className="font-bold text-[#0b5c39] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              Inspect Verdicts <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards — Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Enrolled Students"
          value={stats?.totalStudents ?? 0}
          sublabel={`${stats?.activeStudents ?? 0} active • ${stats?.inactiveStudents ?? 0} inactive`}
          icon={Users}
          tone="emerald"
        />
        <StatCard
          label="DSA Problem Bank"
          value={stats?.totalProblems ?? 0}
          sublabel={`${stats?.publishedProblems ?? 0} published • ${stats?.draftProblems ?? 0} draft`}
          icon={FileCode2}
          tone="blue"
        />
        <StatCard
          label="Assessments & Attempts"
          value={`${stats?.publishedTests ?? 0} / ${stats?.totalTests ?? 0}`}
          sublabel={`${stats?.completedAttempts ?? 0} completed • ${stats?.ongoingAttempts ?? 0} ongoing`}
          icon={ClipboardCheck}
          tone="purple"
        />
        <StatCard
          label="Proctoring Auto-Submits"
          value={stats?.autoSubmittedAttempts ?? 0}
          sublabel="Terminated for >3 tab switches"
          icon={ShieldAlert}
          tone="rose"
        />
      </div>

      {/* KPI Cards — Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Judge0 Submissions"
          value={stats?.totalSubmissions ?? 0}
          sublabel={`${stats?.submissionPassRate ?? 0}% overall acceptance rate`}
          icon={Terminal}
          tone="emerald"
        />
        <StatCard
          label="Avg Assessment Score"
          value={`${stats?.averageAssessmentScore ?? 0}%`}
          sublabel={`Across ${stats?.completedAttempts ?? 0} completed test papers`}
          icon={Award}
          tone="amber"
        />
        <StatCard
          label="Curriculum Topics"
          value={stats?.totalTopics ?? 0}
          sublabel="Active DSA syllabus domains"
          icon={BookOpen}
          tone="blue"
        />
        <StatCard
          label="Batches & Cohorts"
          value={stats?.totalBatches ?? 0}
          sublabel="College & training organizations"
          icon={Building2}
          tone="purple"
        />
      </div>

      {/* Practice Tracks & Hub Management */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Practice Tracks &amp; Hub Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live curriculum pipelines powering student /dashboard/dsa, /development, /system-design, and /core
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            4 Live Tracks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('dsa-hub')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70">
                <Sparkles className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-black text-slate-900 group-hover:text-[#0b5c39] transition-colors">
                DSA Practice Hub
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Daily challenge schedules, Today&apos;s practice bank &amp; featured placement mock.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('development')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/70">
                <Laptop className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                Development Track
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Full-stack capstones, sprint deliverables, starter repos &amp; hands-on modules.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('system-design')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/70">
                <Cpu className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-black text-slate-900 group-hover:text-purple-700 transition-colors">
                System Design
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                Fundamentals, HLD, LLD &amp; real-world architectural scenario challenges.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('core-cs')}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
                <Database className="w-4 h-4" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                Core CS Hub
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                DBMS, OS, Computer Networks &amp; OOPs syllabus outlines and interview question bank.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Problem Bank & Bulk Upload',
            desc: 'Create or bulk-import DSA questions (JSON/CSV), test cases, and language boilerplates.',
            tab: 'questions' as const,
          },
          {
            title: 'Topics & Curriculum',
            desc: 'Manage syllabus topics, Easy/Medium/Hard balance, and student topic accuracy.',
            tab: 'topics' as const,
          },
          {
            title: 'Assessments & Proctoring',
            desc: 'Arrange weekly tests, enforce fullscreen & copy-paste locks, and reassign attempts.',
            tab: 'tests' as const,
          },
          {
            title: 'Student 360° Analytics',
            desc: 'Inspect student-wise DSA progress, weak topics, test trends, and account status.',
            tab: 'students' as const,
          },
          {
            title: 'Batches & Cohort Analytics',
            desc: 'Group students into batches, compare cohort accuracy, and flag inactive students.',
            tab: 'batches' as const,
          },
          {
            title: 'Judge0 Submission Monitor',
            desc: 'Inspect real-time student code executions, verdicts, runtime/memory, and compiler logs.',
            tab: 'submissions' as const,
          },
        ].map((card) => (
          <div
            key={card.title}
            onClick={() => onNavigate(card.tab)}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between gap-4 group"
          >
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#0b5c39] transition-colors">
                {card.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{card.desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        ))}
      </div>

      {/* Live Tables: Recent Test Attempts & Recent Code Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <ClipboardCheck className="w-4 h-4 text-emerald-700" />
              Recent Proctored Test Attempts
            </h3>
          </div>
          <DataTable
            loading={loading}
            rows={data?.recentAttempts || []}
            rowKey={(a: any) => a.id}
            emptyMessage="No test attempts recorded yet."
            columns={[
              {
                key: 'student',
                header: 'Student',
                render: (a: any) => (
                  <div>
                    <div className="font-bold text-slate-900">{a.user?.name || a.user?.email}</div>
                    <div className="text-[11px] text-slate-400">{a.test?.title}</div>
                  </div>
                ),
              },
              {
                key: 'score',
                header: 'Score',
                render: (a: any) => (
                  <span className="font-bold text-slate-800">
                    {a.score}/{a.test?.totalMarks ?? 100} ({a.percentage}%)
                  </span>
                ),
              },
              {
                key: 'switches',
                header: 'Tab Switches',
                render: (a: any) => (
                  <div className="flex items-center gap-1.5">
                    <span
                      className={
                        a.tabSwitchCount > 0
                          ? 'font-bold text-rose-600'
                          : 'text-emerald-700 font-semibold'
                      }
                    >
                      {a.tabSwitchCount ?? 0}/{a.test?.maxTabSwitches ?? 3}
                    </span>
                    {a.autoSubmitted && <StatusBadge value="VIOLATION" label="Auto-Ended" />}
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (a: any) => <StatusBadge value={a.status} />,
              },
            ]}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-700" />
              Recent Code Submissions ({stats?.submissionPassRate ?? 0}% AC Rate)
            </h3>
          </div>
          <DataTable
            loading={loading}
            rows={data?.recentSubmissions || []}
            rowKey={(s: any) => s.id}
            emptyMessage="No code submissions yet."
            columns={[
              {
                key: 'student',
                header: 'Student',
                render: (s: any) => (
                  <div>
                    <div className="font-bold text-slate-900">{s.user?.name || s.user?.email}</div>
                    <div className="text-[11px] text-slate-400">{s.problem?.title}</div>
                  </div>
                ),
              },
              {
                key: 'lang',
                header: 'Lang',
                render: (s: any) => (
                  <span className="font-mono uppercase text-[11px]">{s.language}</span>
                ),
              },
              {
                key: 'verdict',
                header: 'Verdict',
                render: (s: any) => <StatusBadge value={s.verdict} />,
              },
              {
                key: 'tests',
                header: 'Tests',
                render: (s: any) => (
                  <span className="font-mono text-slate-600">
                    {s.testsPassed}/{s.totalTests}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
