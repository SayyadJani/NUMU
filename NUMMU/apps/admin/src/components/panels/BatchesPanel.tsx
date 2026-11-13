'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Users,
  BarChart3,
  UserPlus,
  Trash2,
  AlertTriangle,
  Download,
  CheckCircle2,
} from 'lucide-react';
import {
  adminApi,
  downloadCsv,
  type AdminBatchItem,
  type AdminUser,
} from '@/lib/api';
import {
  PageHeader,
  StatCard,
  FilterBar,
  DataTable,
  Modal,
  ConfirmModal,
  FormField,
  Input,
  Textarea,
  Select,
  Button,
  StatusBadge,
  type ColumnDef,
} from '@/components/ui/primitives';

export function BatchesPanel({
  onNotify,
}: {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [batches, setBatches] = useState<AdminBatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Batch Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchSlug, setBatchSlug] = useState('');
  const [batchDesc, setBatchDesc] = useState('');

  // Batch Analytics & Roster Inspector
  const [activeBatchAnalytics, setActiveBatchAnalytics] = useState<any | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Assign Members Modal
  const [assignBatch, setAssignBatch] = useState<AdminBatchItem | null>(null);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [assignRole, setAssignRole] = useState<'MEMBER' | 'TRAINER' | 'ADMIN'>('MEMBER');
  const [userSearch, setUserSearch] = useState('');

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AdminBatchItem | null>(null);

  const loadBatches = useCallback(async () => {
    try {
      setLoading(true);
      const list = await adminApi.listBatches();
      setBatches(Array.isArray(list) ? list : []);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load batches', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    void loadBatches();
  }, [loadBatches]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) return;
    try {
      setSaving(true);
      await adminApi.createBatch({
        name: batchName.trim(),
        ...(batchSlug.trim() ? { slug: batchSlug.trim() } : {}),
        description: batchDesc.trim() || undefined,
      });
      onNotify(`Batch "${batchName}" created`);
      setBatchName('');
      setBatchSlug('');
      setBatchDesc('');
      setCreateOpen(false);
      await loadBatches();
    } catch (err: any) {
      onNotify(err.message || 'Failed to create batch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openAnalytics = async (batch: AdminBatchItem) => {
    try {
      setLoadingAnalytics(true);
      const data = await adminApi.getBatchAnalytics(batch.id);
      setActiveBatchAnalytics(data);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load batch analytics', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const openAssignModal = async (batch: AdminBatchItem) => {
    setAssignBatch(batch);
    setSelectedUserIds(new Set());
    setAssignRole('MEMBER');
    setUserSearch('');
    try {
      const res = await adminApi.listUsers({ page: 1, limit: 100 });
      setAllUsers(res.data || []);
    } catch {
      setAllUsers([]);
    }
  };

  const handleConfirmAssign = async () => {
    if (!assignBatch || selectedUserIds.size === 0) return;
    try {
      setSaving(true);
      const res = await adminApi.assignBatchMembers(assignBatch.id, {
        userIds: Array.from(selectedUserIds),
        role: assignRole,
      });
      onNotify(res.message || 'Members assigned');
      setAssignBatch(null);
      await loadBatches();
      if (activeBatchAnalytics?.batch?.id === assignBatch.id) {
        const refreshed = await adminApi.getBatchAnalytics(assignBatch.id);
        setActiveBatchAnalytics(refreshed);
      }
    } catch (err: any) {
      onNotify(err.message || 'Failed to assign members', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (batchId: string, userId: string) => {
    try {
      await adminApi.removeBatchMember(batchId, userId);
      onNotify('Member removed from batch');
      const refreshed = await adminApi.getBatchAnalytics(batchId);
      setActiveBatchAnalytics(refreshed);
      await loadBatches();
    } catch (err: any) {
      onNotify(err.message || 'Failed to remove member', 'error');
    }
  };

  const handleConfirmDeleteBatch = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await adminApi.deleteBatch(deleteTarget.id);
      onNotify(`Batch "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      await loadBatches();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete batch', 'error');
    } finally {
      setSaving(false);
    }
  };

  const exportBatchComparisonCsv = () => {
    if (!activeBatchAnalytics) return;
    const rows = (activeBatchAnalytics.studentComparisons || []).map((s: any) => [
      s.name,
      s.email,
      s.college || '',
      s.isActive ? 'ACTIVE' : 'SUSPENDED',
      s.problemsAttempted,
      s.problemsSolved,
      s.totalSubmissions,
      `${s.submissionAccuracy}%`,
      s.testsAttempted,
      s.avgTestPercentage !== null ? `${s.avgTestPercentage}%` : 'N/A',
      s.autoSubmits,
      s.needsAttention ? s.attentionReasons.join('; ') : 'OK',
    ]);
    downloadCsv(
      `numu-batch-${activeBatchAnalytics.batch.slug}-report.csv`,
      [
        'Student Name',
        'Email',
        'College',
        'Account Status',
        'Problems Attempted',
        'Unique Problems Solved',
        'Total Submissions',
        'Submission Accuracy',
        'Assessments Taken',
        'Avg Assessment Score',
        'Auto-Submits',
        'Attention Status',
      ],
      rows,
    );
    onNotify('Batch student comparison report exported to CSV');
  };

  const filteredBatches = batches.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q);
  });

  const columns: ColumnDef<AdminBatchItem>[] = [
    {
      key: 'batch',
      header: 'Batch / Organization',
      render: (b) => (
        <div>
          <div className="font-bold text-slate-900">{b.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">/{b.slug}</div>
          {b.description && (
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{b.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'students',
      header: 'Students & Active',
      render: (b) => (
        <div className="text-xs">
          <span className="font-extrabold text-slate-900">{b.studentCount}</span>{' '}
          <span className="text-slate-500">({b.activeStudentCount} active)</span>
        </div>
      ),
    },
    {
      key: 'trainers',
      header: 'Assigned Trainers',
      render: (b) => (
        <div className="text-xs text-slate-700">
          {b.trainers && b.trainers.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {b.trainers.slice(0, 2).map((t) => (
                <span
                  key={t.userId}
                  className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[11px] font-semibold"
                >
                  {t.name}
                </span>
              ))}
              {b.trainers.length > 2 && (
                <span className="text-[11px] text-slate-400">+{b.trainers.length - 2}</span>
              )}
            </div>
          ) : (
            <span className="text-slate-400">No trainers</span>
          )}
        </div>
      ),
    },
    {
      key: 'participation',
      header: 'Participation & Activity',
      render: (b) => (
        <div className="text-xs">
          <div className="font-bold text-emerald-700">{b.participationRate}% active learners</div>
          <div className="text-[11px] text-slate-400">
            {b.totalSubmissions} submissions • {b.totalTestAttempts} test attempts
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Manage',
      className: 'text-right',
      render: (b) => (
        <div className="inline-flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            icon={BarChart3}
            loading={loadingAnalytics && activeBatchAnalytics?.batch?.id === b.id}
            onClick={() => openAnalytics(b)}
          >
            Analytics & Roster
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={UserPlus}
            onClick={() => openAssignModal(b)}
          >
            Assign
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteTarget(b)}
            className="text-rose-600 hover:bg-rose-50"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Organizations & Cohort Mastery"
        icon={Building2}
        title="Batches & Cohort Analytics"
        subtitle="Manage college cohorts and training batches, assign students & trainers, and compare batch-wise DSA & assessment performance."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
            Create Batch
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Batches / Cohorts"
          value={batches.length}
          sublabel="Active organizations"
          icon={Building2}
          tone="emerald"
        />
        <StatCard
          label="Enrolled Batch Students"
          value={batches.reduce((s, b) => s + b.studentCount, 0)}
          sublabel="Students assigned to cohorts"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Batch Submissions"
          value={batches.reduce((s, b) => s + b.totalSubmissions, 0)}
          sublabel="Total coding submissions across batches"
          icon={BarChart3}
          tone="purple"
        />
      </div>

      {/* Cohort Spotlight Cards */}
      {filteredBatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBatches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/85 p-5 shadow-2xs hover:border-emerald-300 transition-all space-y-3.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#0b5c39] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                    /{b.slug}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1.5">{b.name}</h3>
                  {b.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{b.description}</p>
                  )}
                </div>
                <StatusBadge value="ACTIVE" label={`${b.participationRate}% Active`} />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                  <span>
                    {b.activeStudentCount} / {b.studentCount} Active Students
                  </span>
                  <span>
                    {b.totalSubmissions} Submissions • {b.totalTestAttempts} Tests
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#0b5c39] to-emerald-500 rounded-full"
                    style={{ width: `${Math.min(100, b.participationRate || 0)}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1">
                  {b.trainers?.map((t) => (
                    <span
                      key={t.userId}
                      className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-bold"
                    >
                      Trainer: {t.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={UserPlus}
                    onClick={() => openAssignModal(b)}
                  >
                    Assign
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={BarChart3}
                    onClick={() => openAnalytics(b)}
                  >
                    Cohort Analytics
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search batch name or slug..."
        onRefresh={loadBatches}
      />

      <DataTable
        columns={columns}
        data={filteredBatches}
        rowKey={(b) => b.id}
        loading={loading}
        emptyTitle="No batches created yet"
        emptySubtitle="Create your first batch/cohort to group students, assign trainers, and track cohort-level analytics."
      />

      {/* Create Batch Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Student Batch / Cohort"
        subtitle="Group students by college, graduation year, or training cohort."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <FormField label="Batch Name" required>
            <Input
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g. CSE 2027 Placement Cohort - Batch A"
              required
            />
          </FormField>
          <FormField label="Batch Slug" hint="Optional — auto-generated">
            <Input
              value={batchSlug}
              onChange={(e) => setBatchSlug(e.target.value)}
              placeholder="cse-2027-batch-a"
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              rows={3}
              value={batchDesc}
              onChange={(e) => setBatchDesc(e.target.value)}
              placeholder="Weekly DSA & assessment cohort for 2027 graduating students."
            />
          </FormField>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving} icon={CheckCircle2}>
              Create Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Students / Trainers Modal */}
      <Modal
        open={Boolean(assignBatch)}
        onClose={() => setAssignBatch(null)}
        title={`Assign Members — ${assignBatch?.name || ''}`}
        subtitle="Select students or trainers from the NUMU directory to assign to this batch."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <FormField label="Filter Users">
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name, email, or college..."
                />
              </FormField>
            </div>
            <FormField label="Batch Role">
              <Select
                value={assignRole}
                onChange={(e) => setAssignRole(e.target.value as any)}
              >
                <option value="MEMBER">Student (MEMBER)</option>
                <option value="TRAINER">Batch Trainer (TRAINER)</option>
                <option value="ADMIN">Batch Admin (ADMIN)</option>
              </Select>
            </FormField>
          </div>

          <div className="border border-slate-200 rounded-2xl max-h-72 overflow-y-auto divide-y divide-slate-100">
            {allUsers
              .filter((u) => {
                if (!userSearch.trim()) return true;
                const q = userSearch.toLowerCase();
                return (
                  (u.name || '').toLowerCase().includes(q) ||
                  u.email.toLowerCase().includes(q) ||
                  (u.username || '').toLowerCase().includes(q)
                );
              })
              .map((u) => {
                const checked = selectedUserIds.has(u.id);
                return (
                  <label
                    key={u.id}
                    className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = new Set(selectedUserIds);
                          if (checked) next.delete(u.id);
                          else next.add(u.id);
                          setSelectedUserIds(next);
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div className="font-bold text-slate-900">
                          {u.name || u.username || 'User'}
                        </div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                    <StatusBadge value={u.role} />
                  </label>
                );
              })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              <strong>{selectedUserIds.size}</strong> user(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => setAssignBatch(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                loading={saving}
                disabled={selectedUserIds.size === 0}
                onClick={handleConfirmAssign}
              >
                Assign to Batch
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Batch Analytics & Student Comparison Modal */}
      <Modal
        open={Boolean(activeBatchAnalytics)}
        onClose={() => setActiveBatchAnalytics(null)}
        title={`Batch Analytics — ${activeBatchAnalytics?.batch?.name || ''}`}
        subtitle="Cohort participation, topic-wise accuracy, student comparisons, and attention alerts."
        maxWidth="max-w-5xl"
      >
        {activeBatchAnalytics && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs flex-1">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Students
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {activeBatchAnalytics.summary.totalStudents}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Participating
                  </span>
                  <span className="text-lg font-extrabold text-emerald-700">
                    {activeBatchAnalytics.summary.participatingStudents ??
                      activeBatchAnalytics.summary.activeStudents ??
                      0}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Submissions / Acc
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {activeBatchAnalytics.summary.totalSubmissions ??
                      `${activeBatchAnalytics.summary.overallSubmissionAccuracy ?? 0}%`}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Batch Test Avg
                  </span>
                  <span className="text-lg font-extrabold text-blue-700">
                    {activeBatchAnalytics.summary.batchAvgTestScore ??
                      activeBatchAnalytics.summary.averageAssessmentScore ??
                      0}
                    %
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Needs Attention
                  </span>
                  <span className="text-lg font-extrabold text-rose-600">
                    {activeBatchAnalytics.summary.studentsNeedingAttentionCount ??
                      activeBatchAnalytics.summary.studentsRequiringAttentionCount ??
                      0}
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={exportBatchComparisonCsv}
              >
                Export Cohort CSV
              </Button>
            </div>

            {/* Students Requiring Attention */}
            {activeBatchAnalytics.studentsRequiringAttention?.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Students Requiring Trainer Attention (
                  {activeBatchAnalytics.studentsRequiringAttention.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activeBatchAnalytics.studentsRequiringAttention.map((s: any) => (
                    <div
                      key={s.userId}
                      className="p-2.5 rounded-xl bg-white border border-amber-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-amber-800">
                          {s.attentionReasons.join(' • ')}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">
                        {s.problemsSolved} solved
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic-Wise Batch Accuracy */}
            {activeBatchAnalytics.topicPerformance?.length > 0 && (
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                  Topic-Wise Cohort Accuracy
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeBatchAnalytics.topicPerformance.map((tp: any) => (
                    <div
                      key={tp.slug}
                      className="p-3 rounded-xl border border-slate-200 bg-white text-xs"
                    >
                      <div className="font-bold text-slate-800 truncate">{tp.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-extrabold text-emerald-700">{tp.accuracy}%</span>
                        <span className="text-[10px] text-slate-400">
                          {tp.acceptedSubmissions}/{tp.totalSubmissions} AC
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Student Comparison Table */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2.5">
                Student Comparison & Roster (
                {(activeBatchAnalytics.studentComparisons || activeBatchAnalytics.leaderboard || [])
                  .length}
                )
              </h4>
              <DataTable
                rowKey={(s: any) => s.userId}
                data={
                  activeBatchAnalytics.studentComparisons || activeBatchAnalytics.leaderboard || []
                }
                emptyTitle="No students assigned to this batch yet"
                columns={[
                  {
                    key: 'student',
                    header: 'Student',
                    render: (s: any) => (
                      <div>
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'dsa',
                    header: 'DSA Solved / Attempted',
                    render: (s: any) => (
                      <div className="text-xs">
                        <span className="font-extrabold text-emerald-700">
                          {s.problemsSolved} solved
                        </span>{' '}
                        <span className="text-slate-400">/ {s.problemsAttempted} tried</span>
                      </div>
                    ),
                  },
                  {
                    key: 'accuracy',
                    header: 'Submission Accuracy',
                    render: (s: any) => (
                      <span className="font-bold text-slate-800">
                        {s.submissionAccuracy}% ({s.totalSubmissions} subs)
                      </span>
                    ),
                  },
                  {
                    key: 'tests',
                    header: 'Assessments',
                    render: (s: any) => (
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">
                          {s.avgTestPercentage !== null ? `${s.avgTestPercentage}% avg` : '—'}
                        </span>{' '}
                        <span className="text-slate-400">({s.testsAttempted} taken)</span>
                      </div>
                    ),
                  },
                  {
                    key: 'remove',
                    header: '',
                    className: 'text-right',
                    render: (s: any) => (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveMember(activeBatchAnalytics.batch.id, s.userId)
                        }
                        className="text-rose-600 hover:bg-rose-50"
                      >
                        Remove
                      </Button>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteBatch}
        loading={saving}
        title="Delete Batch?"
        description={`Are you sure you want to delete batch "${deleteTarget?.name}"? Student accounts and their submissions will not be deleted.`}
        confirmLabel="Delete Batch"
      />
    </div>
  );
}

