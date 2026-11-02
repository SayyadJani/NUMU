'use client';

import React, { useState } from 'react';
import { Quote, Sparkles, RefreshCw } from 'lucide-react';

const MOTIVATION_QUOTES = [
  { text: 'Discipline today, opportunities tomorrow.', author: 'NUMU' },
  { text: 'Small steps every day compound into extraordinary mastery.', author: 'James Clear' },
  { text: 'Algorithms are thoughts made executable. Keep sharpening yours.', author: 'NUMU Platform' },
  { text: 'Consistency beats genius when genius fails to practice.', author: 'NUMU Wisdom' },
];

const STATS = [
  { value: '10K+', label: 'Active Students' },
  { value: '200+', label: 'Colleges' },
  { value: '500K+', label: 'Problems Solved' },
  { value: '94%', label: 'Placement Rate' },
];

export function MotivationStats() {
  const [quoteIdx, setQuoteIdx] = useState(0);

  const nextQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % MOTIVATION_QUOTES.length);
  };

  const current = MOTIVATION_QUOTES[quoteIdx] ?? MOTIVATION_QUOTES[0]!;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left relative overflow-hidden group hover:border-emerald-300 transition-all">
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Quote className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Daily Momentum</span>
          </div>
          <button
            onClick={nextQuote}
            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
            title="Next inspirational quote"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Quote Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0c3824] to-[#04150d] text-white my-1 space-y-2 relative overflow-hidden shadow-xs">
          <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] font-semibold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Wisdom for Developers</span>
          </div>
          <blockquote className="text-xs sm:text-[13px] font-bold text-white leading-relaxed italic">
            &ldquo;{current.text}&rdquo;
          </blockquote>
          <div className="text-[10px] text-emerald-200/70 font-mono">— {current.author}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100 mt-2">
        {STATS.map((s) => (
          <div key={s.label} className="p-2 rounded-xl bg-slate-50/70 text-center">
            <div className="text-sm font-black text-slate-900">{s.value}</div>
            <div className="text-[10px] text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
