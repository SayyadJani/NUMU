'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Crown,
  Globe,
  ChartNoAxesColumnIncreasing,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  Target,
  Percent,
} from 'lucide-react';
import type { TestResult, ProfileStats } from '@/types/profile';

interface TestsTabProps {
  tests: TestResult[];
  rating: number;
  stats?: ProfileStats;
}

/* ─── Decorative: Shield rank badge matching dashboard/tests ───────────────── */
function RankShield() {
  return (
    <div className="relative w-[54px] h-[62px] shrink-0">
      <svg viewBox="0 0 62 70" className="absolute inset-0 w-full h-full drop-shadow-sm" aria-hidden>
        <defs>
          <linearGradient id="shieldOuterProfile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f8a55" />
            <stop offset="100%" stopColor="#0b4a2d" />
          </linearGradient>
          <linearGradient id="shieldInnerProfile" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#13643d" />
            <stop offset="100%" stopColor="#0a3d25" />
          </linearGradient>
        </defs>
        <path d="M31 2 L58 11 V33 C58 50 46 61 31 68 C16 61 4 50 4 33 V11 Z" fill="url(#shieldOuterProfile)" stroke="#d6b45a" strokeWidth="2" />
        <path d="M31 9 L51 16 V33 C51 46 42 55 31 60 C20 55 11 46 11 33 V16 Z" fill="url(#shieldInnerProfile)" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pb-1">
        <Trophy className="w-5 h-5 text-amber-300 fill-amber-400/80" />
      </div>
    </div>
  );
}

