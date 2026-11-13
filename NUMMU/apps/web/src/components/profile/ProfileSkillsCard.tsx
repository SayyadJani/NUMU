'use client';

import React from 'react';
import { Wrench, Plus, Sparkles } from 'lucide-react';
import type { DevSkill } from '@/types/profile';

interface ProfileSkillsCardProps {
  skills: DevSkill[];
  isOwnProfile?: boolean;
  onManageSkills?: () => void;
}

export function ProfileSkillsCard({
  skills,
  isOwnProfile = true,
  onManageSkills,
}: ProfileSkillsCardProps) {
  const hasSkills = skills && skills.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Skills
        </h2>
        {hasSkills && isOwnProfile && onManageSkills && (
          <button
            onClick={onManageSkills}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Manage</span>
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-[#111827] dark:bg-[#0c1f17] border border-slate-800 dark:border-emerald-950/60 p-4 shadow-xs transition-colors">
        {hasSkills ? (
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#1e293b] dark:bg-[#082218] text-slate-200 dark:text-emerald-300 border border-slate-700/80 dark:border-emerald-900/40"
              >
                <span>{skill.icon || '⚡'}</span>
                <span>{skill.name}</span>
              </span>
            ))}
          </div>
        ) : (
          /* Empty state matching takeUforward screenshot exactly */
          <div className="border border-dashed border-slate-700/60 dark:border-emerald-900/40 rounded-xl p-6 text-center bg-slate-900/30 dark:bg-[#082218]/30">
            <div className="w-8 h-8 rounded-full bg-slate-800/80 dark:bg-[#0a271c] border border-slate-700 dark:border-emerald-800/40 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <p className="text-xs font-semibold text-slate-300">No skills added</p>
            {isOwnProfile && onManageSkills && (
              <button
                onClick={onManageSkills}
                className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add skills</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
