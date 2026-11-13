'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Users,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  ShieldCheck,
  EyeOff,
  Maximize2,
  RotateCcw,
  Code2,
  Search,
  AlertTriangle,
  Copy,
  Download,
  ClipboardX,
  Play,
  Calendar,
  ExternalLink,
  Calculator,
  Sparkles,
} from 'lucide-react';
import {
  adminApi,
  downloadCsv,
  type AdminTestItem,
  type ProblemItem,
  type ContentStatus,
} from '@/lib/api';
import {
  PageHeader,
  StatCard,
  FilterBar,
  DataTable,
  Modal,
  ConfirmModal,
  Button,
  FormField,
  Input,
  Select,
  Textarea,
  Toggle,
  StatusBadge,
  type ColumnDef,
} from '@/components/ui/primitives';

interface ArrangedQuestion {
  problemId: string;
  slug: string;
  title: string;
  difficulty: string;
  marks: number;
}

interface TestFormState {
  id?: string;
  title: string;
  slug: string;
  weekNumber: string;
  durationMinutes: number;
  passPercentage: number;
  totalMarks: number;
  status: ContentStatus;
  mode: 'LIVE' | 'TRAINER_PREVIEW';
  scheduleEnabled: boolean;
  startTime: string;
  endTime: string;
  maxTabSwitches: number;
  requireFullscreen: boolean;
  disableCopyPaste: boolean;
  description: string;
  instructions: string;
  questions: ArrangedQuestion[];
}

const emptyTestForm = (): TestFormState => ({
  title: '',
  slug: '',
  weekNumber: '1',
  durationMinutes: 90,
  passPercentage: 60,
  totalMarks: 100,
  status: 'PUBLISHED',
  mode: 'LIVE',
  scheduleEnabled: false,
  startTime: '',
  endTime: '',
  maxTabSwitches: 3,
  requireFullscreen: true,
  disableCopyPaste: true,
  description: 'End-to-end proctored weekly DSA coding assessment.',
  instructions:
    '1. Full-screen mode is mandatory throughout the assessment.\n2. Switching tabs more than 3 times will automatically terminate and submit your test.\n3. Both sample and hidden test cases determine your final score.',
  questions: [],
});

