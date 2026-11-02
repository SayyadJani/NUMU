'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Check,
  Copy,
  ExternalLink,
  GraduationCap,
  MapPin,
  Calendar,
  Share2,
  Globe,
  Edit3,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/icons';
import { CharacterAvatar } from '@/components/ui/character-avatar';
import type { UserProfile } from '@/types/profile';

interface ProfileSidebarProps {
  profile: UserProfile;
  onEditProfile?: (() => void) | undefined;
}

export function ProfileSidebar({ profile, onEditProfile }: ProfileSidebarProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHandle, setCopiedHandle] = useState(false);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyHandle = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`@${profile.username}`);
      setCopiedHandle(true);
      setTimeout(() => setCopiedHandle(false), 2000);
    }
  };

  const renderSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <GithubIcon className="w-3.5 h-3.5" />;
      case 'linkedin':
        return <LinkedinIcon className="w-3.5 h-3.5" />;
      default:
        return <Globe className="w-3.5 h-3.5" />;
    }
  };

  return (
    <aside className="w-full lg:w-80 xl:w-[340px] shrink-0 space-y-5">
      {/* ── 1. Main Profile Card (LeetCode style) ── */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 relative overflow-hidden">
        {/* Subtle decorative card accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-[#0b5c39] to-teal-700" />

        {/* Avatar + Main Details */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* Character Sticker Avatar */}
          <div className="relative mb-3.5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 via-[#0b5c39] to-teal-800 p-1 shadow-lg ring-4 ring-emerald-50">
              <div className="w-full h-full rounded-[14px] sm:rounded-[20px] overflow-hidden bg-[#0b5c39] flex items-center justify-center select-none">
                {profile.avatarUrl && (profile.avatarUrl.startsWith('http') || profile.avatarUrl.startsWith('/')) ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CharacterAvatar type={profile.avatarUrl || 'male'} />
                )}
              </div>
            </div>
            {/* Online Status Dot */}
            <div
              className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-400/30 flex items-center justify-center"
              title="Online"
            >
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </div>
          </div>

          {/* Name & Verified Badge */}
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {profile.displayName}
            </h1>
            {profile.isVerified && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold"
                title="Verified NUMU Member"
              >
                <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                Verified
              </span>
            )}
          </div>

          {/* Username & Copy */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <button
              onClick={handleCopyHandle}
              className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 hover:text-emerald-700 transition-colors bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md"
              title="Click to copy handle"
            >
              <span>@{profile.username}</span>
              {copiedHandle ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>

          {/* Edit & Share Actions */}
          <div className="flex items-center gap-2 w-full mb-4">
            {onEditProfile && (
              <button
                onClick={onEditProfile}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs bg-[#0b5c39] hover:bg-[#094d2f] text-white hover:shadow-md cursor-pointer active:scale-98"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className={`${onEditProfile ? '' : 'flex-1'} inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98`}
              title="Share profile link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Platform Performance Strip (Rank, Rating, Streak) */}
          <div className="grid grid-cols-3 gap-2 w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-4">
            <div className="text-center">
              <div className="font-extrabold text-emerald-800 text-sm">
                #{profile.stats.globalRank ?? 1}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Rank</div>
            </div>
            <div className="text-center border-x border-slate-200 px-1">
              <div className="font-extrabold text-slate-900 text-sm">
                {profile.stats.contestRating ?? 1200}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Rating</div>
            </div>
            <div className="text-center">
              <div className="font-extrabold text-orange-600 text-sm">
                {profile.stats.dayStreak ?? 0}d
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Streak</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-3 border-t border-slate-100 mb-4">
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line text-left">
            {profile.bio}
          </p>
        </div>

        {/* Metadata Details (College, Location, Joined) */}
        <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100 mb-4">
          <div className="flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="font-bold text-slate-800">{profile.college}</div>
              <div className="text-[11px] text-slate-400">
                {profile.department} • {profile.batch}
              </div>
            </div>
          </div>

          {profile.location && (
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.joinedDate && (
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{profile.joinedDate}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="pt-3 border-t border-slate-100 mb-4">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
            Social Profiles
          </div>
          <div className="flex flex-col gap-1.5">
            {profile.socials.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 text-slate-600 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  {renderSocialIcon(social.platform)}
                  <span className="truncate">{social.label}</span>
                </div>
                <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </a>
            ))}
          </div>
        </div>

        {/* Tags / Skills Chips */}
        <div className="pt-3 border-t border-slate-100">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-2">
            Areas of Focus
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200/60 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
