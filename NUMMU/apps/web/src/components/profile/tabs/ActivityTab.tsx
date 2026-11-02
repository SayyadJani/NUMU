'use client';

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Calendar,
  Clock,
  Code2,
  GitCommit,
  Trophy,
  Award,
  Sparkles,
  Filter,
} from 'lucide-react';
import type { ActivityData, HeatmapDay } from '@/types/profile';
import { ContributionHeatmap } from '../ContributionHeatmap';

interface ActivityTabProps {
  activity: ActivityData;
}

export function ActivityTab({ activity }: ActivityTabProps) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterType, setFilterType] = useState<string>('All');
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'problem':
        return <Code2 className="w-4 h-4 text-emerald-600" />;
      case 'project':
        return <GitCommit className="w-4 h-4 text-blue-600" />;
      case 'contest':
      case 'test':
        return <Trophy className="w-4 h-4 text-amber-600" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-orange-500" />;
      default:
        return <Award className="w-4 h-4 text-purple-600" />;
    }
  };

  const filteredTimeline = useMemo(() => {
    return activity.timeline.filter((item) => {
      if (filterType === 'All') return true;
      if (filterType === 'Problems') return item.type === 'problem';
      if (filterType === 'Tests') return item.type === 'contest' || (item as any).type === 'test';
      if (filterType === 'Projects') return item.type === 'project';
      if (filterType === 'Streaks') return item.type === 'streak';
      return true;
    });
  }, [activity.timeline, filterType]);

  const activeDays = activity.activeDaysCount ?? Math.max(1, Math.min(365, Math.round(activity.contributions * 0.7) || activity.currentStreak));

  const getCellColor = (level: number, active: boolean) => {
    if (level === 4) return 'bg-emerald-800 hover:bg-emerald-900';
    if (level === 3) return 'bg-emerald-600 hover:bg-emerald-700';
    if (level === 2) return 'bg-emerald-500 hover:bg-emerald-600';
    if (level === 1 || active) return 'bg-emerald-400 hover:bg-emerald-500';
    return 'bg-slate-100 hover:bg-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* ── Key Activity Numbers ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">Total Contributions</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{activity.contributions}</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Recorded in {selectedYear}</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">Current Practice Streak</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{activity.currentStreak} Days</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">Keep it burning today!</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">Longest Streak</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{activity.longestStreak} Days</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">Consecutive practice record</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium">Total Learning Hours</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{activity.totalLearningHours} hrs</div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">DSA, tests &amp; development labs</div>
        </div>
      </div>

      {/* ── Interactive 52-Week Heatmap ── */}
      <ContributionHeatmap
        activity={activity}
        title="Annual Contribution Heatmap"
        subtitle="End-to-end verified daily submissions, assessments, and code activity"
      />

      {/* ── Chronological Activity Feed ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Activity Timeline</h3>
            <p className="text-xs text-slate-500">Real-time log of accomplishments and platform engagements</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            {(['All', 'Problems', 'Tests', 'Projects', 'Streaks'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterType === filter
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredTimeline.length > 0 ? (
          <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative flex items-start gap-4">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>

                <div className="flex-1 p-3.5 sm:p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-emerald-200 hover:shadow-xs transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      {getTimelineIcon(item.type)}
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                      {item.tag && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-xs">
            No activity events recorded under this filter.
          </div>
        )}
      </div>
    </div>
  );
}
