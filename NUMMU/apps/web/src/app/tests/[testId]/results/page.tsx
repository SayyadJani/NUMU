'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { testsService } from '@/services/tests.service';
import type { FinalizeTestResult } from '@/types/tests';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  ArrowRight,
  Code2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function TestResultsPage() {
  const params = useParams();
  const rawTestId = params ? (params['testId'] as string) : 'weekly-dsa-12';
  const testId = rawTestId || 'weekly-dsa-12';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinalizeTestResult | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchResults() {
      try {
        setLoading(true);
        setError(null);
        const data = await testsService.getAttemptResult(testId);
        if (isMounted) {
          setResult(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.response?.data?.message || err?.message || 'Failed to fetch test results.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchResults();
    return () => {
      isMounted = false;
    };
  }, [testId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">Calculating authoritative assessment results...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col">
        <Header />
        <div className="flex-1 max-w-xl mx-auto px-4 py-16 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Results Available</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'You have not submitted an attempt for this test yet.'}</p>
          <Link
            href={`/tests/${testId}` as any}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition"
          >
            Go to Test Instructions
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const passed = result.passed;
  const percentage = result.percentage;
  const score = result.score;
  const totalMarks = result.totalMarks;
  const stats = result.stats || {
    totalQuestions: result.questions?.length || 5,
    correctCount: 0,
    partialCount: 0,
    incorrectCount: 0,
    unattemptedCount: 0,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/dashboard/tests" className="hover:text-emerald-700 transition-colors">
            Tests
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/tests/${testId}` as any} className="hover:text-emerald-700 transition-colors truncate">
            {result.testTitle}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-700">Results</span>
        </div>

        {/* ── Main Performance Hero Card ── */}
        <div className={`p-8 sm:p-10 rounded-3xl border shadow-sm relative overflow-hidden ${
          passed
            ? 'bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 border-emerald-200/90'
            : 'bg-gradient-to-br from-white via-rose-50/30 to-amber-50/20 border-rose-200/90'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  passed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {passed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>ASSESSMENT PASSED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-700" />
                      <span>NEEDS PRACTICE</span>
                    </>
                  )}
                </span>

                {passed && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>+150 XP Awarded</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {result.testTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Time Spent: {result.totalMinutesSpent || 45} mins</span>
                </span>
                <span>•</span>
                <span>
                  Submitted on {new Date(result.submittedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Score Ring / Hero Stat */}
            <div className="flex items-center gap-5 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
              <div className="text-center px-2">
                <div className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  passed ? 'text-emerald-700' : 'text-slate-800'
                }`}>
                  {score}
                  <span className="text-xl sm:text-2xl font-bold text-slate-400">/{totalMarks}</span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Final Score ({percentage}%)
                </div>
              </div>
            </div>
          </div>

          {/* Quick Breakdown Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-200/60">
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60">
              <div className="text-xl font-bold text-emerald-700">{stats.correctCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Full Score (Accepted)</div>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60">
              <div className="text-xl font-bold text-amber-600">{stats.partialCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Partial Credit</div>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60">
              <div className="text-xl font-bold text-rose-600">{stats.incorrectCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Wrong / Failed</div>
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60">
              <div className="text-xl font-bold text-slate-500">{stats.unattemptedCount}</div>
              <div className="text-[11px] font-semibold text-slate-500">Unattempted</div>
            </div>
          </div>
        </div>

        {/* ── Per-Question Detailed Breakdown ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Question-by-Question Evaluation</h2>
            <span className="text-xs text-slate-500">
              {result.questions?.length || 0} Questions Evaluated
            </span>
          </div>

          <div className="space-y-3">
            {result.questions?.map((q) => {
              const isExpanded = expandedQuestion === q.number;
              const isAccepted = q.verdict === 'ACCEPTED';
              const hasScore = q.marksAwarded > 0;

              return (
                <div
                  key={q.number}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => setExpandedQuestion(isExpanded ? null : q.number)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : hasScore
                          ? 'bg-amber-100 text-amber-800'
                          : q.status === 'SUBMITTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {q.number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {q.title}
                          </h3>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            q.difficulty === 'EASY' || q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            q.difficulty === 'HARD' || q.difficulty === 'Hard' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {q.difficulty}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Status: <strong>{q.status}</strong></span>
                          {q.totalTests > 0 && (
                            <>
                              <span>•</span>
                              <span>Testcases: {q.testsPassed}/{q.totalTests} Passed</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">
                          {q.marksAwarded} / {q.maxMarks}
                        </div>
                        <div className={`text-[10px] font-bold uppercase ${
                          isAccepted ? 'text-emerald-700' : hasScore ? 'text-amber-600' : 'text-slate-400'
                        }`}>
                          {q.verdict || (q.status === 'UNATTEMPTED' ? 'Not Attempted' : 'Submitted')}
                        </div>
                      </div>

                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Code & Details */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Code2 className="w-4 h-4 text-slate-400" />
                          <span>Submitted Solution ({q.language})</span>
                        </span>
                        <Link
                          href={`/problems/${q.slug}` as any}
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                        >
                          <span>Open in Practice Mode</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {q.code ? (
                        <pre className="p-4 rounded-xl bg-[#1e1e24] text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                          <code>{q.code}</code>
                        </pre>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No code submitted for this question.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Actions Footer ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <Link
            href="/dashboard/tests"
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            Back to Tests Catalog
          </Link>

          <Link
            href="/dashboard/dsa"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-sm hover:shadow"
          >
            <span>Practice More DSA Problems</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
