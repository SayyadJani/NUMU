import React from 'react';
import { History, Code2, GitPullRequest, Flame, Trophy } from 'lucide-react';
import { DUMMY_ACTIVITIES } from '@/data/dashboard-mock';

const ICONS = {
  dsa: Code2,
  project: GitPullRequest,
  streak: Flame,
  contest: Trophy,
};

export function RecentActivity() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <History className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Recent Milestones</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Synced in real-time</span>
        </div>

        {/* Timeline list */}
        <div className="space-y-3">
          {DUMMY_ACTIVITIES.map((act) => {
            const Icon = ICONS[act.type as keyof typeof ICONS] || Code2;

            return (
              <div key={act.id} className="flex items-start gap-2.5 text-xs">
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-slate-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-slate-800 leading-tight truncate">
                    {act.title}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {act.detail}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {act.xp}
                  </span>
                  <div className="text-[9px] text-slate-400 mt-0.5">{act.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 text-center">
        <button className="text-xs font-bold text-[#0b5c39] hover:underline cursor-pointer">
          View Complete Learning History →
        </button>
      </div>
    </div>
  );
}
