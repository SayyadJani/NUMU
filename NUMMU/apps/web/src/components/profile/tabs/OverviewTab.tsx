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
  FolderGit2,
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
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ring-track, #e2e8f0)" strokeWidth={12} />
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
        <div className="bg-white dark:bg-[#0b2b1e] rounded-3xl border border-slate-200/90 dark:border-emerald-900/40 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">DSA Problem Solving</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Live verified practice and topic mastery</p>
              </div>
              <button
                onClick={() => onSelectTab('DSA')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
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
                    <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {dsaStats.solved.total}
                    </div>
                    <div className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                      Solved
                    </div>
                  </div>
                </div>

                {/* Counts Breakdown */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 min-w-[90px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Easy</span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 ml-auto">
                      {dsaStats.solved.easy}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 min-w-[90px]">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Medium</span>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 ml-auto">
                      {dsaStats.solved.medium}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/40 min-w-[90px]">
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Hard</span>
                    <span className="text-xs font-bold text-red-700 dark:text-red-400 ml-auto">
                      {dsaStats.solved.hard}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Topics Bars */}
              <div className="flex-1 w-full space-y-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-emerald-900/40 pt-3 sm:pt-0 sm:pl-4 min-w-0">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Top Topic Mastery
                </div>
                {dsaStats.topTopics.length > 0 ? (
                  dsaStats.topTopics.slice(0, 4).map((topic) => (
                    <div key={topic.name} className="space-y-0.5 min-w-0">
                      <div className="flex justify-between text-xs min-w-0">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-2" title={topic.name}>{topic.name}</span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">{topic.percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-[#082218] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${topic.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-center text-xs text-slate-400 dark:text-slate-500">
                    Solve problems to build topic mastery
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Acceptance Rate: <strong className="text-slate-800 dark:text-slate-200 font-bold">{dsaStats.acceptanceRate}</strong></span>
            <span>Total Submissions: <strong className="text-slate-800 dark:text-slate-200 font-bold">{dsaStats.totalSubmissions}</strong></span>
          </div>
        </div>

        {/* Development Skills Card */}
        <div className="bg-white dark:bg-[#0b2b1e] rounded-3xl border border-slate-200/90 dark:border-emerald-900/40 p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tech Stack &amp; Competencies</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Verified languages, frameworks &amp; cloud tools</p>
              </div>
              <button
                onClick={() => onSelectTab('Development')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
              >
                <span>All Skills ({skills.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {skills.length > 0 ? (
              <div className="grid grid-cols-2 gap-2.5">
                {skills.slice(0, 6).map((skill) => (
                  <div
                    key={skill.name}
                    className="p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-emerald-900/40 bg-slate-50/60 dark:bg-[#082218] hover:bg-white dark:hover:bg-[#051911] hover:border-emerald-200 dark:hover:border-emerald-800/40 hover:shadow-xs transition-all min-w-0 overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-2 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="text-base shrink-0">{skill.icon}</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={skill.name}>
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
                    <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full"
                        style={{ width: `${skill.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 dark:border-emerald-900/40 p-6 text-center bg-slate-50/50 dark:bg-[#082218]/50">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No skills added yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Customize your verified tech stack in the Development tab.</p>
                <button
                  onClick={() => onSelectTab('Development')}
                  className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                >
                  <span>Add Tech Skills</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-emerald-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Specialization: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{skills.length > 0 ? 'Full Stack & Systems' : 'Developing'}</strong></span>
            <span className="text-slate-400 dark:text-slate-500">{skills.length} verified skills</span>
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
        <div className="bg-white dark:bg-[#0b2b1e] rounded-3xl border border-slate-200/90 dark:border-emerald-900/40 p-5 sm:p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Featured Projects</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Production-grade applications and tools</p>
            </div>
            <button
              onClick={() => onSelectTab('Projects')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <span>All Projects ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {projects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.slice(0, 2).map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-emerald-900/40 overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all group bg-white dark:bg-[#082218]"
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
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed mb-3">
                      {project.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-emerald-900/40">
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-slate-500">
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
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300"
                      >
                        Demo
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-emerald-900/40 p-8 text-center bg-slate-50/50 dark:bg-[#082218]/50">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center mx-auto mb-2 text-emerald-600 dark:text-emerald-400">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Projects Showcase Yet</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Add projects to showcase your deployed full-stack work, live prototypes, and GitHub repositories.
              </p>
              <button
                onClick={() => onSelectTab('Projects')}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Add First Project</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Weekly & Daily Tests */}
        <div className="bg-white dark:bg-[#0b2b1e] rounded-3xl border border-slate-200/90 dark:border-emerald-900/40 p-5 sm:p-6 shadow-sm transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Weekly &amp; Daily Tests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tests.filter((t) => t.status === 'ATTENDED' || t.status === 'Completed').length} Attended • {tests.filter((t) => t.status === 'MISSED').length} Missed of {tests.length} Conducted
              </p>
            </div>
            <button
              onClick={() => onSelectTab('Tests')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer"
            >
              <span>View All Results ({tests.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {tests.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-emerald-950/60">
              {tests.slice(0, 4).map((test) => {
                const isAttended = test.status === 'ATTENDED' || test.status === 'Completed';

                return (
                  <div
                    key={test.id}
                    className="py-3 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-[#082218] px-2 rounded-xl transition-colors cursor-pointer"
                    onClick={() => onSelectTab('Tests')}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                            test.type === 'Weekly'
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
                              : 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/40'
                          }`}
                        >
                          {test.type}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {test.testName}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                        <span>{test.date}</span>
                        <span>•</span>
                        {isAttended ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Attended</span>
                        ) : (
                          <span className="text-rose-500 dark:text-rose-400 font-semibold">Missed</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isAttended ? (
                        <>
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Rank #{test.rank || 1}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500">Score: {test.score}</div>
                          </div>

                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              test.ratingChange >= 0
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                            }`}
                          >
                            {test.ratingChange >= 0 ? `+${test.ratingChange}` : test.ratingChange}
                          </span>
                        </>
                      ) : (
                        <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 px-2.5 py-0.5 rounded-full">
                          Absent
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-emerald-900/40 p-8 text-center bg-slate-50/50 dark:bg-[#082218]/50">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center mx-auto mb-2 text-amber-600 dark:text-amber-400">
                <Trophy className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Tests Attempted Yet</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Participate in weekly assessments and proctored contests to verify your developer ranking.
              </p>
              <a
                href="/dashboard/tests"
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>Explore Assessments</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
