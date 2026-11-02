'use client';

import React, { useState, useMemo, useRef } from 'react';
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
import {
  LEADERBOARD_USERS,
  type LeaderboardEntry,
  type CompetitiveTier,
  CURRENT_USER_LEADERBOARD_STATS,
} from '@/data/leaderboard-data';
import { ChevronRight, Trophy, Sparkles } from 'lucide-react';

export default function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all-time');
  const [tierFilter, setTierFilter] = useState<'all' | CompetitiveTier>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserModal, setSelectedUserModal] = useState<LeaderboardEntry | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const tableRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter rankers based on scope, tier, and search query
  const filteredUsers = useMemo(() => {
    return LEADERBOARD_USERS.filter((user) => {
      // Scope filter
      if (scope === 'college' && !user.college.toLowerCase().includes('bvrit')) {
        return false;
      }
      if (scope === 'batch' && user.batch !== '2026') {
        return false;
      }

      // Division tier filter
      if (tierFilter !== 'all' && user.tier !== tierFilter) {
        return false;
      }

      // Search query filter
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
  }, [scope, tierFilter, searchQuery]);

  // Top 3 for the physical podium stage
  const topThree = useMemo(() => {
    return LEADERBOARD_USERS.slice(0, 3);
  }, []);

  const handleJumpToMe = () => {
    showToast('Locating your position in standings (Rank #142)... 🎯');
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
    const me = LEADERBOARD_USERS.find((u) => u.isCurrentUser);
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
              <LeaderboardTable
                entries={filteredUsers}
                onSelectUser={(u) => setSelectedUserModal(u)}
                onJumpToMe={handleJumpToMe}
                onResetFilters={handleResetFilters}
              />
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

              <LeaderboardTierGuide currentTier={CURRENT_USER_LEADERBOARD_STATS.tier} />
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