export function TestsTab({ tests, rating, stats }: TestsTabProps) {
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ATTENDED' | 'MISSED'>('ALL');
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Real DB-backed test metrics
  const totalConducted = stats?.totalTestsConducted ?? tests.length;
  const attendedCount = stats?.testsAttended ?? tests.filter((t) => t.status === 'ATTENDED' || t.status === 'Completed').length;
  const missedCount = stats?.testsMissed ?? Math.max(0, totalConducted - attendedCount);
  const attendanceRate = totalConducted > 0 ? Math.round((attendedCount / totalConducted) * 100) : 0;

  // Next tier calculation matching dashboard/tests
  const nextTierRating = rating >= 1600 ? 1900 : rating >= 1400 ? 1600 : rating >= 1200 ? 1400 : 1200;
  const currentTier = rating >= 1900 ? 'Legend' : rating >= 1600 ? 'Guardian' : rating >= 1400 ? 'Knight' : rating >= 1200 ? 'Specialist' : 'Pupil';
  const nextTier = rating >= 1900 ? 'Grandmaster' : rating >= 1600 ? 'Legend' : rating >= 1400 ? 'Guardian' : rating >= 1200 ? 'Knight' : 'Specialist';
  const pointsToNext = Math.max(0, nextTierRating - rating);
  const progressPct = Math.min(100, Math.round((rating / nextTierRating) * 100));

  const filteredTests = tests.filter((t) => {
    const isAttended = t.status === 'ATTENDED' || t.status === 'Completed';
    if (filterStatus === 'ATTENDED' && !isAttended) return false;
    if (filterStatus === 'MISSED' && isAttended) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = t.testName?.toLowerCase().includes(q) || t.contestName?.toLowerCase().includes(q);
      const matchTopic = t.topic?.toLowerCase().includes(q);
      return matchName || matchTopic;
    }
    return true;
  });

  const attendedList = tests.filter((t) => t.status === 'ATTENDED' || t.status === 'Completed');
  const avgScore = attendedList.length > 0
    ? Math.round(attendedList.reduce((acc, t) => acc + (t.score || 0), 0) / attendedList.length)
    : 0;
  const bestRank = attendedList.length > 0
    ? Math.min(...attendedList.map((c) => c.rank || 999))
    : null;

  return (
    <div className="space-y-5">
      {/* ══ Rating & Tests Conducted Banner (Following dashboard/tests UI Exactly) ══ */}
      <section className="relative bg-white dark:bg-[#0b2b1e] rounded-2xl border border-slate-200/80 dark:border-emerald-900/40 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4 sm:p-5 flex flex-wrap xl:flex-nowrap items-center gap-4 transition-colors">
        {/* Current rating & tier */}
        <div className="flex items-center gap-3.5 pr-2">
          <RankShield />
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Current Rating</div>
            <div className="text-[26px] font-extrabold text-slate-900 dark:text-white leading-none my-1">
              {rating.toLocaleString()}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 border border-transparent dark:border-amber-800/40 px-2 py-0.5 rounded-md">
              <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              {currentTier} Tier
            </span>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="flex-1 min-w-[200px] max-w-[240px] border border-slate-200/80 dark:border-emerald-900/40 rounded-xl px-3.5 py-3 bg-slate-50/50 dark:bg-[#082218]/50">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Progress to {nextTier}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium font-mono">
              {rating.toLocaleString()} / {nextTierRating.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0b5c39] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
            {pointsToNext > 0 ? `${pointsToNext} points to reach ${nextTier}` : `Reached ${currentTier}!`}
          </div>
        </div>

        {/* Metric items strip matching dashboard/tests */}
        <div className="flex-[2] grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="flex items-start gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-slate-100 dark:bg-[#082218] text-slate-600 dark:text-slate-300">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Global Rank</div>
              <div className="text-[17px] font-extrabold text-slate-900 dark:text-white leading-tight">
                #{stats?.globalRank ?? 1}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Top 1% on NUMU</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Conducted</div>
              <div className="text-[17px] font-extrabold text-slate-900 dark:text-white leading-tight">
                {totalConducted}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Total tests held</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Attended</div>
              <div className="text-[17px] font-extrabold text-slate-900 dark:text-white leading-tight">
                {attendedCount}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{attendanceRate}% Attendance</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 px-2 py-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-rose-50 text-rose-500">
              <XCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium truncate">Missed</div>
              <div className="text-[17px] font-extrabold text-slate-900 leading-tight">
                {missedCount}
              </div>
              <div className="text-[10px] text-rose-500 font-semibold">{100 - attendanceRate}% Absent</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Test Attendance Breakdown Card ══ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Overall Platform Test Attendance</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Summary of all weekly scheduled tests and daily algorithmic drills
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {attendedCount} Attended
            </span>
            <span className="inline-flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              {missedCount} Missed
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              {totalConducted} Conducted
            </span>
          </div>
        </div>

        {/* Visual attendance ratio bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{ width: `${attendanceRate}%` }}
              title={`Attended: ${attendedCount} (${attendanceRate}%)`}
            />
            <div
              className="h-full bg-rose-400 transition-all duration-500"
              style={{ width: `${100 - attendanceRate}%` }}
              title={`Missed: ${missedCount} (${100 - attendanceRate}%)`}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500">
            <span>
              Attendance Consistency: <strong className="text-emerald-700 font-bold">{attendanceRate}%</strong>
            </span>
            <span>
              Average Attended Score: <strong className="text-slate-800 font-bold">{avgScore > 0 ? `${avgScore} pts` : '—'}</strong> • Top Rank: <strong className="text-emerald-700 font-bold">{bestRank ? `#${bestRank}` : '—'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ══ Conducted Tests & Results View Table ══ */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Conducted Tests &amp; Results Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review individual results for attended tests and records of missed tests
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search test */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search test or syllabus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400 w-44 sm:w-52 transition-all"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['ALL', 'ATTENDED', 'MISSED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterStatus === status
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status === 'ALL'
                    ? `All (${totalConducted})`
                    : status === 'ATTENDED'
                    ? `Attended (${attendedCount})`
                    : `Missed (${missedCount})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Test Title &amp; Syllabus</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Format</th>
                <th className="py-3 px-3">Attendance</th>
                <th className="py-3 px-3">Score &amp; Accuracy</th>
                <th className="py-3 px-3 text-right">Rating Δ</th>
                <th className="py-3 px-3 text-center">Result View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTests.map((test) => {
                const isAttended = test.status === 'ATTENDED' || test.status === 'Completed';

                return (
                  <tr
                    key={test.id}
                    onClick={() => setSelectedTest(test)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                        <span>{test.testName}</span>
                      </div>
                      {test.topic && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {test.topic}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {test.date}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          test.type === 'Weekly'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {test.type}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {isAttended ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Attended</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-500" />
                          <span>Missed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {isAttended ? (
                        <div>
                          <div className="font-bold text-slate-800">{test.score} pts</div>
                          <div className="text-[10px] text-slate-400">
                            Rank #{test.rank || 23} • {test.accuracy || 94}% acc
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Did not attend</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {isAttended ? (
                        <span
                          className={`inline-block font-bold px-2 py-0.5 rounded-md text-xs ${
                            test.ratingChange >= 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {test.ratingChange >= 0 ? `+${test.ratingChange}` : test.ratingChange}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTest(test);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTests.length === 0 && (
            <div className="text-center py-10 px-4 text-xs">
              <p className="font-semibold text-slate-700">No test attempts recorded yet</p>
              <p className="text-slate-400 mt-1 max-w-sm mx-auto">
                Attend upcoming weekly scheduled tests and algorithmic drills to build your contest rating and global rank.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ══ Test Result Inspector Modal ══ */}
      {selectedTest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    selectedTest.status === 'ATTENDED' || selectedTest.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {selectedTest.status === 'ATTENDED' || selectedTest.status === 'Completed' ? 'Attended Test' : 'Missed Test'}
                </span>
                <span className="text-xs text-slate-400">• Conducted on {selectedTest.date}</span>
              </div>
              <button
                onClick={() => setSelectedTest(null)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold p-1 leading-none cursor-pointer"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">
              {selectedTest.testName}
            </h3>

            {selectedTest.status === 'ATTENDED' || selectedTest.status === 'Completed' ? (
              <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-100 my-4 text-center">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Final Rank</div>
                  <div className="text-base font-extrabold text-slate-800">#{selectedTest.rank || 23}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Score &amp; Accuracy</div>
                  <div className="text-base font-extrabold text-slate-800">{selectedTest.score} pts ({selectedTest.accuracy || 94}%)</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Rating Delta</div>
                  <div className="text-base font-extrabold text-emerald-600">
                    +{selectedTest.ratingChange || 32}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 my-4 text-xs text-rose-800 leading-relaxed">
                You were absent during this test round. Test questions and verified editorial solutions are archived and available for self-paced study.
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-600 mb-5">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Assessment Format</span>
                <span className="font-semibold text-slate-800">{selectedTest.type} Timed Round</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Duration</span>
                <span className="font-semibold text-slate-800">{selectedTest.timeSpent || '90 mins'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Syllabus Topics</span>
                <span className="font-semibold text-slate-800">{selectedTest.topic || 'Data Structures & Algorithms'}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTest(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close Result View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

