'use client';

import React from 'react';
import Image from 'next/image';
import { Edit3, Check } from 'lucide-react';
import { CharacterAvatar } from '@/components/ui/character-avatar';
import type { UserProfile } from '@/types/profile';

interface ProfileHeroBannerProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEditProfile?: () => void;
}

export function ProfileHeroBanner({
  profile,
  isOwnProfile = true,
  onEditProfile,
}: ProfileHeroBannerProps) {
  // Get initials for avatar fallback (e.g. "Jani Pasha" -> "JA")
  const getInitials = (name?: string, fallback = 'U') => {
    if (!name) return fallback.toUpperCase();
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(profile.displayName || profile.username, profile.username || 'JA');

  return (
    <div className="bg-[#111827] dark:bg-[#0c1f17] border border-slate-800 dark:border-emerald-950/60 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm transition-colors">
      {/* ── Top Cover Banner ── */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-[#0b1728] via-[#0d2238] to-[#0a192f] dark:from-[#06150e] dark:via-[#082218] dark:to-[#0b2b1e]">
        {/* Curving decorative geometric arcs matching takeUforward screenshot */}
        <svg
          className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M-50,300 C200,280 400,100 700,120 C900,130 950,50 1100,20 L1100,300 Z"
            fill="url(#waveGrad1)"
          />
          <path
            d="M0,300 C300,260 550,60 850,80 C980,90 1050,40 1150,-10"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1.5"
          />
          <path
            d="M-100,300 C250,220 500,40 800,60 C950,70 1020,20 1150,-20"
            stroke="rgba(16, 185, 129, 0.2)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="waveGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#0f2b3e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#061e14" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        {/* Edit Banner Button (Top Right) */}
        {isOwnProfile && onEditProfile && (
          <button
            onClick={onEditProfile}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Edit profile & banner"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Profile Details Row ── */}
      <div className="px-6 pb-6 pt-0 relative">
        {/* Overlapping Avatar Circle */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
          <div className="relative inline-block shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-[#111827] dark:bg-[#0c1f17] ring-4 ring-[#2563eb]/40 dark:ring-emerald-500/40 shadow-xl overflow-hidden">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] dark:from-[#0a2318] dark:to-[#04130c] flex items-center justify-center select-none text-white text-2xl sm:text-3xl font-extrabold tracking-wider">
                {profile.avatarUrl && (profile.avatarUrl.startsWith('http') || profile.avatarUrl.startsWith('/')) ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : profile.avatarUrl ? (
                  <CharacterAvatar type={profile.avatarUrl} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>

            {/* Edit Avatar Pencil Button */}
            {isOwnProfile && onEditProfile && (
              <button
                onClick={onEditProfile}
                className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-[#2563eb] hover:bg-blue-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white flex items-center justify-center shadow-md ring-2 ring-[#111827] dark:ring-[#0c1f17] transition-all cursor-pointer hover:scale-105"
                title="Change Avatar"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Edit Profile Button (Right Aligned) */}
          {isOwnProfile && onEditProfile && (
            <button
              onClick={onEditProfile}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-600 dark:bg-[#0b5c39] dark:hover:bg-[#094d2f] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer self-start sm:self-end"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {/* User Name, Handle, Role Badge */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {profile.displayName || profile.username}
            </h1>
            <span className="text-sm font-normal text-slate-400">
              @{profile.username}
            </span>

            {/* Role Badge (e.g. Student / Member / Other) */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#1e293b] dark:bg-[#082218] text-slate-300 dark:text-emerald-300 border border-slate-700 dark:border-emerald-900/50">
              {profile.department || 'Student'}
            </span>

            {profile.isVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Verified
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 pt-0.5">
            {profile.joinedDate ? profile.joinedDate : 'Active NUMU Developer'}
            {profile.college && profile.college !== 'Not specified' ? ` • ${profile.college}` : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
