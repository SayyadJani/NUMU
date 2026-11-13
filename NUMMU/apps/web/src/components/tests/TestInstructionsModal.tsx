'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { testsService } from '@/services/tests.service';
import type { TestItem } from '@/types/tests';
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
  ShieldCheck,
  ArrowRight,
  X,
  Loader2,
  Layers,
  Award,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface TestInstructionsModalProps {
  test: TestItem;
  isOpen: boolean;
  onClose: () => void;
}

export function TestInstructionsModal({
  test,
  isOpen,
  onClose,
}: TestInstructionsModalProps) {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'instructions' | 'syllabus'>('instructions');
  const [loading, setLoading] = useState(false);
  const [fullTest, setFullTest] = useState<any>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && (test.slug || test.id)) {
      setLoading(true);
      testsService
        .getTestBySlug(test.slug || test.id)
        .then((data) => {
          if (isMounted) {
            setFullTest(data);
          }
        })
        .catch(() => {
          // Fallback to prop test item
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, test.slug, test.id]);

  if (!isOpen) return null;

  const durationMinutes = fullTest?.durationMinutes ?? test.durationMinutes ?? 90;
  const questionsCount = fullTest?.questions?.length ?? test.questionsCount ?? 0;
  const totalMarks = fullTest?.totalMarks ?? 100;
  const passPercentage = fullTest?.passPercentage ?? test.passPercentage ?? 60;
  const passMarks = Math.round((passPercentage / 100) * totalMarks);
  const userAttempt = fullTest?.userAttempt;
  const isSubmitted = userAttempt?.status === 'SUBMITTED';

  const questionsList = fullTest?.questions || [];
  const topicsList = fullTest?.topics || [];

  const handleResetAndRetake = async () => {
    try {
      setIsResetting(true);
      await testsService.resetAttempt(test.slug || test.id);
      window.location.href = `/tests/${test.slug || test.id}/attempt`;
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to reset test run.');
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/90 dark:bg-[#111827]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{fullTest?.title || test.title}</h2>
              {isSubmitted ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                  Completed ({userAttempt.score}/{totalMarks} Marks)
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Assessment
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {questionsCount} Coding Problems • {durationMinutes} mins • {totalMarks} Total Marks • {passPercentage}% Passing Score
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Close instructions modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-6 bg-slate-50/30 dark:bg-slate-900/40 text-xs">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 font-bold transition-all border-b-2 ${
              activeTab === 'instructions'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Instructions & Proctoring
          </button>
          <button
            onClick={() => setActiveTab('syllabus')}
            className={`pb-2.5 font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'syllabus'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Syllabus & Problems</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600 font-mono">
              {questionsCount}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[62vh] overflow-y-auto space-y-4 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-medium">Loading live test syllabus and rules...</span>
            </div>
          ) : activeTab === 'instructions' ? (
            <>
              {isSubmitted && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900">
                  <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold">You have already submitted this assessment.</span> Your recorded score is{' '}
                    <span className="font-bold">{userAttempt?.score} / {totalMarks} marks</span> ({userAttempt?.percentage}%). You can view your scorecard or retake this test run below.
                  </div>
                </div>
              )}

              {/* Assessment Parameters Grid */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-4 bg-slate-50/60">
                <div className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold sm:w-48 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Duration</span>
                  </div>
                  <div className="text-slate-900 font-bold">{durationMinutes} Minutes (Server Authoritative Timer)</div>
                </div>

                <div className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold sm:w-48 shrink-0">
                    <FileCode2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Assessment Format</span>
                  </div>
                  <div className="text-slate-900 font-medium">Algorithmic Problem Solving (Monaco Code Editor)</div>
                </div>

                <div className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold sm:w-48 shrink-0">
                    <CheckSquare2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Total Marks</span>
                  </div>
                  <div className="text-slate-900 font-bold">{totalMarks} Marks</div>
                </div>

                <div className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold sm:w-48 shrink-0">
                    <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Passing Threshold</span>
                  </div>
                  <div className="text-slate-900 font-medium">
                    {passPercentage}% ({passMarks} Marks required to clear)
                  </div>
                </div>

                <div className="py-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold sm:w-48 shrink-0">
                    <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Language Support</span>
                  </div>
                  <div className="text-slate-900 font-medium">Python, C++, Java, JavaScript, TypeScript</div>
                </div>

                <div className="py-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold sm:w-48 shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Proctoring Guardrails</span>
                  </div>
                  <ul className="text-slate-700 text-[11px] space-y-1 list-disc list-inside text-right">
                    <li>Assessment locks into Full-Screen Mode</li>
                    <li>Switching tabs more than 3 times triggers auto-submission</li>
                    <li>Code copy and paste from external sources is disabled</li>
                    <li>Timer counts down continuously and cannot be paused</li>
                  </ul>
                </div>
              </div>

              {/* Agreement Notice */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-2.5 text-emerald-900 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[11px]">
                  By clicking Start Test, you agree to follow NUMU examination integrity rules. All runs and submissions are recorded.
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {/* Topics */}
              {topicsList.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Covered Topics</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {topicsList.map((t: any) => (
                      <span
                        key={t.slug || t.name}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem Breakdown List */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Arranged Problems ({questionsList.length})
                </h4>
                {questionsList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No problems currently assigned to this test.</p>
                ) : (
                  <div className="space-y-2">
                    {questionsList.map((q: any) => (
                      <div
                        key={q.order}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                            {q.order}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs">{q.title}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              q.difficulty === 'EASY' || q.difficulty === 'Easy'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : q.difficulty === 'HARD' || q.difficulty === 'Hard'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <span className="font-mono font-bold text-xs text-slate-700">{q.marks} Marks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 dark:bg-[#111827] border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            {isSubmitted && (
              <>
                <Link
                  href={`/tests/${test.slug || test.id}/results`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all shadow-2xs"
                >
                  <span>View Solutions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={handleResetAndRetake}
                  disabled={isResetting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                  title="Reset proctoring and attempt to take this test again"
                >
                  {isResetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>Retake / Test Run</span>
                </button>
              </>
            )}

            {!isSubmitted && (
              !isAuthenticated ? (
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/tests/${test.slug || test.id}/attempt`)}`}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow"
                >
                  <span>Log in to Start Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <Link
                  href={`/tests/${test.slug || test.id}/attempt`}
                  onClick={() => {
                    if (typeof document !== 'undefined' && !document.fullscreenElement) {
                      document.documentElement.requestFullscreen?.().catch(() => {});
                    }
                  }}
                  className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-sm hover:shadow"
                >
                  <span>Start Test (Full Screen)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
