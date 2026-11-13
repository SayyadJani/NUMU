'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Flame,
  Star,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Zap,
  Bookmark,
  Award,
  Pin,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { adminApi, type ProblemItem } from '@/lib/api';
import {
  PageHeader,
  StatCard,
  Button,
  Modal,
  ConfirmModal,
  FormField,
  Input,
  StatusBadge,
} from '@/components/ui/primitives';

export function DsaHubPanel({
  onNotify,
}: {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [activeSubTab, setActiveSubTab] = useState<'daily' | 'curated' | 'featured'>('daily');
  const [loading, setLoading] = useState(true);

  // Daily Challenge state
  const [schedules, setSchedules] = useState<any[]>([]);
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [savingDaily, setSavingDaily] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toISOString().split('T')[0]!);
  const [selectedProblemId, setSelectedProblemId] = useState('');
  const [xpBonus, setXpBonus] = useState(50);
  const [instructions, setInstructions] = useState('Solve daily challenge to sustain your streak!');

  // Curated Practice state
  const [curatedList, setCuratedList] = useState<any[]>([]);
  const [curatedModalOpen, setCuratedModalOpen] = useState(false);
  const [curatedProblemId, setCuratedProblemId] = useState('');
  const [savingCurated, setSavingCurated] = useState(false);

  // Available Problems & Tests
  const [problems, setProblems] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [featuredTestId, setFeaturedTestId] = useState<string>('');

  // Delete Target
  const [deleteDailyTarget, setDeleteDailyTarget] = useState<any | null>(null);
  const [deleteCuratedTarget, setDeleteCuratedTarget] = useState<any | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [schedRes, curRes, probRes, testRes] = await Promise.allSettled([
        adminApi.getDailySchedules(30),
        adminApi.getCuratedProblems(),
        adminApi.listProblems({ limit: 100 }),
        adminApi.listTests(),
      ]);

      if (schedRes.status === 'fulfilled') setSchedules(schedRes.value || []);
      if (curRes.status === 'fulfilled') setCuratedList(curRes.value || []);
      if (probRes.status === 'fulfilled') {
        const pList = (probRes.value as any)?.items || [];
        setProblems(pList);
        if (pList.length > 0 && !selectedProblemId) {
          setSelectedProblemId(pList[0].id);
          setCuratedProblemId(pList[0].id);
        }
      }
      if (testRes.status === 'fulfilled') {
        const tList = (testRes.value as any)?.tests || testRes.value || [];
        setTests(tList);
        const feat = tList.find((t: any) => t.isFeaturedOnDashboard);
        if (feat) setFeaturedTestId(feat.id);
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to load DSA Hub data', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify, selectedProblemId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ── Handlers ──

  const handleSaveDaily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblemId || !scheduleDate) return;
    try {
      setSavingDaily(true);
      await adminApi.setDailySchedule({
        date: scheduleDate,
        problemId: selectedProblemId,
        xpBonus: Number(xpBonus),
        instructions,
        isActive: true,
      });
      onNotify('Daily challenge scheduled successfully!');
      setDailyModalOpen(false);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to schedule daily challenge', 'error');
    } finally {
      setSavingDaily(false);
    }
  };

  const handleDeleteDaily = async () => {
    if (!deleteDailyTarget) return;
    try {
      await adminApi.deleteDailySchedule(deleteDailyTarget.id);
      onNotify('Scheduled challenge removed');
      setDeleteDailyTarget(null);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete schedule', 'error');
    }
  };

  const handleAddCurated = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!curatedProblemId) return;
    try {
      setSavingCurated(true);
      await adminApi.addCuratedProblem({
        problemId: curatedProblemId,
        orderIndex: curatedList.length,
      });
      onNotify('Problem added to Today\'s Practice');
      setCuratedModalOpen(false);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to add curated problem', 'error');
    } finally {
      setSavingCurated(false);
    }
  };

  const handleDeleteCurated = async () => {
    if (!deleteCuratedTarget) return;
    try {
      await adminApi.removeCuratedProblem(deleteCuratedTarget.id);
      onNotify('Problem removed from curated list');
      setDeleteCuratedTarget(null);
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to remove problem', 'error');
    }
  };

  const handleMoveCurated = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= curatedList.length) return;

    const updated = [...curatedList];
    const [moved] = updated.splice(index, 1);
    if (!moved) return;
    updated.splice(targetIndex, 0, moved);

    const reorderedPayload = updated.map((item, idx) => ({ id: item.id, orderIndex: idx }));
    setCuratedList(updated);

    try {
      await adminApi.reorderCuratedProblems(reorderedPayload);
      onNotify('Curated order updated');
    } catch (err: any) {
      onNotify('Failed to save order change', 'error');
      void loadData();
    }
  };

  const handleSetFeaturedTest = async (testId: string) => {
    try {
      await adminApi.setFeaturedTest(testId);
      setFeaturedTestId(testId);
      onNotify('Featured assessment updated on student dashboard!');
      void loadData();
    } catch (err: any) {
      onNotify(err.message || 'Failed to set featured assessment', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="DSA Practice Hub & Dashboard Curation"
        subtitle="Manage the 6 live cards on student /dashboard/dsa: Daily Challenge schedules, Today's Practice curated list, and Featured Assessments."
        actions={
          activeSubTab === 'daily' ? (
            <Button icon={Plus} onClick={() => setDailyModalOpen(true)}>
              Schedule Daily Challenge
            </Button>
          ) : activeSubTab === 'curated' ? (
            <Button icon={Plus} onClick={() => setCuratedModalOpen(true)}>
              Add to Today&apos;s Practice
            </Button>
          ) : undefined
        }
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Active Daily Schedules"
          value={schedules.length}
          sublabel="Next 30 calendar days configured"
        />
        <StatCard
          icon={Star}
          label="Today's Practice Curated"
          value={curatedList.length}
          sublabel="Max 10 displayed to students"
        />
        <StatCard
          icon={ShieldCheck}
          label="Featured Assessment"
          value={tests.find((t) => t.id === featuredTestId)?.title || 'None'}
          sublabel="Pinned to bottom-right card"
        />
        <StatCard
          icon={Zap}
          label="Available Problem Bank"
          value={problems.length}
          sublabel="Ready for curation"
        />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('daily')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'daily'
              ? 'bg-[#0b5c39] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Daily Challenge Calendar ({schedules.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('curated')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'curated'
              ? 'bg-[#0b5c39] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Today&apos;s Practice List ({curatedList.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('featured')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'featured'
              ? 'bg-[#0b5c39] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Featured Assessment Card</span>
        </button>
      </div>

      {/* ── SubTab 1: Daily Challenge Schedules ── */}
      {activeSubTab === 'daily' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Scheduled Daily Challenges</h3>
              <p className="text-xs text-slate-500">
                Authoritative calendar: students see this problem on the top-right card of the DSA page.
              </p>
            </div>
            <Button size="sm" icon={Plus} onClick={() => setDailyModalOpen(true)}>
              Add Date
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {schedules.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No daily challenges scheduled. Click "Schedule Daily Challenge" to set up dates.
              </div>
            ) : (
              schedules.map((item) => {
                const dateStr = new Date(item.date).toISOString().split('T')[0];
                const isToday =
                  new Date(item.date).toDateString() === new Date().toDateString();

                return (
                  <div
                    key={item.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-mono shrink-0 ${
                          isToday
                            ? 'bg-emerald-100 text-[#0b5c39] border border-emerald-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase leading-none">
                          {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-sm font-black leading-none mt-0.5">
                          {new Date(item.date).getUTCDate()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {item.problem?.title || 'Unknown Problem'}
                          </span>
                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active Today
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            +{item.xpBonus} XP
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Difficulty: <strong>{item.problem?.difficulty}</strong> • Acceptance:{' '}
                          {item.problem?.acceptanceRate
                            ? `${item.problem.acceptanceRate.toFixed(1)}%`
                            : 'N/A'}{' '}
                          • Date: {dateStr}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setScheduleDate(dateStr || '');
                          setSelectedProblemId(item.problemId);
                          setXpBonus(item.xpBonus);
                          setInstructions(item.instructions || '');
                          setDailyModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={Trash2}
                        onClick={() => setDeleteDailyTarget(item)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── SubTab 2: Today's Practice Curated List ── */}
      {activeSubTab === 'curated' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Curated Practice Problems</h3>
              <p className="text-xs text-slate-500">
                These problems appear directly in the top-center "Today's Practice" widget on the student DSA page.
              </p>
            </div>
            <Button size="sm" icon={Plus} onClick={() => setCuratedModalOpen(true)}>
              Add Problem
            </Button>
          </div>

          <div className="divide-y divide-slate-100">
            {curatedList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No curated problems added yet. Click "Add Problem" to curate.
              </div>
            ) : (
              curatedList.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {item.problem?.title}
                        </span>
                        {item.isPinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.problem?.difficulty === 'EASY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.problem?.difficulty === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {item.problem?.difficulty}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        Slug: {item.problem?.slug}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveCurated(index, 'up')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === curatedList.length - 1}
                      onClick={() => handleMoveCurated(index, 'down')}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={Trash2}
                      onClick={() => setDeleteCuratedTarget(item)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── SubTab 3: Featured Assessment Selector ── */}
      {activeSubTab === 'featured' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Featured Proctored Assessment</h3>
            <p className="text-xs text-slate-500">
              Select which assessment from the Tests Bank is highlighted on the student DSA practice page (bottom-right card).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tests.map((test) => {
              const isSelected = test.id === featuredTestId;
              return (
                <div
                  key={test.id}
                  onClick={() => handleSetFeaturedTest(test.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/90 border-[#0b5c39] ring-2 ring-emerald-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{test.title}</span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-extrabold text-[#0b5c39] bg-white border border-emerald-300 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Featured Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {test.description || 'No description provided.'}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>Duration: <strong>{test.durationMinutes}m</strong></span>
                    <span>Proctored: <strong>{test.requireFullscreen ? 'Yes' : 'No'}</strong></span>
                    <span>Pass: <strong>{test.passPercentage}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Modal: Schedule Daily Challenge ── */}
      <Modal
        open={dailyModalOpen}
        onClose={() => setDailyModalOpen(false)}
        title="Schedule Daily Curriculum Challenge"
        subtitle="Set the authoritative problem and bonus XP for a specific calendar date"
      >
        <form onSubmit={handleSaveDaily} className="space-y-4">
          <FormField label="Calendar Date (YYYY-MM-DD)" required>
            <Input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Problem to Feature" required>
            <select
              value={selectedProblemId}
              onChange={(e) => setSelectedProblemId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0b5c39]"
              required
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Bonus XP Reward" required>
            <Input
              type="number"
              value={xpBonus}
              onChange={(e) => setXpBonus(Number(e.target.value))}
              placeholder="50"
              required
            />
          </FormField>

          <FormField label="Instructions / Banner Subtitle">
            <Input
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Complete daily challenge to sustain your consistency streak!"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDailyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingDaily}>
              Save Schedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Modal: Add Curated Problem ── */}
      <Modal
        open={curatedModalOpen}
        onClose={() => setCuratedModalOpen(false)}
        title="Add to Today's Practice"
        subtitle="Add a problem from the question bank into the curated practice widget"
      >
        <form onSubmit={handleAddCurated} className="space-y-4">
          <FormField label="Select Problem" required>
            <select
              value={curatedProblemId}
              onChange={(e) => setCuratedProblemId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:border-[#0b5c39]"
              required
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCuratedModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={savingCurated}>
              Add Problem
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Daily Modal */}
      <ConfirmModal
        open={Boolean(deleteDailyTarget)}
        onClose={() => setDeleteDailyTarget(null)}
        onConfirm={handleDeleteDaily}
        title="Remove Scheduled Challenge?"
        description={`Remove the daily challenge scheduled for ${
          deleteDailyTarget?.date ? new Date(deleteDailyTarget.date).toISOString().split('T')[0] : ''
        }?`}
      />

      {/* Delete Curated Modal */}
      <ConfirmModal
        open={Boolean(deleteCuratedTarget)}
        onClose={() => setDeleteCuratedTarget(null)}
        onConfirm={handleDeleteCurated}
        title="Remove Curated Problem?"
        description={`Remove "${deleteCuratedTarget?.problem?.title}" from Today's Practice list?`}
      />
    </div>
  );
}
