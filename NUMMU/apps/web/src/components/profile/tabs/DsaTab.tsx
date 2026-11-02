'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Code2,
  CheckCircle2,
  Award,
  Search,
  Zap,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import type { DsaStatistics, DsaSubmission } from '@/types/profile';

const DsaSubmissionModal = dynamic(
  () => import('./DsaSubmissionModal').then((m) => m.DsaSubmissionModal)
);

interface DsaTabProps {
  dsaStats: DsaStatistics;
}

const DIFFICULTY_STYLE = {
  Easy: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
  },
  Medium: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
  },
  Hard: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    bar: 'bg-red-500',
    dot: 'bg-red-500',
  },
};

export function DsaTab({ dsaStats }: DsaTabProps) {
  const [filterDifficulty, setFilterDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<DsaSubmission | null>(null);

  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return dsaStats.recentSubmissions.filter((sub) => {
      const matchesDiff = filterDifficulty === 'All' || sub.difficulty === filterDifficulty;
      const matchesSearch = !q || sub.title.toLowerCase().includes(q);
      return matchesDiff && matchesSearch;
    });
  }, [dsaStats.recentSubmissions, filterDifficulty, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ── KPI Metrics Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Total Solved</span>
            <Code2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {dsaStats.solved.total}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across 7 core algorithmic topics
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Acceptance Rate</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {dsaStats.acceptanceRate}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {dsaStats.totalSubmissions} total submissions
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Global Rank</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            #{dsaStats.globalRank}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Top 5% of NUMU Solvers
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Preferred Language</span>
            <Zap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            C++ / TS
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Average runtime 52ms
          </div>
        </div>
      </div>

      {/* ── Difficulty Breakdown Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Easy */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-900">Easy Problems</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {dsaStats.solved.easy} Solved
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Target: 150</span>
              <span className="font-semibold text-slate-700">
                {Math.round((dsaStats.solved.easy / 150) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(dsaStats.solved.easy / 150) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Medium */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-900">Medium Problems</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {dsaStats.solved.medium} Solved
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Target: 100</span>
              <span className="font-semibold text-slate-700">
                {Math.round((dsaStats.solved.medium / 100) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(dsaStats.solved.medium / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hard */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-900">Hard Problems</span>
            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              {dsaStats.solved.hard} Solved
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Target: 40</span>
              <span className="font-semibold text-slate-700">
                {Math.round((dsaStats.solved.hard / 40) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${(dsaStats.solved.hard / 40) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Topic Mastery Matrix ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Topic-Wise Problem Distribution</h3>
            <p className="text-xs text-slate-500">Mastery percentages across standard LeetCode / NUMU syllabi</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            7 Focus Areas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dsaStats.topTopics.map((topic) => (
            <div
              key={topic.name}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition-all"
            >
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-bold text-slate-800">{topic.name}</span>
                <div className="flex items-center gap-2">
                  {topic.solvedCount && (
                    <span className="text-slate-400 font-medium">
                      {topic.solvedCount}/{topic.totalCount}
                    </span>
                  )}
                  <span className="font-bold text-emerald-700">{topic.percentage}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all"
                  style={{ width: `${topic.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Recent Submissions Log ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Problem Submissions</h3>
            <p className="text-xs text-slate-500">Latest solved code challenges and verifications</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search problem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs w-44 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Filter Buttons */}
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setFilterDifficulty(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterDifficulty === diff
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        <div className="divide-y divide-slate-100">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((sub) => {
              const diffStyle = DIFFICULTY_STYLE[sub.difficulty];
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/90 px-3 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                        <span>{sub.title}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{sub.timeAgo}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500 font-semibold">{sub.language}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        ⚡ {sub.runtime}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        💾 {sub.memory}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${diffStyle.bg}`}
                    >
                      {sub.difficulty}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No problem submissions matched your search.
            </div>
          )}
        </div>
      </div>

      {/* Submission Inspector Modal */}
      {selectedSubmission && (
        <DsaSubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
        />
      )}
    </div>
  );
}
