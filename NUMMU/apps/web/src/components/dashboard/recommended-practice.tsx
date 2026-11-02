'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, Code2, ArrowRight } from 'lucide-react';
import { DUMMY_RECOMMENDED_PROBLEMS, type DashboardProblem } from '@/data/dashboard-mock';

const CATEGORIES = ['All', 'Two Pointers', 'Binary Search', 'Strings'];

export function RecommendedPractice() {
  const [problems, setProblems] = useState<DashboardProblem[]>(DUMMY_RECOMMENDED_PROBLEMS);
  const [activeCategory, setActiveCategory] = useState('All');

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

  const filtered = problems.filter((p) =>
    activeCategory === 'All' ? true : p.category.includes(activeCategory)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Code2 className="w-4 h-4 text-teal-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Recommended Practice</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Based on your weak areas</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors shrink-0 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Problem List */}
        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
          {filtered.map((prob) => {
            let diffStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            if (prob.difficulty === 'Medium') diffStyle = 'bg-amber-50 text-amber-700 border-amber-200';
            if (prob.difficulty === 'Hard') diffStyle = 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div
                key={prob.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/60 transition-all group"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${diffStyle}`}
                    >
                      {prob.difficulty}
                    </span>
                    <span className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0b5c39] transition-colors">
                      {prob.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {prob.category} • Acc: {prob.acceptance}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => toggleBookmark(prob.id, e)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title={prob.isBookmarked ? 'Remove Bookmark' : 'Bookmark Problem'}
                  >
                    {prob.isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  <Link
                    href={prob.link as React.ComponentProps<typeof Link>['href']}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Solve</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 text-center">
        <Link
          href="/dashboard/dsa"
          className="text-xs font-bold text-[#0b5c39] hover:underline"
        >
          View 500+ Curated Problems →
        </Link>
      </div>
    </div>
  );
}
