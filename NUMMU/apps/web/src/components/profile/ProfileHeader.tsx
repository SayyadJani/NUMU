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
  UserCheck,
  UserPlus,
  Sparkles,
  Globe,
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/icons';
import { CharacterAvatar } from '@/components/ui/character-avatar';
import type { UserProfile } from '@/types/profile';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
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
    <div className="relative w-full">
      {/* ── Modern Cover Banner ── */}
      <div className="relative h-44 sm:h-52 md:h-60 w-full overflow-hidden bg-gradient-to-r from-slate-950 via-[#072417] to-slate-900 border-b border-emerald-950/40">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient glow blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top banner controls / tags */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for collaborations</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-300 text-xs font-mono backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NUMU Verified Developer</span>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-end text-emerald-400/80 font-mono text-xs gap-3">
            <span className="px-2.5 py-1 rounded-md bg-slate-950/60 border border-emerald-500/20">
              Rank #{profile.stats.globalRank ?? 842}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-950/60 border border-emerald-500/20">
              Contest Rating {profile.stats.contestRating}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Profile Identity Card ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 z-20">
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            {/* Left: Avatar + Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
              {/* Avatar with ring glow */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 via-[#0b5c39] to-teal-800 p-1 shadow-xl ring-4 ring-white">
                  <div className="w-full h-full rounded-[14px] sm:rounded-[22px] bg-[#0b5c39] flex items-center justify-center text-4xl sm:text-5xl font-black text-white select-none">
                    {profile.avatarUrl && (profile.avatarUrl.startsWith('http') || profile.avatarUrl.startsWith('/')) ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover rounded-[14px] sm:rounded-[22px]"
                      />
                    ) : (
                      <CharacterAvatar type={profile.avatarUrl || 'male'} />
                    )}
                  </div>
                </div>
                {/* Active status indicator badge */}
                <div
                  className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-400/30 flex items-center justify-center"
                  title="Online"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>

              {/* Name & Academic Meta */}
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {profile.displayName}
                  </h1>

                  {profile.isVerified && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold"
                      title="Verified NUMU Member"
                    >
                      <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                      Verified
                    </span>
                  )}
                </div>

                {/* Handle and Developer Status */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <button
                    onClick={handleCopyHandle}
                    className="inline-flex items-center gap-1 font-mono font-medium text-slate-600 hover:text-emerald-700 transition-colors bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-md"
                    title="Click to copy handle"
                  >
                    @{profile.username}
                    {copiedHandle ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>

                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold font-mono text-xs">
                    Rank #{profile.stats.globalRank ?? 1}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-700 font-semibold text-xs">
                    {profile.stats.contestRating ?? 1200} Rating
                  </span>
                </div>

                {/* Academic Institution info */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">{profile.college}</span>
                  </div>
                  <span className="hidden sm:inline text-slate-300">•</span>
                  <div className="text-slate-600">
                    {profile.department} <span className="text-slate-400">({profile.batch})</span>
                  </div>
                </div>

                {/* Location & Joined Date */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.joinedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.joinedDate}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions & Socials */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 pt-2 lg:pt-0">
              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="relative inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              {/* Social Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {profile.socials.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600 text-xs font-medium transition-all"
                  >
                    {renderSocialIcon(social.platform)}
                    <span className="truncate max-w-[120px]">{social.label}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bio & Interest Tags */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl whitespace-pre-line">
              {profile.bio}
            </p>

            <div className="flex flex-wrap gap-2 mt-3.5">
              {profile.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200/80 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
