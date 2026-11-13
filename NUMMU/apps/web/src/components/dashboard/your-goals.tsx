'use client';

import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { progressService } from '@/services/progress.service';
import { gamificationService } from '@/services/gamification.service';

export function YourGoals() {
  const [solved, setSolved] = useState(0);
  const [totalProblems, setTotalProblems] = useState(10);
  const [topicsCovered, setTopicsCovered] = useState(0);
  const [totalTopics, setTotalTopics] = useState(8);
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      progressService.getOverview(),
      progressService.getTopicProgress(),
      gamificationService.getSummary(-new Date().getTimezoneOffset()),
    ]).then(([ovRes, topRes, gamRes]) => {
      if (!isMounted) return;
      if (ovRes.status === 'fulfilled') {
        setSolved(ovRes.value.totalProblemsSolved);
        setTotalProblems(ovRes.value.totalAvailable.total || 10);
      }
      if (topRes.status === 'fulfilled') {
        setTopicsCovered(topRes.value.topics.filter((t) => t.solvedProblems > 0).length);
        setTotalTopics(topRes.value.totalTopics || 8);
      }
      if (gamRes.status === 'fulfilled') {
        setStreakDays(gamRes.value.streak.current);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const goals = [
    {
      id: 'g1',
      title: 'Solve All Curriculum Problems',
      current: solved,
      target: totalProblems,
      unit: 'problems',
      progress: totalProblems > 0 ? Math.min(100, Math.round((solved / totalProblems) * 100)) : 0,
    },
    {
      id: 'g2',
      title: 'Practice Across All 8 DSA Topics',
      current: topicsCovered,
      target: totalTopics,
      unit: 'topics',
      progress: totalTopics > 0 ? Math.min(100, Math.round((topicsCovered / totalTopics) * 100)) : 0,
    },
    {
      id: 'g3',
      title: '7-Day Streak Warrior Badge',
      current: Math.min(7, streakDays),
      target: 7,
      unit: 'days',
      progress: Math.min(100, Math.round((Math.min(7, streakDays) / 7) * 100)),
    },
  ];

  const overallPct = Math.round(
    goals.reduce((acc, g) => acc + g.progress, 0) / (goals.length || 1),
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Curriculum Milestone Tracker</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold">Live DB Targets</span>
        </div>

        <div className="space-y-3.5">
          {goals.map((goal) => {
            const isCompleted = goal.current >= goal.target;

            return (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{goal.title}</span>
                  <span className="font-mono text-slate-600 font-semibold text-[11px]">
                    {goal.current} / {goal.target} {goal.unit} ({goal.progress}%)
                  </span>
                </div>

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
          <span>{overallPct}% Overall Milestone Progress</span>
        </div>
        <span className="text-slate-400 text-[11px]">Synced from PostgreSQL</span>
      </div>
    </div>
  );
}
