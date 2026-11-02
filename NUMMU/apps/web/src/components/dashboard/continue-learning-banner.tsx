'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Monitor } from 'lucide-react';

interface TrackItem {
  id: string;
  name: string;
  topic: string;
  nextItem: string;
  badge: string;
  completed: number;
  total: number;
  progress: number;
  link: string;
  icon: typeof Code2;
}

const TRACKS: TrackItem[] = [
  {
    id: 'dsa',
    name: 'DSA Mastery Track',
    topic: 'Binary Search & Rotated Arrays',
    nextItem: 'Search in Rotated Sorted Array',
    badge: 'Medium',
    completed: 14,
    total: 20,
    progress: 70,
    link: '/tests/weekly-dsa-12/attempt',
    icon: Code2,
  },
  {
    id: 'fullstack',
    name: 'Fullstack SaaS Capstone',
    topic: 'Authentication & Database Security',
    nextItem: 'Refresh Token Rotation & Cookies',
    badge: 'In Progress',
    completed: 3,
    total: 5,
    progress: 60,
    link: '/dashboard/projects',
    icon: Monitor,
  },
];

export function ContinueLearningBanner() {
  const [activeTrackId, setActiveTrackId] = useState('dsa');
  const activeTrack = TRACKS.find((t) => t.id === activeTrackId) ?? TRACKS[0] ?? {
    id: 'dsa',
    name: 'DSA Track',
    topic: 'Algorithms',
    nextItem: 'Problems',
    badge: 'Ongoing',
    completed: 0,
    total: 10,
    progress: 0,
    link: '/dashboard/dsa',
    icon: Code2,
  };

  return (
    <div className="relative bg-gradient-to-r from-[#072417] via-[#051c12] to-[#03130c] text-white rounded-3xl p-5 sm:p-6 overflow-hidden shadow-md border border-emerald-950/40 text-left">
      {/* Background glow and decorative aura */}
      <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 -mb-20 w-60 h-60 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Track Switcher + Module Info */}
        <div className="space-y-3 flex-1 min-w-0">
          {/* Track Switcher Tabs */}
          <div className="flex items-center gap-2">
            {TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => setActiveTrackId(track.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTrackId === track.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <track.icon className="w-3.5 h-3.5" />
                <span>{track.name}</span>
              </button>
            ))}
          </div>

          <div>
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
              Current Focus Module
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight truncate">
              {activeTrack.topic}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-200/70">
              <span>Next: <strong className="text-white font-semibold">{activeTrack.nextItem}</strong></span>
              <span>•</span>
              <span className="px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {activeTrack.badge}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Progress Bar and Stats */}
        <div className="w-full lg:max-w-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-emerald-200/80">
            <span>
              {activeTrack.completed} of {activeTrack.total} problems completed
            </span>
            <span className="font-mono font-bold text-emerald-400">
              {activeTrack.progress}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
              style={{ width: `${activeTrack.progress}%` }}
            />
          </div>
        </div>

        {/* Right: CTA Button to Jump Right In */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href={activeTrack.link as React.ComponentProps<typeof Link>['href']}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Resume Solving</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
