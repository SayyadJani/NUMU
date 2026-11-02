'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Monitor,
  GitBranch,
  FolderGit2,
  CheckCircle2,
  GitPullRequest,
  Star,
  ExternalLink,
  Plus,
  Search,
  ArrowRight,
  Check,
  Layers,
  Server,
  Database,
  Cloud,
  Flame,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Play,
  X,
  Award,
  GitCommit,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import {
  DEV_STATS,
  DEV_PROJECTS,
  DEV_TRACKS,
  DEV_MODULES,
  DEV_COMMITS,
  DEV_SKILLS,
  DEV_MILESTONES,
  DEV_TOPICS,
  DEV_HEATMAP,
  type DevProject,
  type DevModule,
  type DevMilestone,
  type ProjectStatus,
} from '@/data/development-mock';

// ─── Helpers & Style Mappings ──────────────────────────────────────────────────

const TRACK_ICONS: Record<string, React.ElementType> = {
  Monitor: Monitor,
  Server: Server,
  Database: Database,
  Cloud: Cloud,
  GitBranch: GitBranch,
};

const TRACK_COLORS: Record<string, { bg: string; text: string; border: string; bar: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', bar: 'bg-purple-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-600' },
};

const STATUS_BADGES: Record<ProjectStatus, { label: string; cls: string }> = {
  active: { label: 'Active Sprint', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  review: { label: 'Under Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  paused: { label: 'Paused', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const HEATMAP_CLASSES = [
  'bg-slate-100',
  'bg-emerald-100',
  'bg-emerald-300',
  'bg-emerald-500',
  'bg-emerald-700',
];

// ─── Donut Circular Chart ─────────────────────────────────────────────────────

function ReadinessDonut({ percent }: { percent: number }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="#0b5c39"
          strokeWidth="9"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black text-slate-900 leading-none">{percent}%</span>
        <span className="text-[8px] font-semibold text-slate-400 leading-none mt-0.5">Readiness</span>
      </div>
    </div>
  );
}

// ─── Contribution Heatmap Component ───────────────────────────────────────────

function CommitHeatmap() {
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1 flex-wrap">
        {DEV_HEATMAP.map((day) => (
          <div
            key={day.date}
            title={`${day.date}: ${day.commits} commits`}
            className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 cursor-default ${
              HEATMAP_CLASSES[day.level]
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[9px] text-slate-400">Less</span>
        {HEATMAP_CLASSES.map((cls, i) => (
          <div key={i} className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
        ))}
        <span className="text-[9px] text-slate-400">More</span>
      </div>
    </div>
  );
}

// ─── Main Development Dashboard Page ─────────────────────────────────────────

export default function DevelopmentPage() {
  // State: Projects and filtering
  const [projects, setProjects] = useState<DevProject[]>(DEV_PROJECTS);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'review' | 'completed' | 'fullstack' | 'frontend' | 'backend'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // State: Submitted projects state (Sprint submit)
  const [submittedSprintMap, setSubmittedSprintMap] = useState<Record<string, boolean>>({});

  // State: Interactive Milestones checklist
  const [milestones, setMilestones] = useState<DevMilestone[]>(DEV_MILESTONES);

  // State: Active track filter for modules
  const [selectedTrackId, setSelectedTrackId] = useState<string>('all');

  // State: Modules progress
  const [modules, setModules] = useState<DevModule[]>(DEV_MODULES);

  // State: Modal for New Project
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectType, setNewProjectType] = useState<'fullstack' | 'frontend' | 'backend'>('fullstack');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick notification toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Type or status filter
      if (selectedFilter === 'active' && p.status !== 'active') return false;
      if (selectedFilter === 'review' && p.status !== 'review') return false;
      if (selectedFilter === 'completed' && p.status !== 'completed') return false;
      if (selectedFilter === 'fullstack' && p.type !== 'fullstack') return false;
      if (selectedFilter === 'frontend' && p.type !== 'frontend') return false;
      if (selectedFilter === 'backend' && p.type !== 'backend') return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesDesc = p.description.toLowerCase().includes(query);
        const matchesStack = p.techStack.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesStack;
      }
      return true;
    });
  }, [projects, selectedFilter, searchQuery]);

  // Handle milestone toggle
  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
    showToast('Milestone updated!');
  };

  // Handle sprint submission
  const handleSubmitSprint = (projId: string) => {
    setSubmittedSprintMap((prev) => ({ ...prev, [projId]: true }));
    showToast('Sprint successfully submitted for PR review! 🎉');
  };

  // Handle star toggle
  const toggleStar = (projId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projId ? { ...p, stars: p.stars + 1 } : p))
    );
    showToast('Repository starred! ⭐');
  };

  // Handle module completion
  const handleAdvanceModule = (modId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === modId) {
          const nextCompleted = Math.min(m.totalLessons, m.completedLessons + 1);
          const nextPct = Math.round((nextCompleted / m.totalLessons) * 100);
          return {
            ...m,
            completedLessons: nextCompleted,
            progressPct: nextPct,
          };
        }
        return m;
      })
    );
    showToast('Lesson completed! XP earned 🔥');
  };

  // Create new project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const newProj: DevProject = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle,
      description: 'Production-ready fullstack capstone initialized with Next.js 15, TypeScript, and Prisma.',
      type: newProjectType,
      status: 'active',
      stage: 'planning',
      sprint: 'Sprint 1 of 5',
      progressPct: 15,
      techStack: ['Next.js', 'TypeScript', 'Tailwind', 'PostgreSQL'],
      githubUrl: 'https://github.com/johnny/' + newProjectTitle.toLowerCase().replace(/\s+/g, '-'),
      stars: 1,
      lastCommit: 'Just now',
      nextMilestone: 'Initial schema setup & database seeding',
      reviewsPending: 0,
      xpReward: 400,
    };

    setProjects([newProj, ...projects]);
    setIsNewProjectModalOpen(false);
    setNewProjectTitle('');
    showToast(`Project "${newProjectTitle}" initialized successfully! 🚀`);
  };

  // Completed milestones count
  const completedMilestonesCount = milestones.filter((m) => m.done).length;

  return (
    <>
      <main className="flex-1 px-6 py-5 pt-4 space-y-6">

          {/* ══ Breadcrumbs & Status Bar ══════════════════════════════════════ */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-semibold">Development Track</span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Industry Vetted Portfolio</span>
              </span>

              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0b5c39] hover:bg-[#08482c] text-white text-xs font-bold rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ══ Row 1: Hero Card | Dev Readiness | Consistency Heatmap ════════ */}
          <div className="grid grid-cols-12 gap-4">

            {/* ── 1. Hero Card (5 Cols) with Background Image Asset ── */}
            <div className="col-span-12 lg:col-span-5 relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 group bg-slate-900 aspect-[2525/1457] flex items-center justify-center">
              <Image
                src="/assets/dsa-hero-card.png"
                alt="Build Production SaaS. Ship like a Senior."
                fill
                className="object-cover block select-none pointer-events-none"
                priority
              />

              {/* Text Copy & Re-styled Interactive Buttons */}
              <div className="absolute inset-0 p-5 sm:p-6 lg:p-7 flex flex-col justify-between z-10 w-[58%] sm:w-[55%]">
                {/* Header text content */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-[10px] sm:text-xs font-semibold tracking-wide w-fit shadow-xs">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Fullstack Track • Level 4</span>
                  </div>

                  <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                    Build Production SaaS, <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                      Ship Like a Senior.
                    </span>
                  </h1>

                  <p className="text-[10px] sm:text-xs text-purple-100/80 leading-relaxed font-medium line-clamp-2 drop-shadow-xs max-w-[300px]">
                    Architect fullstack apps with Next.js 15, PostgreSQL & Docker. Earn verified PR code reviews and showcase real production commits.
                  </p>
                </div>

                {/* Restyled Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-2.5 pt-1">
                  <a
                    href="#active-projects"
                    className="group/btn flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 hover:from-emerald-300 hover:via-emerald-400 hover:to-teal-300 text-slate-950 text-[11px] sm:text-xs font-black rounded-xl transition-all shadow-md shadow-emerald-950/40 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  >
                    <span>Resume Capstone</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </a>
                  <a
                    href="#tech-tracks"
                    className="flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all shadow-xs border border-white/25 hover:border-white/40 backdrop-blur-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  >
                    <Layers className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Tech Tracks</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ── 2. Dev Readiness & Track Breakdown (3 Cols) ── */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-3">
              {/* Readiness Donut Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Dev Readiness
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    High Placement Match
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <ReadinessDonut percent={DEV_STATS.readinessPct} />

                  <div className="flex-1 space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                        <span>Frontend</span>
                        <span className="font-bold text-slate-900">{DEV_STATS.frontendPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${DEV_STATS.frontendPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                        <span>Backend</span>
                        <span className="font-bold text-slate-900">{DEV_STATS.backendPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${DEV_STATS.backendPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-0.5">
                        <span>DevOps</span>
                        <span className="font-bold text-slate-900">{DEV_STATS.devOpsPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${DEV_STATS.devOpsPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Target: <strong className="text-slate-800">8 Projects</strong></span>
                  <span className="text-emerald-700 font-bold">{DEV_STATS.projectsBuilt} built • {DEV_STATS.projectsInReview} in review</span>
                </div>
              </div>

              {/* Lines of code + Active Streak */}
              <div className="grid grid-cols-2 gap-3 flex-1">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col justify-between">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Lines Written</div>
                    <div className="text-base font-extrabold text-slate-900 leading-tight">24.6k+</div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col justify-between">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Dev Streak</div>
                    <div className="text-base font-extrabold text-slate-900 leading-tight">{DEV_STATS.currentStreak} Days 🔥</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. Commit Heatmap & Git Stats (4 Cols) ── */}
            <div className="col-span-12 lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-slate-700" />
                    <span className="text-sm font-bold text-slate-800">Git Contribution Activity</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    {DEV_STATS.commitsThisWeek} commits this week
                  </span>
                </div>

                <CommitHeatmap />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 mt-3 text-center">
                <div>
                  <div className="text-sm font-extrabold text-slate-900">{DEV_STATS.commitsThisWeek}</div>
                  <div className="text-[9px] text-slate-400">Commits / Wk</div>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">3</div>
                  <div className="text-[9px] text-slate-400">Active Repos</div>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">4</div>
                  <div className="text-[9px] text-slate-400">PR Reviews</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="italic">&ldquo;Talk is cheap. Show me the code.&rdquo;</span>
                <span className="font-bold text-slate-700">— Linus Torvalds</span>
              </div>
            </div>
          </div>

          {/* ══ Active Capstones & Projects Section ═══════════════════════════ */}
          <div id="active-projects" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Your Capstone Projects</h2>
                <p className="text-xs text-slate-500">Build, test, deploy and submit sprints for code review.</p>
              </div>

              {/* Filters & Search */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search projects or stacks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0b5c39] w-48 sm:w-56"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center bg-slate-100/80 p-0.5 rounded-xl border border-slate-200 text-xs">
                  {(['all', 'active', 'review', 'completed', 'fullstack'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedFilter(tab)}
                      className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                        selectedFilter === tab
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const statusMeta = STATUS_BADGES[project.status];
                const isSubmitted = submittedSprintMap[project.id];

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700 shadow-2xs">
                            <FolderGit2 className="w-4 h-4 text-emerald-700" />
                          </div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {project.type}
                          </span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusMeta.cls}`}>
                          {statusMeta.label}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0b5c39] transition-colors mb-1.5 leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Tech Stack Pills */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-semibold bg-slate-50 border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Sprint & Progress Bar */}
                      <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-semibold">{project.sprint}</span>
                          <span className="font-mono font-bold text-emerald-700">{project.progressPct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                            style={{ width: `${project.progressPct}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 pt-0.5 flex items-center gap-1 truncate">
                          <strong>Next:</strong> {project.nextMilestone}
                        </div>
                      </div>

                      {/* Links & Repository Stars */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-semibold transition-colors"
                        >
                          <GitPullRequest className="w-3.5 h-3.5" />
                          <span>Repo</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>

                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                          >
                            <span>Live Demo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          onClick={() => toggleStar(project.id)}
                          className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold hover:scale-105 transition-transform cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>{project.stars}</span>
                        </button>
                      </div>
                    </div>

                    {/* Submit / Action Button */}
                    <div className="pt-2 border-t border-slate-100">
                      {project.status === 'completed' ? (
                        <div className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Deployed to Production</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSubmitSprint(project.id)}
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
                              <span>Sprint Submitted for PR Review ✓</span>
                            </>
                          ) : (
                            <>
                              <GitCommit className="w-3.5 h-3.5" />
                              <span>Submit Sprint for Review ({project.xpReward} XP)</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══ Tech Tracks & Roadmaps Section ═════════════════════════════════ */}
          <div id="tech-tracks" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Career Tech Tracks</h2>
                <p className="text-xs text-slate-500">Structured paths designed to make you hireable across the full stack.</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filter modules below:</span>
                <button
                  onClick={() => setSelectedTrackId('all')}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    selectedTrackId === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  All Tracks
                </button>
              </div>
            </div>

            {/* Tech Tracks Horizontal Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {DEV_TRACKS.map((track) => {
                const IconComponent = TRACK_ICONS[track.icon] || Layers;
                const fallbackColors = { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', bar: 'bg-blue-600' };
                const colors = (track.color && TRACK_COLORS[track.color]) || fallbackColors;
                const isSelected = selectedTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    onClick={() => setSelectedTrackId(track.id)}
                    className={`bg-white rounded-3xl border p-4.5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-8 h-8 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center font-bold shadow-2xs`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black text-slate-900">
                          {track.masteryPct}%
                        </span>
                      </div>

                      {/* Label & Description */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1">
                        {track.label}
                      </h3>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mb-3">
                        {track.description}
                      </p>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div
                          className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                          style={{ width: `${track.masteryPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{track.modulesCompleted}/{track.modulesTotal} Modules</span>
                      <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                        {isSelected ? 'Selected ✓' : 'Select →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══ Recommended Modules & Sprint Checklist ════════════════════════ */}
          <div className="grid grid-cols-12 gap-5">

            {/* ── Left 7 Cols: Guided Learning Modules ── */}
            <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Recommended Modules &amp; Workshops</h3>
                    <p className="text-[11px] text-slate-400">Hands-on code implementations for modern fullstack systems.</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                    {modules.length} modules available
                  </span>
                </div>

                <div className="space-y-3">
                  {modules.map((mod) => (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-xs transition-all flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                            {mod.track}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {mod.durationMin} mins
                          </span>
                          {mod.isRecommended && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                              Recommended
                            </span>
                          )}
                          {mod.isNew && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                              New
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 truncate mb-1">
                          {mod.title}
                        </h4>

                        {/* Lessons Progress */}
                        <div className="flex items-center gap-3">
                          <div className="w-36 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                              style={{ width: `${mod.progressPct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {mod.completedLessons} of {mod.totalLessons} lessons ({mod.progressPct}%)
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAdvanceModule(mod.id)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0b5c39] border border-emerald-200 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-emerald-700" />
                        <span>{mod.completedLessons === 0 ? 'Start' : 'Next Lesson'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Earn verified skill badges on module completion.</span>
                <span className="text-[#0b5c39] font-bold">View Curriculum →</span>
              </div>
            </div>

            {/* ── Right 5 Cols: Sprint Milestones & Checklist ── */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Sprint Milestones</h3>
                    <p className="text-[11px] text-slate-400">Critical deliverables for active capstones.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {completedMilestonesCount} / {milestones.length} done
                  </span>
                </div>

                <div className="space-y-2">
                  {milestones.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleMilestone(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        item.done
                          ? 'bg-slate-50/60 border-slate-100 opacity-60'
                          : 'bg-white border-slate-200/80 hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            item.done
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          {item.done && <Check className="w-3 h-3" />}
                        </div>

                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${item.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {item.task}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.projectTitle}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.priority === 'high'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : item.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.dueIn}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Completed tasks sync with GitHub issues.</span>
                <button
                  onClick={() => showToast('All pending milestones synced!')}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Sync Tasks
                </button>
              </div>
            </div>
          </div>

          {/* ══ Row 4: Recent Git Commits & Tech Skills Grid ═══════════════════ */}
          <div className="grid grid-cols-12 gap-5">

            {/* ── Left 7 Cols: Recent Git Commits Feed ── */}
            <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-extrabold text-slate-900">Recent Git Commits</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  git log -n 5 --oneline
                </span>
              </div>

              <div className="space-y-2.5">
                {DEV_COMMITS.map((commit) => (
                  <div
                    key={commit.id}
                    className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-200 px-1.5 py-0.2 rounded">
                          {commit.branch}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {commit.repo}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          • {commit.time}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-medium text-slate-800 truncate">
                        {commit.message}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-mono shrink-0">
                      <span className="text-emerald-600 font-bold">+{commit.additions}</span>
                      <span className="text-red-500 font-bold">-{commit.deletions}</span>
                      <span className="text-slate-400">({commit.filesChanged} files)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right 5 Cols: Tech Skills Radar Grid ── */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm font-extrabold text-slate-900">Tech Stack Mastery</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    9 skills tracked
                  </span>
                </div>

                <div className="space-y-2.5">
                  {DEV_SKILLS.map((skill) => (
                    <div key={skill.slug} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{skill.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-400 capitalize">
                            {skill.level}
                          </span>
                          <span className="font-mono font-bold text-slate-900 text-[11px]">
                            {skill.masteryPct}%
                          </span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${skill.color} rounded-full transition-all duration-700`}
                          style={{ width: `${skill.masteryPct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Assessment verified on NUMU platform</span>
                <span className="text-emerald-700 font-bold">Skill Matrix →</span>
              </div>
            </div>
          </div>

          {/* ══ Dev Topics & System Architectures to Explore ══════════════════ */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Explore Development Topics</h3>
                <p className="text-xs text-slate-500">Deep-dive technical guides with real production codebases.</p>
              </div>
              <span className="text-xs text-slate-400 font-medium">8 specialized tracks</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {DEV_TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => showToast(`Opening "${topic.title}" guide...`)}
                  className={`p-3 rounded-2xl border ${topic.color} hover:shadow-sm hover:scale-102 transition-all cursor-pointer flex flex-col items-center text-center`}
                >
                  <span className="text-2xl mb-1.5">{topic.icon}</span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{topic.title}</h4>
                  <span className="text-[10px] text-slate-500 mt-0.5">{topic.subtitle}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

      {/* ══ New Project Modal ═════════════════════════════════════════════════ */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">Initialize New Capstone</h3>
              </div>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Workflow Automation Platform"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0b5c39] focus:ring-1 focus:ring-[#0b5c39]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Architecture Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fullstack' as const, label: 'Fullstack' },
                    { id: 'backend' as const, label: 'Backend API' },
                    { id: 'frontend' as const, label: 'Frontend UI' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setNewProjectType(t.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        newProjectType === t.id
                          ? 'border-[#0b5c39] bg-emerald-50 text-[#0b5c39]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                🚀 This sets up an automated GitHub repository template with 5 structured milestones, CI test pipelines, and instructor PR review integration.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0b5c39] hover:bg-[#08482c] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Create Capstone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
