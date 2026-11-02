'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Play, CheckCircle2 } from 'lucide-react';

const PATH_ITEMS = [
  {
    id: 1,
    title: 'Binary Search & Rotated Arrays',
    subtitle: 'DSA · Searching Algorithm',
    status: 'current' as const,
    link: '/tests/weekly-dsa-12/attempt',
  },
  {
    id: 2,
    title: 'Two Pointers & Sliding Window',
    subtitle: 'DSA · Advanced Array Manipulation',
    status: 'completed' as const,
    link: '/tests/weekly-dsa-12/attempt',
  },
  {
    id: 3,
    title: 'Trees & Depth First Search',
    subtitle: 'DSA · Tree Traversals',
    status: 'locked' as const,
    link: '/dashboard/dsa',
  },
  {
    id: 4,
    title: 'Dynamic Programming Foundations',
    subtitle: 'DSA · Memoization & Tabulation',
    status: 'locked' as const,
    link: '/dashboard/dsa',
  },
];

export function CurrentLearningPath() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-900">Current Roadmap Path</span>
          <Link
            href="/dashboard/dsa"
            className="text-xs text-emerald-700 font-semibold flex items-center gap-0.5 hover:underline"
          >
            <span>Full Roadmap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Path Items with Vertical Connecting Line */}
        <div className="relative">
          <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-slate-200" />

          <div className="space-y-2">
            {PATH_ITEMS.map((item) => (
              <div
                key={item.id}
                className={`relative flex items-center gap-3 p-2 rounded-2xl transition-all ${
                  item.status === 'current'
                    ? 'bg-emerald-50/70 border border-emerald-200'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Status Dot */}
                <div
                  className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    item.status === 'completed'
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : item.status === 'current'
                      ? 'bg-white border-emerald-600 ring-4 ring-emerald-100'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {item.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {item.status === 'current' && (
                    <div className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-bold truncate ${
                      item.status === 'current' ? 'text-emerald-900 font-extrabold' : 'text-slate-800'
                    }`}
                  >
                    {item.title}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
                </div>

                {/* Continue button on current */}
                {item.status === 'current' && (
                  <Link
                    href={item.link as React.ComponentProps<typeof Link>['href']}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-[#0b5c39] hover:bg-[#08482c] text-white text-[10px] font-bold rounded-lg transition-colors shadow-2xs"
                  >
                    <Play className="w-2.5 h-2.5 fill-white" />
                    <span>Resume</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Step 2 of 8 in Module</span>
        <span className="text-emerald-700 font-bold">Offer Ready Track</span>
      </div>
    </div>
  );
}
