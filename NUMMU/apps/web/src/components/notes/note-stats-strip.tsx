'use client';

import React from 'react';
import { Pin, Code2, Server } from 'lucide-react';
import type { NoteItem } from '@/services/notes.service';

interface NoteStatsStripProps {
  notes: NoteItem[];
}

export function NoteStatsStrip({ notes }: NoteStatsStripProps) {
  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const dsaCount = notes.filter((n) => n.category === 'dsa').length;
  const systemCount = notes.filter((n) => n.category === 'system-design' || n.category === 'web-dev').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Total Notes
        </div>
        <div className="text-2xl font-extrabold text-slate-900 mt-1">{notes.length}</div>
        <div className="text-[11px] text-slate-500 mt-0.5">Knowledge entries</div>
      </div>

      <div className="bg-white rounded-2xl border border-amber-200/60 p-4 shadow-2xs">
        <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
          <Pin className="w-3 h-3 text-amber-600" />
          <span>Pinned</span>
        </div>
        <div className="text-2xl font-extrabold text-amber-900 mt-1">{pinnedCount}</div>
        <div className="text-[11px] text-amber-700/80 mt-0.5">Quick access items</div>
      </div>

      <div className="bg-white rounded-2xl border border-emerald-200/60 p-4 shadow-2xs">
        <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
          <Code2 className="w-3 h-3 text-emerald-600" />
          <span>DSA Patterns</span>
        </div>
        <div className="text-2xl font-extrabold text-emerald-900 mt-1">{dsaCount}</div>
        <div className="text-[11px] text-emerald-700/80 mt-0.5">Algorithms & Tricks</div>
      </div>

      <div className="bg-white rounded-2xl border border-blue-200/60 p-4 shadow-2xs">
        <div className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
          <Server className="w-3 h-3 text-blue-600" />
          <span>System & Dev</span>
        </div>
        <div className="text-2xl font-extrabold text-blue-900 mt-1">{systemCount}</div>
        <div className="text-[11px] text-blue-700/80 mt-0.5">Architecture & Web</div>
      </div>
    </div>
  );
}
