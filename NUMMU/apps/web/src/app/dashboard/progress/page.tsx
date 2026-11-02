'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { LoadingState } from '@/components/ui/loading-state';
import { profileService } from '@/services/profile-service';
import type { DsaStatistics, DevSkill, ActivityData } from '@/types/profile';
import {
  TrendingUp,
  Flame,
  Code2,
  Layers,
  Target,
  ArrowRight,
} from 'lucide-react';

export default function ProgressPage() {
  const [dsaStats, setDsaStats] = useState<DsaStatistics | null>(null);
  const [skills, setSkills] = useState<DevSkill[]>([]);
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      profileService.getDsaStats('johnny_dev'),
      profileService.getDevSkills('johnny_dev'),
      profileService.getActivity('johnny_dev'),
    ]).then(([dsa, devSkills, act]) => {
      setDsaStats(dsa);
      setSkills(devSkills);
      setActivity(act);
      setLoading(false);
    });
  }, []);

  if (loading || !dsaStats || !activity) {
    return (
      <main className="flex-1 px-6 py-6 pt-4 flex items-center justify-center">
        <LoadingState message="Loading your comprehensive learning analytics..." />
      </main>
    );
  }

  const totalDsa = dsaStats.solved.total || (dsaStats.solved.easy + dsaStats.solved.medium + dsaStats.solved.hard);

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pt-4 max-w-7xl w-full mx-auto space-y-6">
          <PageHeader
            title="Skill Progress & Mastery Analytics"
            description="Deep dive into your algorithm mastery, fullstack engineering competencies, problem solving velocity, and consistency streaks."
            breadcrumbs={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Progress Analytics' },
            ]}
          />

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Interview Readiness"
              value="84%"
              badge="Top 5%"
              icon={Target}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-700"
              trend={{ value: '+6% this month', isPositive: true }}
            />
            <StatCard
              label="DSA Solved"
              value={totalDsa}
              subValue={`${dsaStats.acceptanceRate} acceptance rate`}
              icon={Code2}
              iconBg="bg-blue-50"
              iconColor="text-blue-700"
            />
            <StatCard
              label="Current Streak"
              value={`${activity.currentStreak} Days`}
              subValue={`Longest: ${activity.longestStreak} days`}
              icon={Flame}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatCard
              label="Total Learning Hours"
              value={`${activity.totalLearningHours}h`}
              subValue={`${activity.contributions} total activities`}
              icon={TrendingUp}
              iconBg="bg-purple-50"
              iconColor="text-purple-700"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: DSA Category Mastery */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">DSA Topic Mastery</h2>
                    <p className="text-[11px] text-slate-500">Based on verified test and practice submissions</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/dsa"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Difficulty breakdown pills */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-center">
                  <div className="text-emerald-700 font-black text-lg">{dsaStats.solved.easy}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Easy</div>
                </div>
                <div className="text-center border-x border-slate-200">
                  <div className="text-amber-600 font-black text-lg">{dsaStats.solved.medium}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-rose-600 font-black text-lg">{dsaStats.solved.hard}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Hard</div>
                </div>
              </div>

              {/* Topic Bars */}
              <div className="space-y-3.5 pt-1">
                {dsaStats.topTopics.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No topic activity recorded yet. Start solving problems to track mastery!
                  </div>
                ) : (
                  dsaStats.topTopics.map((topic) => (
                    <div key={topic.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{topic.name}</span>
                        <span className="font-mono text-slate-500 font-semibold">{topic.percentage}%</span>
                      </div>
                      <ProgressBar value={topic.percentage} size="sm" color="emerald" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Development Skills Competency */}
            <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Engineering Competencies</h2>
                    <p className="text-[11px] text-slate-500">Fullstack tracks, databases, and DevOps skills</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/development"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Tracks</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{skill.icon}</span>
                        <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        {skill.level}
                      </span>
                    </div>
                    <ProgressBar value={skill.pct} size="xs" color="blue" />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{skill.category}</span>
                      <span>{skill.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Heatmap Panel */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Consistency & Submission Heatmap</h2>
                <p className="text-[11px] text-slate-500">Every square represents verified daily coding activity</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-xs bg-slate-100" />
                <span>Less</span>
                <span className="w-3 h-3 rounded-xs bg-emerald-300" />
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="w-3 h-3 rounded-xs bg-[#0b5c39]" />
                <span>More</span>
              </div>
            </div>

            {/* Matrix grid */}
            <div className="overflow-x-auto no-scrollbar py-2">
              <div className="inline-grid grid-rows-7 grid-flow-col gap-1.5 min-w-[700px]">
                {activity.heatmapRows.flatMap((row, rIdx) =>
                  row.map((isActive, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-3.5 h-3.5 rounded-xs transition-transform hover:scale-125 ${
                        isActive
                          ? (rIdx + cIdx) % 3 === 0
                            ? 'bg-[#0b5c39]'
                            : 'bg-emerald-400'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                      title={`Activity index ${rIdx}, ${cIdx}`}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
  );
}
