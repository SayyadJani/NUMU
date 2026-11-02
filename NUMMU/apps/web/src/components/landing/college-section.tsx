import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { COLLEGE_STUDENT_DATA } from '@/data/landing-data';
import { Users, BookOpen, FileText, BarChart3, FolderGit2, TrendingUp } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

const collegeSidebarItems = [
  { label: 'Dashboard', icon: BarChart3, active: true },
  { label: 'Students', icon: Users },
  { label: 'Batches', icon: BookOpen },
  { label: 'Assignments', icon: FolderGit2 },
  { label: 'Tests', icon: FileText },
  { label: 'Analytics', icon: TrendingUp },
  { label: 'Reports', icon: FileText },
];

export function CollegeSection() {
  return (
    <section id="colleges" className="py-16 lg:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-5 text-left">
            <div className="mb-4">
              <Badge variant="mint">FOR COLLEGES &amp; TRAINERS</Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-5 leading-tight">
              Empower the Next Generation of Developers
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8">
              NUMU helps colleges and trainers track student progress, assign learning paths, conduct tests and monitor skill development — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" size="md" withArrow>
                Request a Demo
              </Button>
              <Button variant="secondary" size="md">
                Learn More
              </Button>
            </div>
          </div>

          {/* Right: College Dashboard Mockup */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xl overflow-hidden">
              <div className="flex">
                {/* Sidebar */}
                <aside className="w-40 bg-slate-50/80 border-r border-slate-200/70 p-3 shrink-0">
                  <div className="mb-4 pl-0.5">
                    <Logo size="sm" />
                  </div>
                  <nav className="space-y-0.5">
                    {collegeSidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-colors ${
                            item.active
                              ? 'bg-[#eaf7ee] text-[#0b5c39] font-semibold'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${item.active ? 'text-[#0b5c39]' : 'text-slate-400'}`} />
                          {item.label}
                        </div>
                      );
                    })}
                  </nav>
                </aside>

                {/* Main Content */}
                <div className="flex-1 p-4 min-w-0">
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Class Overview</h4>
                      <p className="text-[10px] text-slate-400">B.Tech CSE 2026 · Last 30 days ▾</p>
                    </div>
                  </div>

                  {/* 4 Overview Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-2 text-center">
                      <span className="block text-base font-extrabold text-slate-900">120</span>
                      <span className="text-[9px] text-slate-500 leading-snug block mt-0.5">Total Students</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-2 text-center">
                      <span className="block text-base font-extrabold text-slate-900">96</span>
                      <span className="text-[9px] text-slate-500 leading-snug block mt-0.5">Active Students</span>
                    </div>
                    <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-2 text-center">
                      <span className="block text-base font-extrabold text-emerald-800">68%</span>
                      <span className="text-[9px] text-emerald-700 leading-snug block mt-0.5">Avg. DSA Progress</span>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-2 text-center">
                      <span className="block text-base font-extrabold text-slate-900">54%</span>
                      <span className="text-[9px] text-slate-500 leading-snug block mt-0.5">Avg. Dev Progress</span>
                    </div>
                  </div>

                  {/* Student Performance Table */}
                  <div>
                    <h5 className="text-[10.5px] font-bold text-slate-800 mb-2">Student Performance</h5>
                    <div className="rounded-xl border border-slate-200/80 overflow-hidden">
                      {/* Table Head */}
                      <div className="grid grid-cols-5 text-[9.5px] font-semibold text-slate-500 bg-slate-50 px-3 py-2 border-b border-slate-200/80">
                        <span>#</span>
                        <span>Student</span>
                        <span>DSA</span>
                        <span>Dev</span>
                        <span>Status</span>
                      </div>

                      {/* Table Rows */}
                      {COLLEGE_STUDENT_DATA.map((row) => (
                        <div
                          key={row.rank}
                          className="grid grid-cols-5 items-center text-[10px] px-3 py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors"
                        >
                          <span className="font-semibold text-slate-600">{row.rank}</span>
                          <span className="font-semibold text-slate-800 truncate pr-1">{row.name}</span>
                          <span className="font-semibold text-slate-700">{row.dsa}%</span>
                          <span className="font-semibold text-slate-700">{row.dev}%</span>
                          <span>
                            {row.status === 'Active' ? (
                              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                Needs Help
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
