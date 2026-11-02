'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { testsService } from '@/services/tests.service';
import { useAuth } from '@/contexts/auth-context';
import {
  Clock,
  HelpCircle,
  FileCode2,
  CheckSquare2,
  Target,
  Repeat,
  Terminal,
  Monitor,
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  ListFilter,
  UserCheck,
  TrendingUp,
  Calendar,
  Bookmark,
  Quote,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function TestInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const rawTestId = params ? (params['testId'] as string) : 'weekly-dsa-12';
  const testId = rawTestId || 'weekly-dsa-12';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'Instructions' | 'Syllabus' | 'Discussion'>('Instructions');
  const [agreed, setAgreed] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let isMounted = true;
    async function fetchTest() {
      try {
        setLoading(true);
        setError(null);
        const data = await testsService.getTestBySlug(testId);
        if (isMounted) {
          setTestData(data);
          // If already submitted, navigate directly to results
          if (data?.userAttempt?.status === 'SUBMITTED') {
            router.replace(`/tests/${testId}/results`);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load test details.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTest();
    return () => {
      isMounted = false;
    };
  }, [testId, router]);

  const sidebarLinks = [
    { label: 'All Tests', icon: ListFilter, count: 1 },
    { label: 'My Tests', icon: UserCheck, count: 1 },
    { label: 'Performance', icon: TrendingUp },
    { label: 'Calendar', icon: Calendar },
    { label: 'Bookmarks', icon: Bookmark, count: 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading weekly assessment instructions...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <Header />
        <div className="flex-1 max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Test Not Available</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'This test could not be found or is not currently open.'}</p>
          <Link
            href="/dashboard/tests"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition"
          >
            Back to Tests Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const durationMinutes = testData.durationMinutes || 90;
  const questionsCount = testData.totalQuestions || testData.questions?.length || 5;
  const passPercentage = testData.passPercentage || 60;
  const totalMarks = testData.totalMarks || 100;
  const userAttempt = testData.userAttempt;
  const isAttemptActive = userAttempt && userAttempt.status === 'IN_PROGRESS';

  const instructionItems = [
    {
      label: 'Duration',
      value: `${durationMinutes} minutes`,
      icon: Clock,
    },
    {
      label: 'Total Questions',
      value: `${questionsCount} Coding Problems`,
      icon: HelpCircle,
    },
    {
      label: 'Question Types',
      value: 'Algorithmic Problem Solving (Function & Standard I/O)',
      icon: FileCode2,
    },
    {
      label: 'Total Marks',
      value: `${totalMarks} Marks (Evenly distributed per question)`,
      icon: CheckSquare2,
    },
    {
      label: 'Passing Score',
      value: `${passPercentage}% (${Math.round((passPercentage / 100) * totalMarks)} marks)`,
      icon: Target,
    },
    {
      label: 'Multiple Submissions',
      value: 'Allowed per question within allotted duration',
      icon: Repeat,
    },
    {
      label: 'Supported Languages',
      value: 'Python, C++, Java, JavaScript, TypeScript',
      icon: Terminal,
    },
    {
      label: 'Execution Engine',
      value: 'Judge0 Isolated Sandboxed Code Execution',
      icon: Monitor,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* ── Left Sidebar ── */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tests
              </div>

              <nav className="space-y-1">
                {sidebarLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.label === 'All Tests';

                  return (
                    <Link
                      key={item.label}
                      href="/dashboard/tests"
                      className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            isActive ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.count !== undefined && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quote Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 text-xs text-slate-600">
              <Quote className="w-4 h-4 text-emerald-600 mb-2" />
              <p className="italic leading-relaxed font-medium">
                &ldquo;Consistent practice builds extraordinary developers.&rdquo;
              </p>
              <div className="mt-2 text-[10px] font-bold text-emerald-800 font-mono">
                — NUMU
              </div>
            </div>
          </aside>

          {/* ── Main Instructions Area ── */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Link href="/dashboard/tests" className="hover:text-emerald-700 transition-colors">
                Tests
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-slate-700 truncate">{testData.title}</span>
            </div>

            {/* Test Header */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {testData.title}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Assessment
                </span>
                {testData.weekNumber && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    Week {testData.weekNumber}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                <span>{questionsCount} Questions</span>
                <span>•</span>
                <span>{durationMinutes} mins</span>
                <span>•</span>
                <span>{totalMarks} Total Marks</span>
                <span>•</span>
                <span>{passPercentage}% Pass Rate</span>
              </div>
            </div>

            {/* Navigation Tabs (Instructions / Syllabus / Discussion) */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              {(['Instructions', 'Syllabus', 'Discussion'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                      isActive ? 'text-emerald-800' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0b5c39] rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: Test Instructions Card */}
            {activeTab === 'Instructions' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Assessment Instructions</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please read the guidelines carefully before starting the assessment
                  </p>
                </div>

                {/* Instructions Table / Grid */}
                <div className="divide-y divide-slate-100 text-xs">
                  {instructionItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-3 text-slate-600 font-semibold sm:w-56 shrink-0">
                          <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{item.label}</span>
                        </div>
                        <div className="text-slate-900 font-medium whitespace-pre-line text-left sm:text-right flex-1">
                          {item.value}
                        </div>
                      </div>
                    );
                  })}

                  {/* Rules Item */}
                  <div className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="flex items-center gap-3 text-slate-600 font-semibold sm:w-56 shrink-0">
                      <ShieldAlert className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Rules & Integrity</span>
                    </div>
                    <ul className="text-slate-700 text-xs space-y-1 list-disc list-inside text-left sm:text-right flex-1">
                      <li>Your code is automatically autosaved in the background every few seconds</li>
                      <li>Authoritative server-side timer expires precisely at the deadline</li>
                      <li>Both sample and hidden test cases determine full question credit</li>
                      <li>Unsubmitted code at deadline is auto-finalized and scored</li>
                    </ul>
                  </div>
                </div>

                {/* Agreement Banner */}
                <label className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-700 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="leading-relaxed">
                    By starting this test, you agree to follow the rules and maintain academic integrity.
                  </div>
                </label>

                {/* Actions: Cancel & Start/Resume Test */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Link
                    href="/dashboard/tests"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </Link>

                  {!isAuthenticated ? (
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(`/tests/${testData.slug || testId}/attempt`)}` as any}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm"
                    >
                      <span>Log in to Start Test</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : agreed ? (
                    <Link
                      href={`/tests/${testData.slug || testId}/attempt` as any}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm"
                    >
                      <span>{isAttemptActive ? 'Resume Test' : 'Start Test'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-200 text-slate-400 text-xs font-bold cursor-not-allowed">
                      <span>{isAttemptActive ? 'Resume Test' : 'Start Test'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Syllabus */}
            {activeTab === 'Syllabus' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">Covered Topics & Concepts</h3>
                <div className="flex flex-wrap gap-2">
                  {testData.topics && testData.topics.length > 0 ? (
                    testData.topics.map((t: any) => (
                      <span
                        key={t.slug || t.name}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                      >
                        {t.name}
                      </span>
                    ))
                  ) : (
                    ['Arrays', 'Strings', 'Two Pointers', 'Stack', 'Dynamic Programming'].map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                      >
                        {t}
                      </span>
                    ))
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">Problems Included in this Assessment</h4>
                  <div className="space-y-2">
                    {testData.questions?.map((q: any) => (
                      <div key={q.order} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-800">Problem {q.order}: {q.title}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            q.difficulty === 'EASY' || q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                            q.difficulty === 'HARD' || q.difficulty === 'Hard' ? 'bg-rose-100 text-rose-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {q.difficulty}
                          </span>
                          <span className="text-slate-500 font-medium">{q.marks} Marks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Discussion */}
            {activeTab === 'Discussion' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-6 text-center py-12 text-slate-400 text-xs">
                Discussions and editorial solutions will unlock after the test period concludes.
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
