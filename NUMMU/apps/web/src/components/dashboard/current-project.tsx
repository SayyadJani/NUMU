'use client';

import React, { useState } from 'react';
import { FolderGit2, ExternalLink, CheckCircle2, GitPullRequest, Star } from 'lucide-react';
import { DUMMY_PROJECT } from '@/data/dashboard-mock';

export function CurrentProject() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left group hover:border-emerald-300 transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <FolderGit2 className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Active Capstone</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            In Review
          </span>
        </div>

        {/* Project Title & Description */}
        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-1 group-hover:text-[#0b5c39] transition-colors">
          {DUMMY_PROJECT.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-3">
          {DUMMY_PROJECT.description}
        </p>

        {/* Milestone & Progress */}
        <div className="space-y-1.5 mb-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Sprint 3 of 5</span>
            <span className="font-mono font-bold text-emerald-700">{DUMMY_PROJECT.progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${DUMMY_PROJECT.progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 pt-0.5">
            <strong>Next: </strong>
            {DUMMY_PROJECT.nextMilestone}
          </div>
        </div>

        {/* GitHub link & stats */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
          <a
            href={DUMMY_PROJECT.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-semibold"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Repository</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
            <Star className="w-3 h-3 fill-amber-400" />
            {DUMMY_PROJECT.stars} stars
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setIsSubmitted(true)}
          disabled={isSubmitted}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
            isSubmitted
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-[#0b5c39] hover:bg-[#08482c] text-white active:scale-[0.98]'
          }`}
        >
          {isSubmitted ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sprint Submitted for Review ✓</span>
            </>
          ) : (
            <span>Submit Sprint for Review</span>
          )}
        </button>
      </div>
    </div>
  );
}
