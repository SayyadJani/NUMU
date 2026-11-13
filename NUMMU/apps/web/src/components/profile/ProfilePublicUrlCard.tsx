'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface ProfilePublicUrlCardProps {
  username: string;
}

export function ProfilePublicUrlCard({ username }: ProfilePublicUrlCardProps) {
  const [copied, setCopied] = useState(false);

  const getProfileUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/profile/${encodeURIComponent(username)}`;
    }
    return `https://numu.io/profile/${username}`;
  };

  const handleCopy = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(getProfileUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
        Public URL
      </div>
      <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#111827] dark:bg-[#0c1f17] border border-slate-800 dark:border-emerald-950/60 shadow-xs">
        <span className="text-xs font-mono text-slate-300 dark:text-slate-200 truncate select-all">
          {getProfileUrl()}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-emerald-300 hover:bg-slate-800 dark:hover:bg-[#082218] transition-colors cursor-pointer shrink-0"
          title="Copy URL"
          aria-label="Copy public profile URL"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
