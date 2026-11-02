import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { DsaTopic } from '@/data/dsa-mock';

interface DsaTopicCardProps {
  topic: DsaTopic;
}

export function DsaTopicCard({ topic }: DsaTopicCardProps) {
  const solved = topic.solvedProblems ?? 0;
  const total = topic.totalProblems || 1;
  const pct = Math.round((solved / total) * 100);

  return (
    <Link
      href={`/dashboard/dsa/problems?topic=${encodeURIComponent(topic.label || topic.slug)}`}
      className="group block bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-lg font-bold shadow-2xs group-hover:scale-105 transition-transform">
            {topic.icon || '📁'}
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
          {topic.label}
        </h3>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {solved}/{total} Solved
          </span>
          <span className="font-bold text-emerald-700">{pct}%</span>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex items-center justify-end text-[11px] font-semibold text-emerald-700 pt-1 group-hover:translate-x-0.5 transition-transform">
          <span>Practice problems</span>
          <ArrowRight className="w-3 h-3 ml-1" />
        </div>
      </div>
    </Link>
  );
}
