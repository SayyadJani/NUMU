'use client';

import React, { useState } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { DUMMY_GOALS } from '@/data/dashboard-mock';

export function YourGoals() {
  const [goals, setGoals] = useState(DUMMY_GOALS);

  const incrementGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id && g.current < g.target) {
          const next = g.current + 1;
          return {
            ...g,
            current: next,
            progress: Math.round((next / g.target) * 100),
          };
        }
        return g;
      })
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Weekly Target Tracker</span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Auto-resets Sunday</span>
        </div>

        {/* Goals List */}
        <div className="space-y-3.5">
          {goals.map((goal) => {
            const isCompleted = goal.current >= goal.target;

            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{goal.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500 text-[11px]">
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                    {!isCompleted && goal.id === 'g1' && (
                      <button
                        onClick={() => incrementGoal(goal.id)}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] transition-colors cursor-pointer"
                        title="Simulate solving a problem"
                      >
                        +1
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-[#0b5c39]'
                    }`}
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>74% Overall Completion</span>
        </div>
        <span className="text-slate-400 text-[11px]">Top 10% of Batch</span>
      </div>
    </div>
  );
}
