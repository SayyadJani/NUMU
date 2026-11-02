import React from 'react';
import {
  Home,
  Code,
  Laptop,
  Trophy,
  FileText,
  FolderGit2,
  TrendingUp,
  FileCode2,
  Bookmark,
  Search,
  Bell,
  Flame,
  ChevronRight,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export function DashboardMockup() {
  const sidebarItems = [
    { label: 'Home', icon: Home, active: true },
    { label: 'DSA', icon: Code },
    { label: 'Development', icon: Laptop },
    { label: 'Contests', icon: Trophy },
    { label: 'Tests', icon: FileText },
    { label: 'Projects', icon: FolderGit2 },
    { label: 'Progress', icon: TrendingUp },
    { label: 'Notes', icon: FileCode2 },
    { label: 'Bookmarks', icon: Bookmark },
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-2xl shadow-slate-200/80 overflow-hidden text-slate-800 text-left font-sans select-none">
      <div className="flex flex-col lg:flex-row min-h-[580px]">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-44 bg-slate-50/80 border-r border-slate-200/80 p-3.5 flex flex-col justify-between shrink-0">
          <div>
            <div className="mb-4 pl-1">
              <Logo size="sm" />
            </div>

            <nav className="space-y-0.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      item.active
                        ? 'bg-[#eaf7ee] text-[#0b5c39] font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.active ? 'text-[#0b5c39]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Encouragement Card */}
          <div className="mt-4 p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
            <p className="text-[11px] font-bold text-slate-800">Keep going!</p>
            <p className="text-[9.5px] text-slate-500 leading-snug mt-0.5">Consistency creates extraordinary results.</p>
            <div className="mt-1.5 flex justify-end">
              <span className="text-base leading-none">🌱</span>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Panel */}
        <main className="flex-1 p-4 lg:p-5 bg-white">
          {/* Top Bar inside mockup */}
          <div className="flex items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-slate-100">
            {/* Search Input */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/70 text-slate-400 text-[11px] w-60">
              <Search className="w-3 h-3 text-slate-400" />
              <span className="text-slate-400 truncate">Search problems, topics, projects...</span>
              <kbd className="font-mono text-[9px] bg-white border border-slate-200 text-slate-500 rounded px-1 ml-auto">
                Ctrl K
              </kbd>
            </div>

            {/* Profile & Notifications */}
            <div className="flex items-center gap-2.5">
              <div className="relative p-1 text-slate-500 hover:text-slate-700 cursor-pointer">
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>

              <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[10px]">
                  JP
                </div>
                <div className="leading-none text-left">
                  <span className="text-[11px] font-semibold text-slate-800 block">Jani Pasha</span>
                  <span className="text-[9px] text-slate-400">Student</span>
                </div>
              </div>
            </div>
          </div>

          {/* Greeting Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                Hey, Jani! <span className="inline-block animate-wiggle">👋</span>
              </h3>
              <p className="text-xs text-slate-500">Small steps today, big opportunities tomorrow.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-medium">Mon, 22 Sep 2025</span>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>12 Day Streak</span>
              </div>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
            {/* Metric 1 */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-200"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray="68, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-slate-800">68%</span>
              </div>
              <div className="leading-tight">
                <span className="text-[10px] font-medium text-slate-400 block">DSA</span>
                <span className="text-[11px] font-semibold text-slate-800">Progress</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Layers className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-bold text-slate-900 block">24</span>
                <span className="text-[10px] text-slate-500">Projects Completed</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Code className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-bold text-slate-900 block">147</span>
                <span className="text-[10px] text-slate-500">Problems Solved</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <Trophy className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <span className="text-sm font-bold text-slate-900 block">18</span>
                <span className="text-[10px] text-slate-500">Contests Participated</span>
              </div>
            </div>
          </div>

          {/* 2-Column Split Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Continue Learning */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Continue Learning</span>
                  <span className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-0.5">
                    View All <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-emerald-50/40 border border-emerald-100/60">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Code className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-semibold text-emerald-700 uppercase tracking-wider block">DSA</span>
                    <h4 className="text-xs font-bold text-slate-900 truncate">Binary Search</h4>
                    <span className="text-[10px] text-slate-500 block mb-1.5">Learn • Practice • Solve</span>

                    {/* Progress */}
                    <div className="flex items-center justify-between text-[9.5px] text-slate-500 mb-1">
                      <span>6 / 12 problems</span>
                      <span className="font-semibold text-emerald-700">50%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden mb-2">
                      <div className="w-1/2 h-full bg-[#0b5c39] rounded-full" />
                    </div>

                    <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0b5c39] text-white text-[10px] font-semibold hover:bg-[#094b2e] cursor-pointer">
                      Continue <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Today's Plan */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Today&apos;s Plan</span>
                  <span className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-0.5">
                    View All <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                    <span className="line-through text-slate-400 text-[11px]">Solve 2 DSA problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="text-[11px]">Complete React exercise</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="text-[11px]">Work on Expense Tracker project</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Upcoming Contest */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Upcoming Contest</span>
                  <span className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-0.5">
                    View All <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">NUMU Weekly #42</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Sun, 28 Sep 2025 • 10:00 AM
                      </p>
                      <span className="text-[9.5px] text-slate-400 block mt-0.5">5 problems • 90 minutes</span>
                    </div>

                    <div className="text-center px-2 py-1 rounded-md bg-amber-50 border border-amber-200/70">
                      <span className="text-xs">🏆</span>
                      <span className="text-[9px] font-bold text-amber-800 block">1.2K</span>
                      <span className="text-[8px] text-amber-700">Participants</span>
                    </div>
                  </div>

                  <button className="w-full py-1.5 rounded-md bg-[#0b5c39] hover:bg-[#094b2e] text-white text-[10px] font-semibold flex items-center justify-center gap-1 cursor-pointer">
                    Register Now <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="p-3 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900">Recent Activity</span>
                  <span className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer flex items-center gap-0.5">
                    View All <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">Solved Two Sum</span>
                    </div>
                    <span className="text-[9.5px] text-slate-400 shrink-0">2 hours ago</span>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[8px] font-bold">
                        R
                      </div>
                      <span className="font-medium text-slate-800 truncate">Completed React Basics</span>
                    </div>
                    <span className="text-[9.5px] text-slate-400 shrink-0">5 hours ago</span>
                  </div>

                  <div className="flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-[8px] font-bold">
                        P
                      </div>
                      <span className="font-medium text-slate-800 truncate">Submitted Expense Tracker</span>
                    </div>
                    <span className="text-[9.5px] text-slate-400 shrink-0">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
