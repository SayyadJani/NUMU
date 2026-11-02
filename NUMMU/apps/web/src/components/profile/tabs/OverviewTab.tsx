'use client';

import React from 'react';
import {
  ChevronRight,
  Star,
  GitFork,
  Flame,
  Clock,
  Calendar,
  ArrowUpRight,
  Trophy,
  Code2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type {
  DsaStatistics,
  DevSkill,
  ActivityData,
  Project,
  TestResult,
  ProfileTab,
} from '@/types/profile';
import { ContributionHeatmap } from '../ContributionHeatmap';

interface OverviewTabProps {
  dsaStats: DsaStatistics;
  skills: DevSkill[];
  activity: ActivityData;
  projects: Project[];
  tests: TestResult[];
  onSelectTab: (tab: ProfileTab) => void;
}

const LEVEL_COLOR: Record<string, string> = {
  Advanced: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Intermediate: 'text-amber-700 bg-amber-50 border-amber-200',
  Beginner: 'text-slate-600 bg-slate-100 border-slate-200',
};

function Donut({
  easy,
  medium,
  hard,
  total,
}: {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const cx = 58;
  const cy = 58;

  const safeTotal = total || 1;
  const easyDash = (easy / safeTotal) * circ;
  const medDash = (medium / safeTotal) * circ;
  const hardDash = (hard / safeTotal) * circ;

  const easyOff = 0;
  const medOff = circ - easyDash;
  const hardOff = circ - easyDash - medDash;

  return (
    <svg width={116} height={116} className="-rotate-90">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={12} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth={12}
        strokeDasharray={`${easyDash} ${circ}`}
        strokeDashoffset={-easyOff}
        strokeLinecap="round"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#f59e0b"
        strokeWidth={12}
        strokeDasharray={`${medDash} ${circ}`}
        strokeDashoffset={-medOff}
        strokeLinecap="round"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#ef4444"
        strokeWidth={12}
        strokeDasharray={`${hardDash} ${circ}`}
        strokeDashoffset={-hardOff}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function OverviewTab({
  dsaStats,
  skills,
  activity,
  projects,
  tests,
  onSelectTab,
}: OverviewTabProps) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6">
      {/* ── Top Row: DSA Summary + Dev Skills ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DSA Statistics Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">DSA Problem Solving</h3>
                <p className="text-xs text-slate-500">Live verified practice and topic mastery</p>
              </div>
              <button
                onClick={() => onSelectTab('DSA')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                <span>Full DSA Stats</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              {/* Donut Chart + Counts */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="relative shrink-0 flex items-center justify-center">
                  <Donut {...dsaStats.solved} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {dsaStats.solved.total}
                    </div>
                    <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                      Solved
                    </div>
                  </div>
                </div>

                {/* Counts Breakdown */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-50/70 border border-emerald-100 min-w-[90px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-600">Easy</span>
                    <span className="text-xs font-bold text-emerald-700 ml-auto">
                      {dsaStats.solved.easy}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-50/70 border border-amber-100 min-w-[90px]">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-600">Medium</span>
                    <span className="text-xs font-bold text-amber-700 ml-auto">
                      {dsaStats.solved.medium}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-red-50/70 border border-red-100 min-w-[90px]">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-600">Hard</span>
                    <span className="text-xs font-bold text-red-700 ml-auto">
                      {dsaStats.solved.hard}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Topics Bars */}
              <div className="flex-1 w-full space-y-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Top Topic Mastery
                </div>
                {dsaStats.topTopics.slice(0, 4).map((topic) => (
                  <div key={topic.name} className="space-y-0.5 min-w-0">
                    <div className="flex justify-between text-xs min-w-0">
                      <span className="font-medium text-slate-700 truncate mr-2" title={topic.name}>{topic.name}</span>
                      <span className="font-semibold text-slate-500 shrink-0">{topic.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Acceptance Rate: <strong className="text-slate-800 font-bold">{dsaStats.acceptanceRate}</strong></span>
            <span>Total Submissions: <strong className="text-slate-800 font-bold">{dsaStats.totalSubmissions}</strong></span>
          </div>
        </div>

        {/* Development Skills Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Tech Stack &amp; Competencies</h3>
                <p className="text-xs text-slate-500">Verified languages, frameworks &amp; cloud tools</p>
              </div>
              <button
                onClick={() => onSelectTab('Development')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
              >
                <span>All Skills ({skills.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {skills.slice(0, 6).map((skill) => (
                <div
                  key={skill.name}
                  className="p-2.5 sm:p-3 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-200 hover:shadow-xs transition-all min-w-0 overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="text-base shrink-0">{skill.icon}</span>
                      <span className="text-xs font-bold text-slate-800 truncate" title={skill.name}>
                        {skill.name}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 ${
                        LEVEL_COLOR[skill.level]
                      }`}
                    >
                      {skill.level}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${skill.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Specialization: <strong className="text-emerald-700 font-semibold">Full Stack &amp; Systems</strong></span>
            <span className="text-slate-400">{skills.length} verified skills</span>
          </div>
        </div>
      </div>

      {/* ── Middle Row: 52-Week Activity Heatmap ── */}
      <ContributionHeatmap
        activity={activity}
        title="Learning Activity & Heatmap"
        showTimelineLink={true}
        onTimelineClick={() => onSelectTab('Activity')}
      />

      {/* ── Bottom Row: Featured Projects & Weekly/Daily Tests ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Projects */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Featured Projects</h3>
              <p className="text-xs text-slate-500">Production-grade applications and tools</p>
            </div>
            <button
              onClick={() => onSelectTab('Projects')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              <span>All Projects ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.slice(0, 2).map((project) => (
              <div
                key={project.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 overflow-hidden hover:border-emerald-300 hover:shadow-md transition-all group bg-white"
              >
                <div className={`h-24 bg-gradient-to-br ${project.previewBg} p-3 flex flex-col justify-between`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                      {project.tags[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-200">
                      ★ {project.stars}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white tracking-wide truncate">
                    {project.title.split('—')[0]}
                  </h4>
                </div>

                <div className="p-4 flex flex-col justify-between flex-1">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> {project.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" /> {project.forks}
                      </span>
                    </div>

                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      Demo
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly & Daily Tests */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Weekly &amp; Daily Tests</h3>
              <p className="text-xs text-slate-500">
                {tests.filter((t) => t.status === 'ATTENDED' || t.status === 'Completed').length} Attended • {tests.filter((t) => t.status === 'MISSED').length} Missed of {tests.length || 23} Conducted
              </p>
            </div>
            <button
              onClick={() => onSelectTab('Tests')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              <span>View All Results ({tests.length || 23})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {tests.slice(0, 4).map((test) => {
              const isAttended = test.status === 'ATTENDED' || test.status === 'Completed';

              return (
                <div
                  key={test.id}
                  className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => onSelectTab('Tests')}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                          test.type === 'Weekly'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                      >
                        {test.type}
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {test.testName}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                      <span>{test.date}</span>
                      <span>•</span>
                      {isAttended ? (
                        <span className="text-emerald-600 font-semibold">Attended</span>
                      ) : (
                        <span className="text-rose-500 font-semibold">Missed</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isAttended ? (
                      <>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-700">
                            Rank #{test.rank || 23}
                          </div>
                          <div className="text-[10px] text-slate-400">Score: {test.score}</div>
                        </div>

                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            test.ratingChange >= 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {test.ratingChange >= 0 ? `+${test.ratingChange}` : test.ratingChange}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        Absent
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
