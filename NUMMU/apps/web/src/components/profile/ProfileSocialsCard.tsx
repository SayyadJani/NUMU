'use client';

import React from 'react';
import { ExternalLink, Globe, Plus } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/ui/icons';
import type { SocialLink } from '@/types/profile';

interface ProfileSocialsCardProps {
  socials: SocialLink[];
  isOwnProfile?: boolean;
  onEditSocials?: () => void;
}

export function ProfileSocialsCard({
  socials,
  isOwnProfile = true,
  onEditSocials,
}: ProfileSocialsCardProps) {
  const hasSocials = socials && socials.length > 0;

  const renderIcon = (platform: string) => {
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
          Social Links
        </h2>
        {isOwnProfile && onEditSocials && (
          <button
            onClick={onEditSocials}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>{hasSocials ? 'Edit' : 'Add'}</span>
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-[#111827] dark:bg-[#0c1f17] border border-slate-800 dark:border-emerald-950/60 p-4 shadow-xs transition-colors">
        {hasSocials ? (
          <div className="flex flex-col gap-2">
            {socials.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 dark:bg-[#082218] border border-slate-800 dark:border-emerald-900/40 hover:border-slate-700 dark:hover:border-emerald-700 hover:text-white text-slate-300 text-xs font-medium transition-all group"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-slate-400 group-hover:text-emerald-400 transition-colors">
                    {renderIcon(social.platform)}
                  </span>
                  <span className="truncate">{social.label || social.url}</span>
                </div>
                <ExternalLink className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
              </a>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-700/60 dark:border-emerald-900/40 rounded-xl p-5 text-center bg-slate-900/30 dark:bg-[#082218]/30">
            <p className="text-xs text-slate-400">No social profiles linked</p>
            {isOwnProfile && onEditSocials && (
              <button
                onClick={onEditSocials}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 dark:text-emerald-400 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Link profiles</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
