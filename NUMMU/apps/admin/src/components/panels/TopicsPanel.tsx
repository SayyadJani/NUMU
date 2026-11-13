'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Download,
  CheckCircle2,
  BookOpen,
  BarChart3,
} from 'lucide-react';
import {
  adminApi,
  downloadCsv,
  type TopicCurriculumItem,
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
  Button,
  StatusBadge,
  type ColumnDef,
} from '@/components/ui/primitives';

export function TopicsPanel({
  onNotify,
}: {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [topics, setTopics] = useState<TopicCurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(1);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<TopicCurriculumItem | null>(null);

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminApi.getTopicsCurriculum();
      setTopics(Array.isArray(data) ? data : []);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load topics curriculum', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setOrder(topics.length + 1);
    setModalOpen(true);
  };

  const openEdit = (t: TopicCurriculumItem) => {
    setEditingId(t.id);
    setName(t.name);
    setSlug(t.slug);
    setDescription(t.description || '');
    setOrder(t.order || 0);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onNotify('Topic name is required', 'error');
      return;
    }
    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        ...(slug.trim() ? { slug: slug.trim() } : {}),
        description: description.trim() || undefined,
        order: Number(order) || 0,
      };
      if (editingId) {
        await adminApi.updateTopic(editingId, payload);
        onNotify(`Topic "${name}" updated`);
      } else {
        await adminApi.createTopic(payload);
        onNotify(`Topic "${name}" created`);
      }
      setModalOpen(false);
      await loadTopics();
    } catch (err: any) {
      onNotify(err.message || 'Failed to save topic', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await adminApi.deleteTopic(deleteTarget.id);
      onNotify(`Topic "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      await loadTopics();
    } catch (err: any) {
      onNotify(err.message || 'Cannot delete topic while problems are assigned to it', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filtered = topics.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.slug.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  const totalProblemsAcrossTopics = topics.reduce((s, t) => s + (t.problemCount || 0), 0);
  const totalSubmissionsAcrossTopics = topics.reduce((s, t) => s + (t.totalSubmissions || 0), 0);
  const avgTopicAccuracy =
    topics.length > 0
      ? Math.round(topics.reduce((s, t) => s + (t.accuracyRate || 0), 0) / topics.length)
      : 0;

  const handleExportCsv = () => {
    downloadCsv(
      'numu-topics-curriculum-report.csv',
      [
        'Order',
        'Topic Name',
        'Slug',
        'Total Problems',
        'Published',
        'Draft',
        'Easy',
        'Medium',
        'Hard',
        'Total Submissions',
        'Accepted Submissions',
        'Accuracy (%)',
      ],
      filtered.map((t) => [
        t.order,
        t.name,
        t.slug,
        t.problemCount ?? 0,
        t.publishedCount ?? 0,
        t.draftCount ?? 0,
        t.difficultyDistribution?.EASY ?? 0,
        t.difficultyDistribution?.MEDIUM ?? 0,
        t.difficultyDistribution?.HARD ?? 0,
        t.totalSubmissions ?? 0,
        t.acceptedSubmissions ?? 0,
        t.accuracyRate ?? 0,
      ]),
    );
    onNotify('Topics curriculum CSV exported');
  };

  const columns: ColumnDef<TopicCurriculumItem>[] = [
    {
      key: 'order',
      header: '#',
      render: (t) => (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-xs">
          {t.order}
        </span>
      ),
    },
    {
      key: 'topic',
      header: 'Topic & Slug',
      render: (t) => (
        <div>
          <div className="font-bold text-slate-900">{t.name}</div>
          <div className="text-[11px] text-slate-400 font-mono">/{t.slug}</div>
          {t.description && (
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 max-w-md">
              {t.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'distribution',
      header: 'Difficulty Distribution',
      render: (t) => {
        const d = t.difficultyDistribution || { EASY: 0, MEDIUM: 0, HARD: 0 };
        return (
          <div className="flex items-center gap-1.5">
            <StatusBadge value="EASY" label={`E: ${d.EASY}`} />
            <StatusBadge value="MEDIUM" label={`M: ${d.MEDIUM}`} />
            <StatusBadge value="HARD" label={`H: ${d.HARD}`} />
          </div>
        );
      },
    },
    {
      key: 'problems',
      header: 'Question Bank Coverage',
      render: (t) => (
        <div className="text-xs">
          <span className="font-extrabold text-slate-900">{t.problemCount ?? 0}</span>{' '}
          <span className="text-slate-500">
            ({t.publishedCount ?? 0} live, {t.draftCount ?? 0} draft)
          </span>
        </div>
      ),
    },
    {
      key: 'accuracy',
      header: 'Student Accuracy',
      render: (t) => (
        <div className="w-36">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-bold text-slate-800">{t.accuracyRate ?? 0}%</span>
            <span className="text-slate-400">{t.totalSubmissions ?? 0} subs</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${Math.min(100, t.accuracyRate || 0)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (t) => (
        <div className="inline-flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={Edit3} onClick={() => openEdit(t)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteTarget(t)}
            disabled={(t.problemCount ?? 0) > 0}
            className="text-rose-600 hover:bg-rose-50 disabled:opacity-30"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Syllabus & Mastery Architecture"
        icon={BookOpen}
        title="Topics & DSA Curriculum"
        subtitle="Manage DSA syllabus topics, question difficulty distribution, and topic-wise student accuracy."
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Button variant="primary" icon={Plus} onClick={openCreate}>
              Add Topic
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Active Curriculum Topics"
          value={topics.length}
          sublabel="Ordered syllabus tracks"
          icon={Layers}
          tone="emerald"
        />
        <StatCard
          label="Topic-Mapped Questions"
          value={totalProblemsAcrossTopics}
          sublabel="Across Easy, Medium & Hard"
          icon={BookOpen}
          tone="blue"
        />
        <StatCard
          label="Avg Topic Accuracy"
          value={`${avgTopicAccuracy}%`}
          sublabel={`Across ${totalSubmissionsAcrossTopics} total submissions`}
          icon={BarChart3}
          tone="purple"
        />
      </div>

      {/* Visual Syllabus Domain Cards */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filtered.map((t) => {
            const d = t.difficultyDistribution || { EASY: 0, MEDIUM: 0, HARD: 0 };
            const totalD = Math.max(1, d.EASY + d.MEDIUM + d.HARD);
            return (
              <div
                key={t.id}
                onClick={() => openEdit(t)}
                className="bg-white rounded-2xl border border-slate-200/85 p-4 shadow-2xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono font-extrabold text-[#0b5c39] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                      Track #{t.order}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-900 mt-1.5 truncate">
                      {t.name}
                    </h4>
                  </div>
                  <span className="text-xs font-black text-slate-900 shrink-0">
                    {t.accuracyRate ?? 0}% AC
                  </span>
                </div>

                {/* Stacked Difficulty Bar */}
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      style={{ width: `${(d.EASY / totalD) * 100}%` }}
                      className="bg-emerald-500 h-full"
                    />
                    <div
                      style={{ width: `${(d.MEDIUM / totalD) * 100}%` }}
                      className="bg-amber-500 h-full"
                    />
                    <div
                      style={{ width: `${(d.HARD / totalD) * 100}%` }}
                      className="bg-rose-500 h-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                    <span>{t.problemCount ?? 0} Problems</span>
                    <span>
                      {d.EASY}E • {d.MEDIUM}M • {d.HARD}H
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search topic name, slug, or description..."
        onRefresh={loadTopics}
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(t) => t.id}
        loading={loading}
        emptyTitle="No curriculum topics found"
        emptySubtitle="Add DSA syllabus topics (e.g. Arrays, Two Pointers, Dynamic Programming) to organize your problem bank."
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Curriculum Topic' : 'Create Curriculum Topic'}
        subtitle="Topics organize the DSA problem bank and power student topic-mastery analytics."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <FormField label="Topic Name" required>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dynamic Programming"
                  required
                />
              </FormField>
            </div>
            <FormField label="Display Order" required>
              <Input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </FormField>
          </div>

          <FormField label="Slug" hint="Optional — auto-generated from name">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="dynamic-programming"
            />
          </FormField>

          <FormField label="Syllabus Description">
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Memoization, tabulation, state transitions, and knapsack patterns."
            />
          </FormField>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving} icon={CheckCircle2}>
              {editingId ? 'Save Changes' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={saving}
        title="Delete Topic?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? Topics with assigned questions cannot be deleted.`}
        confirmLabel="Delete Topic"
      />
    </div>
  );
}

