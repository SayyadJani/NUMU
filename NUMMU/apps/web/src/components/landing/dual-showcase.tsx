'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  FileCode,
  Layers,
  Atom,
  Server,
  Database,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DSA_ROADMAP_ITEMS, DEV_MODULES } from '@/data/landing-data';

export function DualShowcase() {
  const [activeDsaTab, setActiveDsaTab] = useState<'roadmap' | 'problems' | 'contests'>('roadmap');

  const getDevIcon = (type: string) => {
    switch (type) {
      case 'html':
        return (
          <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center">
            <FileCode className="w-3.5 h-3.5" />
          </div>
        );
      case 'js':
        return (
          <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
            JS
          </div>
        );
      case 'react':
        return (
          <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center">
            <Atom className="w-3.5 h-3.5" />
          </div>
        );
      case 'node':
        return (
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Server className="w-3.5 h-3.5" />
          </div>
        );
      case 'mongo':
        return (
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Database className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: DSA Showcase */}
          <div className="relative rounded-3xl bg-[#092119] border border-emerald-900/60 p-6 sm:p-8 lg:p-10 text-white overflow-hidden shadow-xl flex flex-col justify-between">
            {/* Ambient inner glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Details */}
              <div className="md:col-span-6 text-left">
                <div className="mb-4">
                  <Badge variant="mint-dark" className="border-emerald-500/40 text-emerald-300">
                    DSA
                  </Badge>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                  Master Problem Solving
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  From fundamentals to advanced. Learn DSA with structured roadmaps, patterns, curated problems and weekly contests.
                </p>
                <Button variant="emerald" size="md" withArrow>
                  Explore DSA
                </Button>
              </div>

              {/* Right Mockup: DSA Roadmap List */}
              <div className="md:col-span-6">
                <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-2xl border border-slate-100 text-left">
                  {/* Tabs */}
                  <div className="flex items-center gap-4 border-b border-slate-100 pb-2.5 mb-3 text-xs font-semibold">
                    <button
                      onClick={() => setActiveDsaTab('roadmap')}
                      className={`pb-1 transition-colors relative cursor-pointer ${
                        activeDsaTab === 'roadmap' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Roadmap
                      {activeDsaTab === 'roadmap' && (
                        <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-[#0b5c39]" />
                      )}
                    </button>
                    <button
                      onClick={() => setActiveDsaTab('problems')}
                      className={`pb-1 transition-colors cursor-pointer ${
                        activeDsaTab === 'problems' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Problems
                    </button>
                    <button
                      onClick={() => setActiveDsaTab('contests')}
                      className={`pb-1 transition-colors cursor-pointer ${
                        activeDsaTab === 'contests' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Contests
                    </button>
                  </div>

                  {/* List of Roadmap Items */}
                  <div className="space-y-2">
                    {DSA_ROADMAP_ITEMS.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                          item.status === 'in-progress'
                            ? 'bg-emerald-50/70 border border-emerald-200/80 font-semibold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 shrink-0" />
                          ) : item.status === 'in-progress' ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                              ✓
                            </div>
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className="text-slate-800">
                            {item.id}. {item.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                          <span
                            className={
                              item.status === 'completed'
                                ? 'text-emerald-700 font-semibold'
                                : item.status === 'in-progress'
                                  ? 'text-emerald-700 font-bold'
                                  : 'text-slate-400'
                            }
                          >
                            {item.solved}/{item.total}
                          </span>
                          <ChevronRight className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Development Showcase */}
          <div className="relative rounded-3xl bg-[#092119] border border-emerald-900/60 p-6 sm:p-8 lg:p-10 text-white overflow-hidden shadow-xl flex flex-col justify-between">
            {/* Ambient inner glow */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px]" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Details */}
              <div className="md:col-span-6 text-left">
                <div className="mb-4">
                  <Badge variant="mint-dark" className="border-emerald-500/40 text-emerald-300">
                    Development
                  </Badge>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                  Build for the Real World
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-light">
                  Learn modern technologies, complete hands-on projects, and build a portfolio that makes you stand out.
                </p>
                <Button variant="emerald" size="md" withArrow>
                  Explore Development
                </Button>
              </div>

              {/* Right Mockup: Dev Modules */}
              <div className="md:col-span-6">
                <div className="bg-white rounded-2xl p-4 text-slate-900 shadow-2xl border border-slate-100 text-left">
                  <div className="space-y-2.5">
                    {DEV_MODULES.map((mod) => (
                      <div
                        key={mod.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          {getDevIcon(mod.iconType)}
                          <span className="text-xs font-semibold text-slate-800">
                            {mod.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {mod.statusType === 'completed' && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                              Completed <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-100" />
                            </span>
                          )}
                          {mod.statusType === 'in-progress' && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              In Progress <Circle className="w-3 h-3 text-blue-500" />
                            </span>
                          )}
                          {mod.statusType === 'upcoming' && (
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
                              Upcoming <Circle className="w-3 h-3 text-slate-300" />
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
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
