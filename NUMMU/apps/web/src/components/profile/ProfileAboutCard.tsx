'use client';

import React from 'react';
import { Sparkles, Plus, Edit3, MapPin, GraduationCap, Quote } from 'lucide-react';
import type { UserProfile } from '@/types/profile';

interface ProfileAboutCardProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEditBio?: () => void;
}

export function ProfileAboutCard({
  profile,
  isOwnProfile = true,
  onEditBio,
}: ProfileAboutCardProps) {
  const hasBio = Boolean(profile.bio && profile.bio.trim().length > 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          About
        </h2>
        {hasBio && isOwnProfile && onEditBio && (
          <button
            onClick={onEditBio}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-[#111827] dark:bg-[#0c1f17] border border-slate-800 dark:border-emerald-950/60 p-5 sm:p-6 shadow-xs transition-colors">
        {hasBio ? (
          <div className="space-y-4">
            {profile.quote && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 dark:bg-[#082218] border border-slate-800/80 dark:border-emerald-900/40 text-xs italic text-slate-300">
                <Quote className="w-4 h-4 text-emerald-400 shrink-0 not-italic opacity-80 mt-0.5" />
                <span>{profile.quote}</span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-slate-300 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>

            {/* Location & Education Chips */}
            {(profile.location || profile.college) && (
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/80 dark:border-emerald-950/50 text-xs text-slate-400">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.college && profile.college !== 'Not specified' && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                    <span>{profile.college} {profile.batch ? `(${profile.batch})` : ''}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty State matching takeUforward screenshot exactly */
          <div className="border border-dashed border-slate-700/60 dark:border-emerald-900/40 rounded-xl p-8 sm:p-10 text-center bg-slate-900/30 dark:bg-[#082218]/30">
            <div className="w-9 h-9 rounded-full bg-slate-800/80 dark:bg-[#0a271c] border border-slate-700 dark:border-emerald-800/40 flex items-center justify-center mx-auto mb-2.5 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Tell your story</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Write a short bio to introduce yourself and what you&apos;re working on
            </p>
            {isOwnProfile && onEditBio && (
              <button
                onClick={onEditBio}
                className="mt-3.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add bio</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
