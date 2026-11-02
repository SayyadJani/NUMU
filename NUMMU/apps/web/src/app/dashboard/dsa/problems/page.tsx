'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  CheckCircle2,
  PlayCircle,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { dsaService } from '@/services/dsa.service';
import type { TopicItem, Difficulty, PaginatedProblemsResult } from '@numu/types';

const DIFF_BADGE: Record<Difficulty, string> = {
  EASY: 'text-emerald-700 bg-emerald-50 border border-emerald-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border border-amber-200',
  HARD: 'text-red-600 bg-red-50 border border-red-200',
};

const TOPIC_BADGE = 'text-slate-600 bg-slate-100 rounded-md px-2 py-0.5 text-[10px] font-medium';

function StatusIcon({ status }: { status?: string }) {
  if (status === 'solved') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (status === 'attempted') return <PlayCircle className="w-4 h-4 text-amber-400" />;
  return <span className="text-slate-300 text-sm font-bold">—</span>;
}

const TABS = ['All Problems', 'My Solved', 'Bookmarked', 'Company Wise', 'Tags'];

export default function ProblemsPage() {
  const [activeTab, setActiveTab] = useState('All Problems');
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | undefined>(undefined);
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'newest' | 'difficulty' | 'acceptance' | 'popularity'>('newest');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  // Async data states
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [problemsData, setProblemsData] = useState<PaginatedProblemsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch topics once on mount
  useEffect(() => {
    let mounted = true;
    dsaService
      .getTopics()
      .then((data) => {
        if (mounted) setTopics(data);
      })
      .catch((err) => {
        console.warn('Failed to load live topics, falling back gracefully:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch problems on filter/pagination changes
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dsaService.getProblems({
        page,
        limit,
        search: search.trim() || undefined,
        difficulty: selectedDifficulty,
        topic: selectedTopic && selectedTopic !== 'all' ? selectedTopic : undefined,
        sortBy,
      });
      setProblemsData(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load problems';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedDifficulty, selectedTopic, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProblems();
    }, 150); // slight debounce for search
    return () => clearTimeout(timer);
  }, [fetchProblems]);

  const toggleBookmark = async (id: string) => {
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    try {
      await dsaService.toggleBookmark(id);
    } catch {
      // Revert if API fails
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedDifficulty(undefined);
    setSelectedTopic(undefined);
    setPage(1);
  };

  const problems = problemsData?.items || [];
  const total = problemsData?.total || 0;
  const totalPages = problemsData?.totalPages || 1;

  return (
    <div className="flex-1 flex min-h-0 h-[calc(100vh-56px)] overflow-hidden">

          {/* ── Filter sidebar ── */}
          <aside className="w-56 shrink-0 bg-white border-r border-slate-200/80 px-4 py-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-800">Filters</span>
              {(selectedDifficulty || selectedTopic || search) && (
                <button
                  onClick={resetFilters}
                  className="text-[10px] text-emerald-600 font-semibold hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Reset All
                </button>
              )}
            </div>

            {/* Difficulty */}
            <div className="mb-5">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                Difficulty <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
              {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((d) => (
                <label key={d} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={selectedDifficulty === d}
                    onChange={() => {
                      setSelectedDifficulty(selectedDifficulty === d ? undefined : d);
                      setPage(1);
                    }}
                    onClick={() => {
                      if (selectedDifficulty === d) {
                        setSelectedDifficulty(undefined);
                        setPage(1);
                      }
                    }}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600 flex-1 capitalize">
                    {d.toLowerCase()}
                  </span>
                </label>
              ))}
            </div>

            {/* Topic Filter */}
            <div className="mb-5">
              <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                Topics <ChevronRight className="w-3 h-3 text-slate-400" />
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedTopic(undefined);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    !selectedTopic
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  All Topics
                </button>
                {topics.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => {
                      setSelectedTopic(selectedTopic === t.slug ? undefined : t.slug);
                      setPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedTopic === t.slug
                        ? 'bg-emerald-50 text-emerald-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{t.name}</span>
                    {t.problemCount !== undefined && (
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {t.problemCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Reference */}
            <div className="mb-4 pt-3 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 mb-2">Platform</div>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>NUMU Verified DSA</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400" />
                  <span>LeetCode Aligned</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 px-6 py-5 overflow-y-auto min-w-0">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
              <Link href="/dashboard/dsa" className="hover:text-emerald-700 transition-colors">DSA</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600 font-medium">Problems</span>
            </div>

            {/* Page title + stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">DSA Problems</h1>
                <p className="text-sm text-slate-500 mt-0.5">Practice verified algorithmic problems with curated test cases and pattern intuition.</p>
              </div>
              <div className="flex items-center gap-3">
                {[
                  { label: 'Available Problems', value: String(total), color: 'text-slate-900' },
                  { label: 'Difficulty Track', value: selectedDifficulty || 'All Levels', color: 'text-emerald-600' },
                  { label: 'Active Category', value: selectedTopic || 'All Topics', color: 'text-amber-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-center shadow-sm">
                    <div className={`text-base font-extrabold truncate max-w-[130px] ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-200 mb-4">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-2 text-sm font-semibold transition-all relative ${activeTab === t ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {t}
                  {activeTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Search + Sort */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 transition-all"
                  placeholder="Search problems by title, topic, or keyword..."
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 shrink-0">
                <span>Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'difficulty' | 'acceptance' | 'popularity')}
                  className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="newest">Newest</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="acceptance">Acceptance</option>
                  <option value="popularity">Most Popular</option>
                </select>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{total} problems</span>
            </div>

            {/* Table Area with Loading, Error, and Empty States */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[50px_48px_1fr_110px_130px_100px_60px] text-[10px] font-bold text-slate-400 uppercase px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <span>#</span>
                <span>Status</span>
                <span>Problem</span>
                <span>Difficulty</span>
                <span>Topic</span>
                <span>Acceptance</span>
                <span className="text-right">Bookmark</span>
              </div>

              {/* Body */}
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                  <span className="text-xs font-medium">Loading problems catalog...</span>
                </div>
              ) : error ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 px-4 text-center">
                  <AlertCircle className="w-8 h-8 text-rose-500" />
                  <p className="text-sm font-semibold text-slate-800">{error}</p>
                  <button
                    onClick={fetchProblems}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : problems.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 px-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">No problems found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No problems match your current search and filter criteria.
                    </p>
                  </div>
                  <button
                    onClick={resetFilters}
                    className="mt-2 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {problems.map((p, index) => {
                    const rowNumber = (page - 1) * limit + index + 1;
                    const isBookmarked = bookmarked.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        className="grid grid-cols-[50px_48px_1fr_110px_130px_100px_60px] items-center px-4 py-3 hover:bg-slate-50/70 transition-colors group"
                      >
                        <span className="text-xs text-slate-400 font-medium">{rowNumber}</span>
                        <div className="flex items-center">
                          <StatusIcon />
                        </div>
                        <div className="truncate pr-4">
                          <Link
                            href={`/dashboard/dsa/problems/${p.slug}`}
                            className="text-xs font-semibold text-slate-800 hover:text-emerald-700 transition-colors"
                          >
                            {p.title}
                          </Link>
                          {p.topics.length > 1 && (
                            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                              Also in: {p.topics.slice(1).map((t) => t.name).join(', ')}
                            </div>
                          )}
                        </div>
                        <div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              DIFF_BADGE[p.difficulty]
                            }`}
                          >
                            {p.difficulty}
                          </span>
                        </div>
                        <div>
                          <span className={TOPIC_BADGE}>
                            {p.primaryTopic?.name || p.topics[0]?.name || 'Algorithms'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">{p.acceptanceRate.toFixed(1)}%</span>
                        <div className="text-right">
                          <button
                            onClick={() => toggleBookmark(p.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isBookmarked
                                ? 'text-emerald-600 bg-emerald-50'
                                : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'
                            }`}
                          >
                            <Bookmark
                              className="w-3.5 h-3.5"
                              fill={isBookmarked ? 'currentColor' : 'none'}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-slate-400">
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} problems
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className={`p-1.5 rounded-lg border border-slate-200 transition-colors ${
                      page <= 1
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-300'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                        n === page
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className={`p-1.5 rounded-lg border border-slate-200 transition-colors ${
                      page >= totalPages
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-300'
                        : 'hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
    </div>
  );
}
