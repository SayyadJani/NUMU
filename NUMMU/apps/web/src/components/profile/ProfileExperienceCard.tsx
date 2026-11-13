'use client';

import React from 'react';
import { Briefcase, Plus, GraduationCap } from 'lucide-react';
import type { UserProfile } from '@/types/profile';

interface ProfileExperienceCardProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
  onEditExperience?: () => void;
}

export function ProfileExperienceCard({
  profile,
  isOwnProfile = true,
  onEditExperience,
}: ProfileExperienceCardProps) {
  const hasEducation = Boolean(profile.college && profile.college !== 'Not specified');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Work Experience
        </h2>
        {isOwnProfile && onEditExperience && (
          <button
            onClick={onEditExperience}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-[#111827] dark:bg-[#0c1f17] border border-slate-800 dark:border-emerald-950/60 p-4 shadow-xs transition-colors">
        {hasEducation ? (
          <div className="flex items-start gap-3 p-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center shrink-0 text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">
                {profile.college}
              </h4>
              <p className="text-[11px] text-slate-400">
                {profile.department || 'Computer Science'} {profile.batch ? `• ${profile.batch}` : ''}
              </p>
            </div>
          </div>
        ) : (
          /* Empty State matching takeUforward screenshot exactly */
          <div className="border border-dashed border-slate-700/60 dark:border-emerald-900/40 rounded-xl p-6 text-center bg-slate-900/30 dark:bg-[#082218]/30">
            <div className="w-8 h-8 rounded-full bg-slate-800/80 dark:bg-[#0a271c] border border-slate-700 dark:border-emerald-800/40 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No work experience added</p>
            {isOwnProfile && onEditExperience && (
              <button
                onClick={onEditExperience}
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add experience</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
