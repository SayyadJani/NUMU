'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { LeaderboardUserBanner } from '@/components/leaderboard/leaderboard-user-banner';
import { LeaderboardPodium } from '@/components/leaderboard/leaderboard-podium';
import {
  LeaderboardFilters,
  type LeaderboardScope,
  type LeaderboardTimeframe,
} from '@/components/leaderboard/leaderboard-filters';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { CollegeRankingsCard } from '@/components/leaderboard/college-rankings-card';
import { LeaderboardTierGuide } from '@/components/leaderboard/leaderboard-tier-guide';
import { CoderDetailModal } from '@/components/leaderboard/coder-detail-modal';
import { leaderboardService } from '@/services/leaderboard.service';
import {
  type LeaderboardEntry,
  type CompetitiveTier,
  CURRENT_USER_LEADERBOARD_STATS,
} from '@/data/leaderboard-data';
import { ChevronRight, Trophy, Sparkles, Loader2 } from 'lucide-react';

export default function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all-time');
  const [tierFilter, setTierFilter] = useState<'all' | CompetitiveTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserModal, setSelectedUserModal] = useState<LeaderboardEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live API States
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [currentUserStats, setCurrentUserStats] = useState(CURRENT_USER_LEADERBOARD_STATS);
  const [loading, setLoading] = useState(true);

  const tableRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch live tournament standings and user rank on mount & parameter updates
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      leaderboardService.getEntries({
        scope,
        tier: tierFilter,
        timeframe,
        search: searchQuery,
      }),
      leaderboardService.getUserRank(),
    ]).then(([entriesRes, rankRes]) => {
      if (!isMounted) return;

      if (entriesRes.status === 'fulfilled' && entriesRes.value?.entries) {
        setEntries(entriesRes.value.entries);
      }
      if (rankRes.status === 'fulfilled' && rankRes.value) {
        setCurrentUserStats(rankRes.value);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [scope, tierFilter, timeframe, searchQuery]);

  // Filter rankers based on scope, tier, and search query locally as fast filter
  const filteredUsers = useMemo(() => {
    return entries.filter((user) => {
      if (scope === 'college' && !user.college.toLowerCase().includes('bvrit')) {
        return false;
      }
      if (scope === 'batch' && user.batch !== '2026') {
        return false;
      }
      if (tierFilter !== 'all' && user.tier !== tierFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesUsername = user.username.toLowerCase().includes(q);
        const matchesCollege = user.college.toLowerCase().includes(q);
        const matchesSpecialty = user.specialtyTitle.toLowerCase().includes(q);
        const matchesLang = user.primaryLang.toLowerCase().includes(q);
        return matchesName || matchesUsername || matchesCollege || matchesSpecialty || matchesLang;
      }
      return true;
    });
  }, [entries, scope, tierFilter, searchQuery]);

  // Top 3 for the physical podium stage
  const topThree = useMemo(() => {
    return entries.slice(0, 3);
  }, [entries]);

  const handleJumpToMe = () => {
    showToast(`Locating your position in standings (Rank #${currentUserStats.globalRank})... 🎯`);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setScope('global');
    setTierFilter('all');
    setSearchQuery('');
    showToast('Circuit filters cleared.');
  };

  const handleChallengeDuel = (user: LeaderboardEntry) => {
    setSelectedUserModal(null);
    showToast(`⚔️ 1v1 Arena challenge transmitted to ${user.name}! Awaiting match accept.`);
  };

  const handleInspectMe = () => {
    const me = entries.find((u) => u.isCurrentUser) || entries[0];
    if (me) setSelectedUserModal(me);
  };

  return (
    <>
      <main className="flex-1 px-6 py-5 pt-4 space-y-6">

        {/* ══ Breadcrumbs & Status ══════════════════════════════════════════ */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Arena Leaderboard</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-50 border border-amber-200/90 px-3 py-1 rounded-full shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Season 4 Official Circuit • Live Standings</span>
            </span>
          </div>
        </div>

        {/* Toast Notification HUD */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#071912] text-white text-xs font-bold px-4.5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ══ 1. Current User Standing Banner (Esports Competitor Pass) ════ */}
        <LeaderboardUserBanner
          stats={currentUserStats}
          onJumpToMe={handleJumpToMe}
          onInspectMe={handleInspectMe}
        />

        {/* ══ 2. Hall of Champions: 3D Stepped Podium Stage ══════════════════ */}
        <LeaderboardPodium
          topThree={topThree}
          onSelectUser={(u) => setSelectedUserModal(u)}
        />

        {/* ══ 3. Arena Circuit Filters & Search Console ═════════════════════ */}
        <LeaderboardFilters
          scope={scope}
          setScope={setScope}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          tierFilter={tierFilter}
          setTierFilter={setTierFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalFilteredCount={filteredUsers.length}
        />

        {/* ══ 4. Rankings Table + Sidebar Panels Grid ════════════════════════ */}
        <div className="grid grid-cols-12 gap-6 items-start" ref={tableRef}>
          {/* Left 8 Cols: Full Rankings Tournament Standings */}
          <div className="col-span-12 xl:col-span-8">
            {loading && entries.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <p className="text-sm font-bold text-slate-600">Connecting to arena circuit standings...</p>
              </div>
            ) : (
              <LeaderboardTable
                entries={filteredUsers}
                currentUserRank={currentUserStats.globalRank}
                onSelectUser={(u) => setSelectedUserModal(u)}
                onJumpToMe={handleJumpToMe}
                onResetFilters={handleResetFilters}
              />
            )}
          </div>

          {/* Right 4 Cols: Campus Cup Scoreboard + Division Ladder */}
          <div className="col-span-12 xl:col-span-4 space-y-6">
            <CollegeRankingsCard
              onViewAllColleges={() => showToast('Full Collegiate Directory with 200+ universities opened.')}
              onSelectCollege={(cName) => {
                setSearchQuery(cName);
                showToast(`Filtered standings for ${cName}`);
              }}
            />

            <LeaderboardTierGuide currentTier={currentUserStats.tier} />
          </div>
        </div>
      </main>

      {/* ══ Interactive Competitor Dossier Modal ═══════════════════════════════ */}
      <CoderDetailModal
        user={selectedUserModal}
        onClose={() => setSelectedUserModal(null)}
        onChallenge={handleChallengeDuel}
      />
    </>
  );
}
