'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Clock, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';

interface LiveTestItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  weekNumber: number | null;
  durationMinutes: number;
  passPercentage: number;
  totalMarks: number;
  questionsCount?: number;
  _count?: { questions?: number };
  myAttemptStatus?: string | null;
  myLatestAttempt?: {
    status: string;
    score: number;
    percentage: number;
    passed: boolean;
  } | null;
}

export function UpcomingTest() {
  const [tests, setTests] = useState<LiveTestItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<LiveTestItem[] | { items: LiveTestItem[] }>(ENDPOINTS.TESTS.LIST)
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : res?.items ?? [];
        setTests(list);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Prefer an unattempted or in-progress test, or fall back to the first published test
  const activeTest =
    tests.find((t) => !t.myLatestAttempt || t.myLatestAttempt.status === 'IN_PROGRESS') ??
    tests[0];

  const qCount = activeTest?.questionsCount ?? activeTest?._count?.questions ?? 3;
  const isCompleted = activeTest?.myLatestAttempt?.status === 'SUBMITTED';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left group hover:border-emerald-300 transition-all">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shadow-2xs">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Proctored Assessment</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isCompleted
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-purple-700 bg-purple-50 border-purple-200'
            }`}
          >
            {isCompleted ? `Scored ${activeTest?.myLatestAttempt?.percentage ?? 0}%` : 'Published'}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1 group-hover:text-[#0b5c39] transition-colors">
          {activeTest ? activeTest.title : 'Weekly DSA Proctored Assessment'}
        </h3>
        <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Fullscreen & Tab-Switch Proctoring Enabled</span>
        </p>

        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{qCount} Coding Questions</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{activeTest ? `${activeTest.durationMinutes} Mins` : '60 Mins'}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-600 mb-3 line-clamp-2">
          <strong className="text-slate-700">Details: </strong>
          {activeTest?.description ||
            'Proctored coding evaluation covering core DSA curriculum topics.'}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-100">
        <Link
          href={
            (activeTest ? `/tests/${activeTest.id}` : '/tests') as React.ComponentProps<
              typeof Link
            >['href']
          }
          className="w-full py-2.5 rounded-xl bg-[#0b5c39] hover:bg-[#08482c] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] cursor-pointer"
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>View Results & All Tests ({tests.length})</span>
            </>
          ) : (
            <>
              <span>Open Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Link>
      </div>
    </div>
  );
}
