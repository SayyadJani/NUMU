'use client';

import React, { useState } from 'react';
import { Plus, Check, Trash2, CheckCircle2 } from 'lucide-react';
import { INITIAL_TASKS, type DashboardTask } from '@/data/dashboard-mock';

export function TodaysTasks() {
  const [tasks, setTasks] = useState<DashboardTask[]>(INITIAL_TASKS);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((completedCount / (tasks.length || 1)) * 100);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    const newTask: DashboardTask = {
      id: `task-${Date.now()}`,
      label: newTaskText.trim(),
      category: 'dsa',
      xp: 30,
      done: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskText('');
    setIsAdding(false);
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between text-left">
      {/* Header with Title and Progress Count */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-bold text-slate-900">Today&apos;s Action Plan</span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {completedCount}/{tasks.length} Done ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-emerald-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Filter Pills */}
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
            Pending ({tasks.length - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Task List */}
        <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar pr-1">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  task.done
                    ? 'bg-slate-50/70 border-slate-200/60 opacity-70'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                  <div
                    className={`w-4.5 h-4.5 rounded-md flex items-center justify-center shrink-0 border transition-all ${
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
                        ? 'line-through text-slate-400 font-normal'
                        : 'text-slate-800 font-medium'
                    }`}
                  >
                    {task.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                    +{task.xp} XP
                  </span>
                  <button
                    onClick={(e) => deleteTask(task.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No tasks in this view.
            </div>
          )}
        </div>
      </div>

      {/* Add New Task Form / Input */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        {isAdding ? (
          <form onSubmit={addTask} className="flex items-center gap-2">
            <input
              type="text"
              autoFocus
              placeholder="What do you want to accomplish today?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-white text-slate-900"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-[#0b5c39] text-white text-xs font-bold rounded-xl hover:bg-[#08482c] transition-colors cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-xs text-[#0b5c39] hover:text-[#08482c] font-bold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add a new goal or task</span>
          </button>
        )}
      </div>
    </div>
  );
}
