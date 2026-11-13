'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, CheckCircle2, ArrowRight } from 'lucide-react';
import { dsaService } from '@/services/dsa.service';
import { progressService } from '@/services/progress.service';

interface CurriculumTaskItem {
  id: string;
  slug: string;
  label: string;
  topicName: string;
  difficulty: string;
  xp: number;
  done: boolean;
}

export function TodaysTasks() {
  const [tasks, setTasks] = useState<CurriculumTaskItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      dsaService.getProblems({ limit: 50 }),
      progressService.getSolvedProblems({ limit: 100 }),
    ]).then(([probRes, solvedRes]) => {
      if (!isMounted) return;
      const solvedSet = new Set(
        solvedRes.status === 'fulfilled'
          ? solvedRes.value.items.map((i) => i.slug)
          : [],
      );
      if (probRes.status === 'fulfilled') {
        const mapped: CurriculumTaskItem[] = probRes.value.items.map((p) => ({
          id: p.id,
          slug: p.slug,
          label: `Solve "${p.title}" (${p.primaryTopic?.name ?? p.topics[0]?.name ?? 'DSA'})`,
          topicName: p.primaryTopic?.name ?? p.topics[0]?.name ?? 'DSA',
          difficulty: p.difficulty,
          xp: p.difficulty === 'HARD' ? 100 : p.difficulty === 'MEDIUM' ? 50 : 30,
          done: solvedSet.has(p.slug),
        }));
        setTasks(mapped);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Curriculum Checklist</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {completedCount}/{tasks.length} Solved ({progressPercent}%)
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5 mb-3 text-[11px]">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filter === 'pending'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Remaining ({tasks.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Solved ({completedCount})
          </button>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/dsa/problems/${task.slug}` as React.ComponentProps<typeof Link>['href']}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  task.done
                    ? 'bg-emerald-50/40 border-emerald-200/70'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                  <div
                    className={`rounded-md flex items-center justify-center shrink-0 border transition-all ${
                      task.done
                        ? 'bg-[#0b5c39] border-[#0b5c39] text-white'
                        : 'border-slate-300 group-hover:border-emerald-500 bg-white'
                    }`}
                    style={{ width: '18px', height: '18px' }}
                  >
                    {task.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>

                  <span
                    className={`text-xs truncate ${
                      task.done
                        ? 'text-emerald-900 font-semibold'
                        : 'text-slate-800 font-medium'
                    }`}
                  >
                    {task.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                    {task.done ? 'Earned' : `+${task.xp} XP`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </div>
              </Link>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No curriculum problems in this filter.
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>Auto-checks when accepted by Judge0</span>
        <Link href="/dashboard/dsa" className="text-[#0b5c39] font-bold hover:underline">
          Open Curriculum →
        </Link>
      </div>
    </div>
  );
}
