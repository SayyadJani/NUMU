'use client';

import React from 'react';
import { Search, Globe, School, Calendar, Zap, X, SlidersHorizontal } from 'lucide-react';
import type { CompetitiveTier } from '@/data/leaderboard-data';

export type LeaderboardScope = 'global' | 'college' | 'batch' | 'contests';
export type LeaderboardTimeframe = 'all-time' | 'monthly' | 'weekly';

interface LeaderboardFiltersProps {
  scope: LeaderboardScope;
  setScope: (scope: LeaderboardScope) => void;
  timeframe: LeaderboardTimeframe;
  setTimeframe: (timeframe: LeaderboardTimeframe) => void;
  tierFilter: 'all' | CompetitiveTier;
  setTierFilter: (tier: 'all' | CompetitiveTier) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalFilteredCount: number;
}

export function LeaderboardFilters({
  scope,
  setScope,
  timeframe,
  setTimeframe,
  tierFilter,
  setTierFilter,
  searchQuery,
  setSearchQuery,
  totalFilteredCount: _totalFilteredCount,
}: LeaderboardFiltersProps) {
  const scopeTabs: { id: LeaderboardScope; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'global', label: 'Global Circuit', icon: Globe, badge: '12.4k' },
    { id: 'college', label: 'Campus Arena (BVRIT)', icon: School, badge: '480' },
    { id: 'batch', label: 'Batch 2026 League', icon: Calendar, badge: '1.2k' },
    { id: 'contests', label: 'Contest Sprints', icon: Zap, badge: 'Live' },
  ];

  const timeframes: { id: LeaderboardTimeframe; label: string }[] = [
    { id: 'all-time', label: 'Season 4 All-Time' },
    { id: 'monthly', label: 'This Month' },
    { id: 'weekly', label: 'Weekly Blitz' },
  ];

  const tierOptions: { id: 'all' | CompetitiveTier; label: string; dotColor: string }[] = [
    { id: 'all', label: 'All Divisions', dotColor: 'bg-slate-400' },
    { id: 'Legend', label: 'Legend', dotColor: 'bg-purple-500 shadow-purple-500/50' },
    { id: 'Guardian', label: 'Guardian', dotColor: 'bg-rose-500 shadow-rose-500/50' },
    { id: 'Knight', label: 'Knight', dotColor: 'bg-amber-500 shadow-amber-500/50' },
    { id: 'Specialist', label: 'Specialist', dotColor: 'bg-sky-500 shadow-sky-500/50' },
  ];

  return (
    <div className="space-y-3.5">
      {/* ── Row 1: Arena Scope Switcher & Search Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Tactical Scope Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto scrollbar-none">
          {scopeTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = scope === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setScope(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0b5c39] to-[#08482c] text-white shadow-md shadow-emerald-900/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Console */}
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coder, handle, or college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-14 py-2.5 bg-white border border-slate-200/90 rounded-2xl text-xs text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-[#0b5c39] focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 pointer-events-none">
              /
            </span>
          )}
        </div>
      </div>

      {/* ── Row 2: Division Gem Filters & Timeframe Switch ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Tier Division Pills with Crystal Dots */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Division:</span>
          </span>

          {tierOptions.map((t) => {
            const isSelected = tierFilter === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTierFilter(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                    : 'bg-white text-slate-600 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${t.dotColor} ${isSelected ? 'animate-pulse' : ''}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-2xl border border-slate-200 text-xs shrink-0">
          {timeframes.map((tf) => {
            const isSelected = timeframe === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-3 py-1.2 rounded-xl font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tf.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
