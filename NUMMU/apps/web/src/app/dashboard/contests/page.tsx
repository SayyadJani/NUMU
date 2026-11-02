'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { LoadingState } from '@/components/ui/loading-state';
import { testsService } from '@/services/tests.service';
import type { TestItem, TestStatus } from '@/types/tests';
import { Trophy, Calendar, Clock, Award, Users, ArrowRight, Zap } from 'lucide-react';

export default function ContestsPage() {
  const [contests, setContests] = useState<TestItem[]>([]);
  const [activeTab, setActiveTab] = useState<TestStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testsService.getTests().then((data) => {
      setContests(data);
      setLoading(false);
    });
  }, []);

  const filteredContests = contests.filter((c) => {
    if (activeTab === 'all') return true;
    return c.status === activeTab;
  });

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto space-y-6">
          <PageHeader
            title="Competitive Contests"
            description="Compete in real-time weekly coding battles, climb the global rating ladder, and benchmark against top students nationwide."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Contests' },
            ]}
          />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Contest Rating"
              value="1640"
              badge="Knight"
              icon={Trophy}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              trend={{ value: '+34 last contest', isPositive: true }}
            />
            <StatCard
              label="Contests Attended"
              value="12"
              icon={Calendar}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
              subValue="Rank top 1.2%"
            />
            <StatCard
              label="Best Global Rank"
              value="#42"
              icon={Award}
              iconBg="bg-purple-50"
              iconColor="text-purple-600"
              subValue="Weekly DSA #10"
            />
            <StatCard
              label="Win Rate"
              value="88%"
              icon={Zap}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
              subValue="Accepted solutions"
            />
          </div>

          {/* Featured Live Banner */}
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#062c1b] via-[#052115] to-[#02140c] text-white border border-emerald-950/60 shadow-lg overflow-hidden">
            <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Next Live Contest</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  NUMU Grand Weekly Contest #43
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed">
                  5 algorithmic questions, 90 minutes. Open to all colleges. Top 10 receive guaranteed interview fast-tracks and exclusive platform perks.
                </p>
                <div className="flex items-center gap-4 text-xs text-emerald-200/80 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Starts Saturday, 7:00 PM IST</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>1,840 Registered</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/tests/weekly-dsa-12"
                  className="px-6 py-3 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  Register Now Free
                </Link>
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            {[
              { id: 'all', label: 'All Contests' },
              { id: 'ongoing', label: 'Active Live' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'past', label: 'Past & Results' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TestStatus | 'all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0b5c39] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contests Grid */}
          {loading ? (
            <LoadingState message="Loading contest schedules..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContests.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                        {item.dateBadge}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.status === 'ongoing'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : item.status === 'upcoming'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1.5">
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {item.syllabusTags.map((tag) => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 py-2 border-y border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Duration</span>
                        <span className="font-bold text-slate-700">{item.durationMinutes} Mins</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Questions</span>
                        <span className="font-bold text-slate-700">{item.questionsCount} Problems</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 flex items-center justify-between">
                    {item.score !== undefined ? (
                      <div className="text-xs">
                        <span className="text-slate-400 text-[11px]">Score: </span>
                        <span className="font-bold text-slate-900">{item.score}/100</span>
                        <span className="text-slate-400 text-[11px] ml-2">Rank: </span>
                        <span className="font-bold text-emerald-700">#{item.userRank}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {item.endsIn ? `Ends in ${item.endsIn}` : item.startsIn ? `Starts in ${item.startsIn}` : 'Scheduled'}
                      </span>
                    )}

                    <Link
                      href={`/tests/${item.id}` as React.ComponentProps<typeof Link>['href']}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <span>{item.status === 'past' ? 'View Leaderboard' : 'Enter Arena'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
  );
}