export function TestsPanel({ onNotify }: { onNotify: (msg: string, type?: 'success' | 'error') => void }) {
  const [tests, setTests] = useState<AdminTestItem[]>([]);
  const [allProblems, setAllProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Test Composer & Format Arranger Modal
  const [composerOpen, setComposerOpen] = useState(false);
  const [form, setForm] = useState<TestFormState>(() => emptyTestForm());
  const [defaultQuestionMarks, setDefaultQuestionMarks] = useState<number>(20);
  const [bankSearch, setBankSearch] = useState('');
  const [saving, setSaving] = useState(false);

  // Attempts & Proctoring Inspector Modal
  const [attemptsTest, setAttemptsTest] = useState<AdminTestItem | null>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [selectedAttemptAnswers, setSelectedAttemptAnswers] = useState<any | null>(null);

  // Reassign Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<any | null>(null);
  const [reassignMinutes, setReassignMinutes] = useState<number>(90);
  const [reassigning, setReassigning] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<AdminTestItem | null>(null);

  const loadTests = useCallback(async () => {
    try {
      setLoading(true);
      const list = await adminApi.listTests();
      setTests(Array.isArray(list) ? list : []);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  const loadProblemBank = useCallback(async () => {
    try {
      const res = await adminApi.listProblems({ page: 1, limit: 100 });
      setAllProblems(res.items || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadTests();
    void loadProblemBank();
  }, [loadTests, loadProblemBank]);

  const openCreateModal = () => {
    setForm(emptyTestForm());
    setDefaultQuestionMarks(20);
    setBankSearch('');
    setComposerOpen(true);
  };

  const openEditModal = (t: AdminTestItem) => {
    const toLocalDatetime = (iso?: string | null) => {
      if (!iso) return '';
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const hasSchedule = Boolean(t.startTime || t.endTime);

    setForm({
      id: t.id,
      title: t.title,
      slug: t.slug,
      weekNumber: t.weekNumber ? String(t.weekNumber) : '',
      durationMinutes: t.durationMinutes || 90,
      passPercentage: t.passPercentage || 60,
      totalMarks: t.totalMarks || 100,
      status: t.status,
      mode: 'LIVE',
      scheduleEnabled: hasSchedule,
      startTime: toLocalDatetime(t.startTime),
      endTime: toLocalDatetime(t.endTime),
      maxTabSwitches: t.maxTabSwitches ?? 3,
      requireFullscreen: t.requireFullscreen ?? true,
      disableCopyPaste: t.disableCopyPaste ?? true,
      description: t.description || '',
      instructions: t.instructions || '',
      questions: (t.questions || []).map((q) => ({
        problemId: q.problem.id,
        slug: q.problem.slug,
        title: q.problem.title,
        difficulty: q.problem.difficulty,
        marks: q.marks,
      })),
    });
    setDefaultQuestionMarks(20);
    setBankSearch('');
    setComposerOpen(true);
  };

  const addQuestionToTest = (prob: ProblemItem) => {
    if (form.questions.some((q) => q.problemId === prob.id)) return;
    setForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          problemId: prob.id,
          slug: prob.slug,
          title: prob.title,
          difficulty: prob.difficulty,
          marks: defaultQuestionMarks,
        },
      ],
    }));
  };

  const applyDefaultMarksToAll = () => {
    if (form.questions.length === 0) {
      onNotify('Add questions to the paper first to apply default marks', 'error');
      return;
    }
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => ({ ...q, marks: defaultQuestionMarks })),
    }));
    onNotify(`Applied default ${defaultQuestionMarks} marks to all ${form.questions.length} questions`);
  };

  const distributeTotalMarksEvenly = () => {
    if (form.questions.length === 0) {
      onNotify('Add questions to the paper first to distribute marks', 'error');
      return;
    }
    const count = form.questions.length;
    const target = form.totalMarks || 100;
    const base = Math.floor(target / count);
    const remainder = target % count;

    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q, idx) => ({
        ...q,
        marks: idx === count - 1 ? base + remainder : base,
      })),
    }));
    onNotify(`Distributed ${target} total marks evenly across ${count} questions`);
  };

  const removeQuestionFromTest = (problemId: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.problemId !== problemId),
    }));
  };

  const moveQuestion = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= form.questions.length) return;
    const next = [...form.questions];
    const temp = next[idx]!;
    next[idx] = next[targetIdx]!;
    next[targetIdx] = temp;
    setForm({ ...form, questions: next });
  };

  const totalArrangedMarks = form.questions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0);

  const handleSaveTest = async () => {
    if (!form.title.trim()) {
      onNotify('Test title is required', 'error');
      return;
    }
    if (form.questions.length === 0) {
      onNotify('Assign at least one question to the test paper', 'error');
      return;
    }

    const payload = {
      title: form.title.trim(),
      ...(form.slug.trim() && { slug: form.slug.trim() }),
      ...(form.weekNumber && { weekNumber: Number(form.weekNumber) }),
      durationMinutes: Number(form.durationMinutes) || 90,
      passPercentage: Number(form.passPercentage) || 60,
      totalMarks: form.totalMarks || Math.max(1, totalArrangedMarks),
      status: form.status,
      startTime: form.scheduleEnabled && form.startTime ? new Date(form.startTime).toISOString() : null,
      endTime: form.scheduleEnabled && form.endTime ? new Date(form.endTime).toISOString() : null,
      maxTabSwitches: Number(form.maxTabSwitches) || 3,
      requireFullscreen: form.requireFullscreen,
      disableCopyPaste: form.disableCopyPaste,
      description: form.description.trim() || undefined,
      instructions: form.instructions.trim() || undefined,
      questions: form.questions.map((q, idx) => ({
        problemIdOrSlug: q.problemId,
        marks: Number(q.marks) || 20,
        orderIndex: idx + 1,
      })),
    };

    try {
      setSaving(true);
      if (form.id) {
        await adminApi.updateTest(form.id, payload);
        onNotify(`Test "${form.title}" format & settings updated`);
      } else {
        await adminApi.createTest(payload);
        onNotify(`Test "${form.title}" created & arranged`);
      }
      setComposerOpen(false);
      await loadTests();
    } catch (err: any) {
      onNotify(err.message || 'Failed to save test', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateTest = async (test: AdminTestItem) => {
    try {
      await adminApi.duplicateTest(test.id);
      onNotify(`Duplicated "${test.title}" as a new DRAFT test`);
      await loadTests();
    } catch (err: any) {
      onNotify(err.message || 'Failed to duplicate test', 'error');
    }
  };

  const handleExportTestsCsv = () => {
    downloadCsv(
      'numu-assessments.csv',
      filteredTests.map((t) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        weekNumber: t.weekNumber ?? '',
        status: t.status,
        questionsCount: t.questions?.length ?? 0,
        totalMarks: t.totalMarks,
        durationMinutes: t.durationMinutes,
        passPercentage: `${t.passPercentage}%`,
        requireFullscreen: t.requireFullscreen,
        disableCopyPaste: t.disableCopyPaste ?? true,
        maxTabSwitches: t.maxTabSwitches ?? 3,
        totalAttempts: t.totalAttempts,
        completedAttempts: t.completedAttempts,
        passRate: `${t.passRate}%`,
        autoSubmittedCount: t.autoSubmittedCount,
      })),
    );
  };

  const handleExportAttemptsCsv = () => {
    if (!attemptsTest) return;
    downloadCsv(
      `numu-${attemptsTest.slug}-attempts.csv`,
      attempts.map((a) => ({
        attemptId: a.id,
        studentName: a.user?.name || '',
        studentEmail: a.user?.email || '',
        status: a.status,
        score: a.score,
        totalMarks: attemptsTest.totalMarks,
        percentage: `${a.percentage}%`,
        isPassed: a.isPassed,
        tabSwitchCount: a.tabSwitchCount ?? 0,
        autoSubmitted: a.autoSubmitted ?? false,
        terminationReason: a.terminationReason || '',
        startedAt: a.startedAt || '',
        submittedAt: a.submittedAt || '',
      })),
    );
  };

  const openAttemptsInspector = async (test: AdminTestItem) => {
    setAttemptsTest(test);
    setSelectedAttemptAnswers(null);
    try {
      setLoadingAttempts(true);
      const list = await adminApi.getTestAttempts(test.id);
      setAttempts(Array.isArray(list) ? list : []);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load student attempts', 'error');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const handleResetAttempt = async (attemptId: string) => {
    if (!attemptsTest) return;
    try {
      await adminApi.resetTestAttempt(attemptsTest.id, attemptId);
      onNotify('Student attempt reset — student can now retake the test');
      const list = await adminApi.getTestAttempts(attemptsTest.id);
      setAttempts(Array.isArray(list) ? list : []);
      await loadTests();
    } catch (err: any) {
      onNotify(err.message || 'Failed to reset attempt', 'error');
    }
  };

  const openReassignDialog = (attempt: any) => {
    setReassignTarget(attempt);
    setReassignMinutes(attemptsTest?.durationMinutes || 90);
    setReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!attemptsTest || !reassignTarget) return;
    try {
      setReassigning(true);
      const res = await adminApi.reassignTestAttempt(attemptsTest.id, reassignTarget.id, {
        extraMinutes: reassignMinutes,
      });
      onNotify(res.message || 'Test successfully reassigned');
      setReassignModalOpen(false);
      setReassignTarget(null);
      const list = await adminApi.getTestAttempts(attemptsTest.id);
      setAttempts(Array.isArray(list) ? list : []);
      await loadTests();
    } catch (err: any) {
      onNotify(err.message || 'Failed to reassign test', 'error');
    } finally {
      setReassigning(false);
    }
  };

  const handleConfirmDeleteTest = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await adminApi.deleteTest(deleteTarget.id);
      onNotify(`Test "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      await loadTests();
    } catch (err: any) {
      onNotify(err.message || 'Failed to delete test', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return t.title.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
    }
    return true;
  });

  const availableProblems = allProblems.filter((p) => {
    if (!bankSearch.trim()) return true;
    const q = bankSearch.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  const columns: ColumnDef<AdminTestItem>[] = [
    {
      key: 'title',
      header: 'Assessment',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">
            {row.weekNumber ? `Week ${row.weekNumber}: ` : ''}
            {row.title}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">/{row.slug}</div>
          {(row.startTime || row.endTime) && (
            <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Calendar className="w-2.5 h-2.5 text-emerald-600" />
              <span>
                {row.startTime ? new Date(row.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Immediate'}
                {' → '}
                {row.endTime ? new Date(row.endTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Open'}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'format',
      header: 'Format & Marks',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">
            {row.questions?.length || 0} Questions • {row.totalMarks} Marks
          </div>
          <div className="text-[11px] text-slate-500">
            {row.durationMinutes} mins • {row.passPercentage}% pass mark
          </div>
        </div>
      ),
    },
    {
      key: 'proctoring',
      header: 'Proctoring Rules',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {row.requireFullscreen && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              <Maximize2 className="w-2.5 h-2.5" />
              Full Screen
            </span>
          )}
          {(row.disableCopyPaste ?? true) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
              <ClipboardX className="w-2.5 h-2.5" />
              No Copy-Paste
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
            <EyeOff className="w-2.5 h-2.5" />
            Max {row.maxTabSwitches ?? 3} Switches
          </span>
        </div>
      ),
    },
    {
      key: 'attempts',
      header: 'Attempts & Violations',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800">
            {row.completedAttempts}/{row.totalAttempts} Completed ({row.passRate}% Pass)
          </div>
          {row.autoSubmittedCount > 0 && (
            <div className="text-[11px] font-bold text-rose-600">
              {row.autoSubmittedCount} Auto-submitted (Tab violation)
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Users}
            onClick={() => openAttemptsInspector(row)}
          >
            Attempts ({row.totalAttempts})
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Play}
            onClick={() => window.open(`http://localhost:3000/dashboard/tests?test=${row.slug || row.id}&mode=preview`, '_blank')}
            title="Trainer Sandbox Test Run: Preview and attempt this assessment live in student app"
            className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200"
          >
            Test Run
          </Button>
          <Button variant="secondary" size="sm" icon={Edit3} onClick={() => openEditModal(row)}>
            Arrange / Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Copy}
            onClick={() => handleDuplicateTest(row)}
            title="Duplicate test format & questions"
          >
            Duplicate
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleteTarget(row)}
            className="text-rose-600 hover:bg-rose-50"
          />
        </div>
      ),
    },
  ];

  const publishedTestsCount = tests.filter((t) => t.status === 'PUBLISHED').length;
  const totalAttemptsSum = tests.reduce((acc, t) => acc + (t.totalAttempts || 0), 0);
  const autoSubmitsSum = tests.reduce((acc, t) => acc + (t.autoSubmittedCount || 0), 0);
  const avgPassRate =
    tests.length > 0
      ? Math.round(tests.reduce((acc, t) => acc + (t.passRate || 0), 0) / tests.length)
      : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Proctored Exam Engine"
        icon={ShieldCheck}
        title="Tests & Assessment Format Composer"
        subtitle="Arrange test question order, customize per-question marks, configure fullscreen & copy-paste proctoring, and audit student attempts"
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExportTestsCsv}>
              Export CSV
            </Button>
            <Button icon={Plus} onClick={openCreateModal}>
              Create &amp; Arrange Test
            </Button>
          </>
        }
      />

      {/* Proctoring & Assessment KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Published Assessments"
          value={`${publishedTestsCount} / ${tests.length}`}
          sublabel="Active weekly DSA tests"
          icon={ShieldCheck}
          tone="emerald"
        />
        <StatCard
          label="Student Attempts"
          value={totalAttemptsSum}
          sublabel="Proctored exam sessions"
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="Average Pass Rate"
          value={`${avgPassRate}%`}
          sublabel="Across published papers"
          icon={CheckCircle2}
          tone="purple"
        />
        <StatCard
          label="Auto-Submit Violations"
          value={autoSubmitsSum}
          sublabel="Reassignable in 1 click"
          icon={AlertTriangle}
          tone="rose"
        />
      </div>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tests by title or slug..."
        onRefresh={loadTests}
      >
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-40"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={filteredTests}
        rowKey={(r) => r.id}
        loading={loading}
        emptyMessage="No tests created yet. Click 'Create & Arrange Test' to build one."
      />

      {/* ── Create / Arrange Test Format Modal ── */}
      <Modal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        title={form.id ? `Arrange & Edit Test: ${form.title}` : 'Create & Arrange New Assessment'}
        subtitle="Select questions from the Problem Bank, reorder them, assign marks, and configure proctoring thresholds"
        maxWidth="max-w-5xl"
        footer={
          <>
            <div className="mr-auto text-xs text-slate-600">
              Selected: <strong>{form.questions.length} Questions</strong> • Arranged:{' '}
              <strong className="text-emerald-700">{totalArrangedMarks} pts</strong> • Target:{' '}
              <strong className="text-slate-900">{form.totalMarks} pts</strong>
            </div>
            <Button variant="secondary" onClick={() => setComposerOpen(false)}>
              Cancel
            </Button>
            <Button icon={CheckCircle2} loading={saving} onClick={handleSaveTest}>
              {form.id ? 'Save Test Format' : 'Create & Publish Test'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Top Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <FormField label="Test Title" required className="sm:col-span-2">
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Weekly DSA Test - 13"
              />
            </FormField>

            <FormField label="Slug" hint="Auto if empty">
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="weekly-dsa-13"
              />
            </FormField>

            <FormField label="Status">
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}
              >
                <option value="PUBLISHED">PUBLISHED (Live)</option>
                <option value="DRAFT">DRAFT</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormField label="Week #">
              <Input
                type="number"
                min={1}
                value={form.weekNumber}
                onChange={(e) => setForm({ ...form, weekNumber: e.target.value })}
              />
            </FormField>

            <FormField label="Duration (Minutes)" required>
              <Input
                type="number"
                min={5}
                max={360}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Pass Percentage (%)" required>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.passPercentage}
                onChange={(e) => setForm({ ...form, passPercentage: Number(e.target.value) })}
              />
            </FormField>

            <FormField label="Max Tab Switches" hint="> limit auto-submits">
              <Input
                type="number"
                min={1}
                max={20}
                value={form.maxTabSwitches}
                onChange={(e) => setForm({ ...form, maxTabSwitches: Number(e.target.value) })}
              />
            </FormField>
          </div>

          {/* Proctoring Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Toggle
              checked={form.requireFullscreen}
              onChange={(val) => setForm({ ...form, requireFullscreen: val })}
              label="Enforce Full-Screen Mode & Proctoring Lock"
              description={`Mandatory full-screen mode. > ${form.maxTabSwitches} tab switches auto-submits.`}
            />
            <Toggle
              checked={form.disableCopyPaste}
              onChange={(val) => setForm({ ...form, disableCopyPaste: val })}
              label="Disable Copy & Paste in Test"
              description="Prevents copying problem text and pasting external code into the editor."
            />
          </div>

          {/* Assessment Mode & Live Scheduling */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-800">Assessment Execution Mode</span>
                <p className="text-[11px] text-slate-500">Choose between live student examination or trainer preview/testing sandbox</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, mode: 'LIVE' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.mode === 'LIVE'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Live Student Mode
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, mode: 'TRAINER_PREVIEW' })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    form.mode === 'TRAINER_PREVIEW'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Trainer Sandbox / Test Mode
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <Toggle
                checked={form.scheduleEnabled}
                onChange={(val) => setForm({ ...form, scheduleEnabled: val })}
                label="Schedule Live Availability Window (Date & Time)"
                description="When enabled, students can only attempt within this window. Otherwise live immediately upon publishing."
              />

              {form.scheduleEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/80">
                  <FormField label="Start Date & Time (Live From)" required>
                    <input
                      type="datetime-local"
                      value={form.startTime}
                      onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </FormField>

                  <FormField label="End Date & Time (Live Until)" required>
                    <input
                      type="datetime-local"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </FormField>
                </div>
              )}
            </div>
          </div>

          {/* Marking Toolbar (Default Marking & Overall Target) */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Default Question Marks:</span>
              <Input
                type="number"
                min={1}
                value={defaultQuestionMarks}
                onChange={(e) => setDefaultQuestionMarks(Number(e.target.value))}
                className="w-16 py-1 px-2 text-center font-bold"
              />
              <Button size="sm" variant="secondary" onClick={applyDefaultMarksToAll}>
                Apply to All
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Target Total Marks:</span>
              <Input
                type="number"
                min={1}
                value={form.totalMarks}
                onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                className="w-20 py-1 px-2 text-center font-bold"
              />
              <Button size="sm" variant="secondary" icon={Calculator} onClick={distributeTotalMarksEvenly}>
                Distribute Evenly
              </Button>
            </div>

            <div>
              {totalArrangedMarks === form.totalMarks ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Exact Match: {totalArrangedMarks} / {form.totalMarks} pts
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Sum: {totalArrangedMarks} pts • Target: {form.totalMarks} pts ({form.totalMarks - totalArrangedMarks > 0 ? `${form.totalMarks - totalArrangedMarks} pts remaining` : `${totalArrangedMarks - form.totalMarks} pts surplus`})
                </span>
              )}
            </div>
          </div>

          {/* Interactive Dual-Pane Question Format Arranger */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
            {/* Left Pane: Question Bank Picker */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col h-80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold text-slate-800">
                  Available Question Bank ({availableProblems.length})
                </span>
              </div>

              <div className="relative mb-2.5">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="Filter bank questions..."
                  className="pl-8 py-1.5"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {availableProblems.map((prob) => {
                  const isAdded = form.questions.some((q) => q.problemId === prob.id);
                  return (
                    <div
                      key={prob.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 truncate">{prob.title}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StatusBadge value={prob.difficulty} />
                          <span className="text-[10px] text-slate-400 font-mono">
                            {prob.testCasesCount ?? 0} test cases
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={isAdded ? 'secondary' : 'primary'}
                        disabled={isAdded}
                        onClick={() => addQuestionToTest(prob)}
                      >
                        {isAdded ? 'Added' : '+ Add'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Pane: Arranged Test Paper Order & Marks */}
            <div className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50/20 flex flex-col h-80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-extrabold text-slate-900">
                  Arranged Test Paper ({form.questions.length} Questions • {totalArrangedMarks} Marks)
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {form.questions.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center text-xs text-slate-400 px-6">
                    Click &ldquo;+ Add&rdquo; on questions from the left bank to arrange the test format.
                  </div>
                ) : (
                  form.questions.map((q, idx) => (
                    <div
                      key={q.problemId}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                          Q{idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{q.title}</div>
                          <StatusBadge value={q.difficulty} />
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            min={1}
                            value={q.marks}
                            onChange={(e) => {
                              const next = [...form.questions];
                              next[idx] = { ...q, marks: Number(e.target.value) };
                              setForm({ ...form, questions: next });
                            }}
                            className="w-16 py-1 px-2 text-center font-bold"
                          />
                          <span className="text-[10px] text-slate-500">pts</span>
                        </div>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveQuestion(idx, -1)}
                          className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === form.questions.length - 1}
                          onClick={() => moveQuestion(idx, 1)}
                          className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeQuestionFromTest(q.problemId)}
                          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Short Description">
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </FormField>
            <FormField label="Candidate Instructions">
              <Textarea
                rows={2}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </FormField>
          </div>
        </div>
      </Modal>

      {/* ── Student Attempts & Proctoring Inspector Modal ── */}
      <Modal
        open={Boolean(attemptsTest)}
        onClose={() => setAttemptsTest(null)}
        title={`Student Attempts & Proctoring Log: ${attemptsTest?.title || ''}`}
        subtitle={`Max Allowed Tab Switches: ${attemptsTest?.maxTabSwitches ?? 3} • Fullscreen Required: ${
          attemptsTest?.requireFullscreen ? 'Yes' : 'No'
        }`}
        maxWidth="max-w-5xl"
      >
        {selectedAttemptAnswers ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Submitted Code Breakdown — {selectedAttemptAnswers.user?.name || selectedAttemptAnswers.user?.email}
                </h4>
                <p className="text-xs text-slate-500">
                  Score: {selectedAttemptAnswers.score}/{attemptsTest?.totalMarks} ({selectedAttemptAnswers.percentage}%) • Tab Switches:{' '}
                  {selectedAttemptAnswers.tabSwitchCount ?? 0}
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setSelectedAttemptAnswers(null)}>
                Back to Attempts List
              </Button>
            </div>

            <div className="space-y-3">
              {(selectedAttemptAnswers.answers || []).map((ans: any, i: number) => (
                <div key={ans.id || i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="font-bold text-slate-900">
                      {ans.problem?.title || `Question ${i + 1}`} ({ans.language})
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge value={ans.verdict || ans.status} />
                      <span className="font-bold text-emerald-800">
                        {ans.marksAwarded} pts ({ans.testsPassed}/{ans.totalTests} cases)
                      </span>
                    </div>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-950 text-emerald-300 font-mono text-[11px] overflow-x-auto max-h-56">
                    {ans.code || '// No code submitted'}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Total Recorded Attempts: {attempts.length}
              </span>
              {attempts.length > 0 && (
                <Button variant="secondary" size="sm" icon={Download} onClick={handleExportAttemptsCsv}>
                  Export Attempts CSV
                </Button>
              )}
            </div>
            <DataTable
              loading={loadingAttempts}
              rows={attempts}
              rowKey={(a) => a.id}
              emptyMessage="No students have attempted this test yet."
              columns={[
              {
                key: 'student',
                header: 'Student',
                render: (a) => (
                  <div>
                    <div className="font-bold text-slate-900">{a.user?.name || 'Student'}</div>
                    <div className="text-[11px] text-slate-400">{a.user?.email}</div>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (a) => (
                  <div className="flex flex-col gap-1 items-start">
                    <StatusBadge value={a.status} />
                    {a.autoSubmitted && (
                      <StatusBadge value="VIOLATION" label="Auto-Submitted" />
                    )}
                  </div>
                ),
              },
              {
                key: 'score',
                header: 'Score',
                render: (a) => (
                  <div>
                    <span className="font-extrabold text-slate-900">
                      {a.score} / {attemptsTest?.totalMarks ?? 100}
                    </span>{' '}
                    <span className="text-slate-500">({a.percentage}%)</span>
                  </div>
                ),
              },
              {
                key: 'proctoring',
                header: 'Tab Switches & Violations',
                render: (a) => (
                  <div>
                    <div className="font-semibold text-slate-800">
                      Tab Switches: <strong className={a.tabSwitchCount > 0 ? 'text-rose-600' : 'text-emerald-700'}>{a.tabSwitchCount ?? 0}</strong> / {attemptsTest?.maxTabSwitches ?? 3}
                    </div>
                    {a.terminationReason && (
                      <div className="text-[10px] text-rose-600 font-medium">{a.terminationReason}</div>
                    )}
                  </div>
                ),
              },
              {
                key: 'actions',
                header: 'Actions',
                className: 'text-right',
                render: (a) => (
                  <div className="inline-flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Code2}
                      onClick={() => setSelectedAttemptAnswers(a)}
                    >
                      Inspect Code
                    </Button>
                    {/* Reassign action especially for auto-submitted or finalized attempts */}
                    <Button
                      variant="primary"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => openReassignDialog(a)}
                      className={a.autoSubmitted ? 'bg-amber-600 hover:bg-amber-500 text-white' : ''}
                      title="Reassign test: clears tab violation strikes, unlocks attempt, and extends timer"
                    >
                      {a.autoSubmitted ? 'Reassign (Auto-Submitted)' : 'Reassign'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={RotateCcw}
                      onClick={() => handleResetAttempt(a.id)}
                      className="text-rose-600 hover:bg-rose-50"
                      title="Completely reset/delete attempt record"
                    >
                      Reset
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDeleteTest}
        loading={saving}
        title="Delete Test?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}" and all associated student attempts?`}
        confirmLabel="Delete Test"
      />

      {/* Reassign / Unlock Attempt Modal */}
      <Modal
        open={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        title="Reassign Test Attempt"
        subtitle={`Unlock assessment for ${reassignTarget?.user?.name || reassignTarget?.user?.email || 'Student'}`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {reassignTarget?.autoSubmitted && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Accidental Auto-Submit Detected</strong>
                <span>
                  This test was auto-submitted due to proctoring violation ({reassignTarget.terminationReason || 'tab switches'}). Reassigning will reset strikes to 0, clear the lock, and allow the student to resume.
                </span>
              </div>
            </div>
          )}

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5 text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Student:</span>{' '}
              {reassignTarget?.user?.name} ({reassignTarget?.user?.email})
            </div>
            <div>
              <span className="font-semibold text-slate-800">Current Status:</span>{' '}
              <span className="font-mono text-slate-700">{reassignTarget?.status}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800">Violations:</span>{' '}
              {reassignTarget?.tabSwitchCount || 0} tab switch strikes
            </div>
          </div>

          <FormField
            label="Extension Time (Minutes)"
            hint="Time granted from this moment to finish the test"
            required
          >
            <Input
              type="number"
              min={5}
              max={300}
              value={reassignMinutes}
              onChange={(e) => setReassignMinutes(Math.max(1, Number(e.target.value)))}
            />
          </FormField>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setReassignModalOpen(false)}
              disabled={reassigning}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              loading={reassigning}
              icon={RotateCcw}
              onClick={handleConfirmReassign}
            >
              Confirm Reassign & Unlock
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

