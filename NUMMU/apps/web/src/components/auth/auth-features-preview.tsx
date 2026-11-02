import React from 'react';
import { Compass, Code2, Box, Trophy, GraduationCap, BarChart2 } from 'lucide-react';

const FEATURE_LIST = [
  {
    title: 'Structured Roadmaps',
    description: 'Step by step learning paths',
    icon: <Compass className="w-4 h-4 text-emerald-600" />,
  },
  {
    title: 'Curated Practice',
    description: 'Handpicked problems & exercises',
    icon: <Code2 className="w-4 h-4 text-emerald-600" />,
  },
  {
    title: 'Real-world Projects',
    description: 'Build, submit and get reviewed',
    icon: <Box className="w-4 h-4 text-emerald-600" />,
  },
  {
    title: 'Contests & Assessments',
    description: 'Compete, improve and track progress',
    icon: <Trophy className="w-4 h-4 text-emerald-600" />,
  },
  {
    title: 'College Integration',
    description: 'Built for students, trainers and institutions',
    icon: <GraduationCap className="w-4 h-4 text-emerald-600" />,
  },
];

export function AuthFeaturesPreview() {
  return (
    <div className="relative w-full max-w-xl my-4 py-2">
      {/* 5 Feature Items */}
      <div className="space-y-3.5 mb-6 text-left">
        {FEATURE_LIST.map((feat) => (
          <div key={feat.title} className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
              {feat.icon}
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {feat.title}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 leading-tight mt-0.5">
                {feat.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Dashboard Card & Badges Mockup */}
      <div className="relative mt-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white/80 border border-emerald-100 shadow-sm backdrop-blur-xs">
        {/* Floating Top Badge */}
        <div className="absolute -top-3.5 right-6 bg-white border border-emerald-200 shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
          <div className="text-[11px] font-semibold text-slate-800 leading-none">
            Real Skills <span className="text-slate-400 font-normal">·</span> Real Opportunities
          </div>
        </div>

        {/* Mini Student Card preview */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">👋</span>
              <div>
                <div className="text-xs font-bold text-slate-800 leading-tight">Hey, Jani!</div>
                <div className="text-[10px] text-slate-400">Keep learning, keep growing.</div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
              <span>68%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
            <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
              <div className="text-[9px] uppercase font-bold text-emerald-700">DSA</div>
              <div className="text-xs font-semibold text-slate-800 truncate">Binary Search</div>
              <div className="text-[10px] text-slate-400 mt-0.5">12 problems · 60%</div>
            </div>
            <div className="bg-slate-50/80 rounded-lg p-2 border border-slate-100">
              <div className="text-[9px] uppercase font-bold text-blue-700">Upcoming Contest</div>
              <div className="text-xs font-semibold text-slate-800 truncate">Weekly #42</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Sun, 10:00 AM</div>
            </div>
          </div>
        </div>

        {/* Floating Bottom Badge */}
        <div className="mt-3 flex items-center justify-between">
          <div className="bg-[#0b5c39] text-white shadow-sm rounded-xl px-3 py-1.5 flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px] font-semibold">From Campus to Career</span>
          </div>

          {/* Hand-drawn style note */}
          <div className="flex flex-col items-end select-none pointer-events-none pr-1">
            <span className="font-serif italic font-medium text-emerald-800 text-xs rotate-[-4deg]">
              Better Developers
              <br />
              Brighter Futures ↗
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
