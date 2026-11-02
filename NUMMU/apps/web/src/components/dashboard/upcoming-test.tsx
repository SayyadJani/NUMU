'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Clock, HelpCircle, ArrowRight, Building2 } from 'lucide-react';
import { DUMMY_UPCOMING_TEST } from '@/data/dashboard-mock';

export function UpcomingTest() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left group hover:border-emerald-300 transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shadow-2xs">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Placement Assessment</span>
          </div>
          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
            Mandatory
          </span>
        </div>

        {/* Test Name */}
        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1 group-hover:text-[#0b5c39] transition-colors">
          {DUMMY_UPCOMING_TEST.title}
        </h3>
        <p className="text-[11px] text-slate-500 mb-3 flex items-center gap-1">
          <Building2 className="w-3 h-3 text-slate-400" />
          <span>{DUMMY_UPCOMING_TEST.organization}</span>
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>{DUMMY_UPCOMING_TEST.questionsCount} Questions</span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{DUMMY_UPCOMING_TEST.duration}</span>
          </div>
        </div>

        {/* Syllabus Tag */}
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] text-slate-600 mb-3">
          <strong className="text-slate-700">Syllabus: </strong>
          {DUMMY_UPCOMING_TEST.syllabus}
        </div>
      </div>

      {/* Action Button linking to attempt page */}
      <div className="pt-2 border-t border-slate-100">
        <Link
          href={`/tests/${DUMMY_UPCOMING_TEST.testId}/attempt` as React.ComponentProps<typeof Link>['href']}
          className="w-full py-2.5 rounded-xl bg-[#0b5c39] hover:bg-[#08482c] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] cursor-pointer"
        >
          <span>Start Assessment</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
