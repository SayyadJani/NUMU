'use client';

import React, { useState } from 'react';
import { Trophy, Clock, Users, CheckCircle2, Sparkles } from 'lucide-react';
import { DUMMY_UPCOMING_CONTEST } from '@/data/dashboard-mock';

export function UpcomingContest() {
  const [isRegistered, setIsRegistered] = useState(DUMMY_UPCOMING_CONTEST.isRegistered);
  const [count, setCount] = useState(DUMMY_UPCOMING_CONTEST.registeredCount);

  const toggleRegister = () => {
    if (isRegistered) {
      setIsRegistered(false);
      setCount((prev) => prev - 1);
    } else {
      setIsRegistered(true);
      setCount((prev) => prev + 1);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left group hover:border-emerald-300 transition-all">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-sm font-bold text-slate-900">Weekly Contest</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Starts in {DUMMY_UPCOMING_CONTEST.countdown.split(' ')[0]}
          </span>
        </div>

        {/* Contest Name */}
        <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-2 group-hover:text-[#0b5c39] transition-colors">
          {DUMMY_UPCOMING_CONTEST.title}
        </h3>

        {/* Schedule & Metadata */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{DUMMY_UPCOMING_CONTEST.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{count.toLocaleString()} registered participants</span>
          </div>
        </div>

        {/* Prize / Incentive */}
        <div className="p-2 rounded-xl bg-amber-50/50 border border-amber-100/80 flex items-center gap-2 text-[10px] text-amber-800 font-medium mb-3">
          <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
          <span className="truncate">{DUMMY_UPCOMING_CONTEST.prize}</span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={toggleRegister}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] ${
            isRegistered
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
              : 'bg-[#0b5c39] hover:bg-[#08482c] text-white'
          }`}
        >
          {isRegistered ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Registered Successfully ✓</span>
            </>
          ) : (
            <span>Register for Free</span>
          )}
        </button>
      </div>
    </div>
  );
}
