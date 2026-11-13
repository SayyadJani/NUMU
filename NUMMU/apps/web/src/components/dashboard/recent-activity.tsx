'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { History, CheckCircle2, AlertCircle } from 'lucide-react';
import { progressService } from '@/services/progress.service';
import type { SubmissionListItem } from '@numu/types';

function formatRelativeTime(isoDate: string | Date): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function RecentActivity() {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);

  useEffect(() => {
    let isMounted = true;
    progressService
      .getSubmissionHistory({ limit: 5 })
      .then((res) => {
        if (isMounted) setSubmissions(res.items || []);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <History className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Recent Judge0 Submissions</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">Live PostgreSQL</span>
        </div>

        <div className="space-y-3">
          {submissions.length > 0 ? (
            submissions.map((sub) => {
              const isAccepted = sub.verdict === 'ACCEPTED';
              const verdictText = (sub.verdict || sub.status || 'COMPLETED').replace(/_/g, ' ');

              return (
                <Link
                  key={sub.id}
                  href={`/dashboard/dsa/problems/${sub.problemSlug}` as React.ComponentProps<typeof Link>['href']}
                  className="flex items-start gap-2.5 text-xs p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                      isAccepted
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        : 'bg-amber-50 border-amber-200 text-amber-600'
                    }`}
                  >
                    {isAccepted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 leading-tight truncate">
                      {sub.problemTitle}
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      {verdictText} • {sub.language.toUpperCase()}
                      {sub.runtimeMs ? ` • ${sub.runtimeMs}ms` : ''}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                        isAccepted
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}
                    >
                      {isAccepted ? 'Accepted ✓' : `${sub.testsPassed ?? 0}/${sub.totalTests ?? 10}`}
                    </span>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {formatRelativeTime(sub.createdAt)}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No code submissions yet. Solve a problem from the curriculum to start tracking!
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 text-center">
        <Link
          href="/dashboard/dsa"
          className="text-xs font-bold text-[#0b5c39] hover:underline cursor-pointer"
        >
          View All Curriculum Submissions →
        </Link>
      </div>
    </div>
  );
}
