'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Code2,
  FileText,
  Layers,
  FlaskConical,
  Tag,
  Upload,
  Download,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  adminApi,
  downloadCsv,
  type ProblemItem,
  type TopicItem,
  type Difficulty,
  type ContentStatus,
  type ExecutionMode,
  type ProblemExampleInput,
  type ProblemTestCaseInput,
  type BulkProblemValidationResponse,
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
  StatusBadge,
  type ColumnDef,
} from '@/components/ui/primitives';

const DEFAULT_BOILERPLATE: Record<string, string> = {
  python: 'class Solution:\n    def solve(self, nums: list[int]) -> int:\n        # Write your solution here\n        return 0\n',
  cpp: 'class Solution {\npublic:\n    int solve(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};\n',
  java: 'class Solution {\n    public int solve(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}\n',
  javascript: 'function solve(nums) {\n  // Write your solution here\n  return 0;\n}\n',
};

interface QuestionFormState {
  id?: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  status: ContentStatus;
  executionMode: ExecutionMode;
  description: string;
  editorial: string;
  constraintsText: string;
  hintsText: string;
  topicSlugs: string[];
  primaryTopicSlug: string;
  boilerplate: Record<string, string>;
  examples: ProblemExampleInput[];
  testCases: ProblemTestCaseInput[];
}

const emptyQuestionForm = (defaultTopicSlug = ''): QuestionFormState => ({
  title: '',
  slug: '',
  difficulty: 'MEDIUM',
  status: 'PUBLISHED',
  executionMode: 'FUNCTION',
  description: '',
  editorial: '',
  constraintsText: '1 <= n <= 10^5',
  hintsText: '',
  topicSlugs: defaultTopicSlug ? [defaultTopicSlug] : [],
  primaryTopicSlug: defaultTopicSlug,
  boilerplate: { ...DEFAULT_BOILERPLATE },
  examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: '' }],
  testCases: [
    { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false, timeLimitMs: 2000, memoryLimitKb: 262144 },
    { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: true, timeLimitMs: 2000, memoryLimitKb: 262144 },
  ],
});

export function QuestionsPanel({ onNotify }: { onNotify: (msg: string, type?: 'success' | 'error') => void }) {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [topicFilter, setTopicFilter] = useState('');

  // Modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'core' | 'examples' | 'testcases' | 'boilerplate'>('core');
  const [activeLang, setActiveLang] = useState<string>('python');
  const [form, setForm] = useState<QuestionFormState>(() => emptyQuestionForm());
  const [saving, setSaving] = useState(false);

  // Quick topic creation
  const [newTopicName, setNewTopicName] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);

  // Archive confirmation
  const [archiveTarget, setArchiveTarget] = useState<ProblemItem | null>(null);

  // Bulk Upload & Validation Preview state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkJsonText, setBulkJsonText] = useState('');
  const [bulkParsedItems, setBulkParsedItems] = useState<any[]>([]);
  const [bulkValidation, setBulkValidation] = useState<BulkProblemValidationResponse | null>(null);
  const [validatingBulk, setValidatingBulk] = useState(false);
  const [importingBulk, setImportingBulk] = useState(false);

  const loadSampleBulkTemplate = () => {
    const sample = [
      {
        title: 'Maximum Subarray Sum (Kadane)',
        slug: 'maximum-subarray-sum-kadane',
        difficulty: 'MEDIUM',
        status: 'PUBLISHED',
        executionMode: 'FUNCTION',
        description:
          'Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
        topicSlugs: [topics[0]?.slug || 'arrays'],
        constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
        hints: ['Keep track of the current running sum and reset if it drops below 0.'],
        boilerplate: DEFAULT_BOILERPLATE,
        examples: [
          {
            input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
            output: '6',
            explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
          },
        ],
        testCases: [
          { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false },
          { input: '[1]', expectedOutput: '1', isHidden: true },
          { input: '[5,4,-1,7,8]', expectedOutput: '23', isHidden: true },
        ],
      },
    ];
    setBulkJsonText(JSON.stringify(sample, null, 2));
    setBulkValidation(null);
  };

  const handleBulkFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (file.name.endsWith('.csv')) {
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          onNotify('CSV file must have a header row and at least one data row', 'error');
          return;
        }
        const headers = lines[0]!.split(',').map((h) => h.trim());
        const items = lines.slice(1).map((line) => {
          const cols = line.split(',').map((c) => c.trim());
          const row: Record<string, any> = {};
          headers.forEach((h, idx) => {
            row[h] = cols[idx] ?? '';
          });
          return {
            title: row['title'] || row['Title'] || '',
            slug: row['slug'] || row['Slug'] || undefined,
            difficulty: (row['difficulty'] || row['Difficulty'] || 'MEDIUM').toUpperCase(),
            status: (row['status'] || row['Status'] || 'PUBLISHED').toUpperCase(),
            description: row['description'] || row['Description'] || '',
            topicSlugs: (row['topicSlugs'] || row['topics'] || 'arrays')
              .split(';')
              .map((s: string) => s.trim())
              .filter(Boolean),
            examples: row['exampleInput']
              ? [{ input: row['exampleInput'], output: row['exampleOutput'] || '' }]
              : [],
            testCases: row['testInput']
              ? [
                  {
                    input: row['testInput'],
                    expectedOutput: row['testOutput'] || '',
                    isHidden: false,
                  },
                ]
              : [],
          };
        });
        setBulkJsonText(JSON.stringify(items, null, 2));
      } else {
        setBulkJsonText(text);
      }
      setBulkValidation(null);
      onNotify(`Loaded "${file.name}" — click Validate Preview to inspect`);
    } catch (err: any) {
      onNotify(err.message || 'Failed to read file', 'error');
    }
  };

  const handleValidateBulk = async () => {
    if (!bulkJsonText.trim()) {
      onNotify('Paste JSON or upload a JSON/CSV file first', 'error');
      return;
    }
    try {
      setValidatingBulk(true);
      const parsed = JSON.parse(bulkJsonText);
      const items = Array.isArray(parsed) ? parsed : parsed.problems || parsed.records || [];
      if (!Array.isArray(items) || items.length === 0) {
        onNotify('JSON must be a non-empty array of problem objects', 'error');
        return;
      }
      setBulkParsedItems(items);
      const res = await adminApi.validateBulkProblems(items);
      setBulkValidation(res);
      onNotify(
        `Validation complete: ${res.validCount} valid, ${res.duplicateCount} duplicates, ${res.errorCount} invalid`,
      );
    } catch (err: any) {
      onNotify(err.message || 'Invalid JSON format or validation error', 'error');
    } finally {
      setValidatingBulk(false);
    }
  };

  const handleImportBulk = async () => {
    if (!bulkValidation || bulkValidation.validCount === 0) {
      onNotify('No valid records ready for import', 'error');
      return;
    }
    try {
      setImportingBulk(true);
      const res = await adminApi.importBulkProblems(bulkParsedItems, {
        skipDuplicates: true,
        autoCreateMissingTopics: true,
      });
      onNotify(
        `Imported ${res.importedCount} problems (${res.skippedCount} skipped, ${res.failedCount} failed)`,
      );
      setBulkOpen(false);
      setBulkValidation(null);
      await loadTopics();
      await loadProblems();
    } catch (err: any) {
      onNotify(err.message || 'Failed to import problems', 'error');
    } finally {
      setImportingBulk(false);
    }
  };

  const handleExportCsv = () => {
    downloadCsv(
      'numu-problems-bank.csv',
      problems.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        difficulty: p.difficulty,
        status: p.status,
        topics: (p.topics || []).map((t) => t.name).join('; '),
        testCasesCount: p.testCasesCount ?? 0,
        submissionsCount: p.submissionsCount ?? 0,
        acceptanceRate: `${Math.round(p.acceptanceRate || 0)}%`,
      })),
    );
  };

  const loadTopics = useCallback(async () => {
    try {
      const list = await adminApi.listTopics();
      setTopics(Array.isArray(list) ? list : []);
    } catch {
      // ignore
    }
  }, []);

  const loadProblems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listProblems({
        page,
        limit: 15,
        search: search || undefined,
        difficulty: difficultyFilter || undefined,
        status: statusFilter || undefined,
        topic: topicFilter || undefined,
      });
      setProblems(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load problems', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, difficultyFilter, statusFilter, topicFilter, onNotify]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    void loadProblems();
  }, [loadProblems]);

  const openCreateModal = () => {
    const firstTopic = topics[0]?.slug || '';
    setForm(emptyQuestionForm(firstTopic));
    setActiveTab('core');
    setEditorOpen(true);
  };

  const openEditModal = async (item: ProblemItem) => {
    try {
      const full = await adminApi.getProblem(item.slug);
      const topicSlugs = full.topics?.map((t) => t.slug) || [];
      const primary = full.topics?.find((t) => t.isPrimary)?.slug || topicSlugs[0] || '';
      setForm({
        id: full.id,
        title: full.title,
        slug: full.slug,
        difficulty: full.difficulty,
        status: full.status,
        executionMode: full.executionMode || 'FUNCTION',
        description: full.description || '',
        editorial: full.editorial || '',
        constraintsText: (full.constraints || []).join('\n'),
        hintsText: (full.hints || []).join('\n'),
        topicSlugs,
        primaryTopicSlug: primary,
        boilerplate: {
          ...DEFAULT_BOILERPLATE,
          ...(full.boilerplate || {}),
        },
        examples:
          full.examples && full.examples.length > 0
            ? full.examples.map((ex) => ({
                input: ex.input,
                output: ex.output,
                explanation: ex.explanation || '',
              }))
            : [{ input: '', output: '', explanation: '' }],
        testCases:
          full.testCases && full.testCases.length > 0
            ? full.testCases.map((tc) => ({
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isHidden: tc.isHidden ?? true,
                timeLimitMs: tc.timeLimitMs ?? 2000,
                memoryLimitKb: tc.memoryLimitKb ?? 262144,
              }))
            : [{ input: '', expectedOutput: '', isHidden: false, timeLimitMs: 2000, memoryLimitKb: 262144 }],
      });
      setActiveTab('core');
      setEditorOpen(true);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load problem details', 'error');
    }
  };

  const handleCreateTopicInline = async () => {
    if (!newTopicName.trim()) return;
    try {
      setCreatingTopic(true);
      const created = await adminApi.createTopic({ name: newTopicName.trim() });
      setNewTopicName('');
      await loadTopics();
      setForm((prev) => ({
        ...prev,
        topicSlugs: Array.from(new Set([...prev.topicSlugs, created.slug])),
        primaryTopicSlug: prev.primaryTopicSlug || created.slug,
      }));
      onNotify(`Topic "${created.name}" created`);
    } catch (err: any) {
      onNotify(err.message || 'Failed to create topic', 'error');
    } finally {
      setCreatingTopic(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      onNotify('Title and problem statement are required', 'error');
      return;
    }
    if (form.topicSlugs.length === 0) {
      onNotify('Select or create at least one topic for this question', 'error');
      return;
    }

    const payload = {
      title: form.title.trim(),
      ...(form.slug.trim() && { slug: form.slug.trim() }),
      difficulty: form.difficulty,
      status: form.status,
      executionMode: form.executionMode,
      description: form.description.trim(),
      editorial: form.editorial.trim() || undefined,
      constraints: form.constraintsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      hints: form.hintsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      topicSlugs: form.topicSlugs,
      primaryTopicSlug: form.primaryTopicSlug || form.topicSlugs[0],
      boilerplate: form.boilerplate,
      examples: form.examples
        .filter((e) => e.input.trim() && e.output.trim())
        .map((e, i) => ({
          input: e.input.trim(),
          output: e.output.trim(),
          explanation: e.explanation?.trim() || undefined,
          order: i + 1,
        })),
      testCases: form.testCases
        .filter((tc) => tc.input.trim() && tc.expectedOutput.trim())
        .map((tc, i) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          orderIndex: i,
          timeLimitMs: Number(tc.timeLimitMs) || 2000,
          memoryLimitKb: Number(tc.memoryLimitKb) || 262144,
        })),
    };

    try {
      setSaving(true);
      if (form.id) {
        await adminApi.updateProblem(form.id, payload);
        onNotify(`Question "${form.title}" updated`);
      } else {
        await adminApi.createProblem(payload);
        onNotify(`Question "${form.title}" uploaded to bank`);
      }
      setEditorOpen(false);
      await loadProblems();
    } catch (err: any) {
      onNotify(err.message || 'Failed to save question', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickToggleStatus = async (item: ProblemItem) => {
    const nextStatus: ContentStatus = item.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await adminApi.updateProblem(item.id, { status: nextStatus });
      onNotify(`"${item.title}" marked as ${nextStatus}`);
      await loadProblems();
    } catch (err: any) {
      onNotify(err.message || 'Failed to update status', 'error');
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    try {
      setSaving(true);
      await adminApi.archiveProblem(archiveTarget.id);
      onNotify(`Question "${archiveTarget.title}" archived`);
      setArchiveTarget(null);
      await loadProblems();
    } catch (err: any) {
      onNotify(err.message || 'Failed to archive question', 'error');
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnDef<ProblemItem>[] = [
    {
      key: 'title',
      header: 'Question',
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.title}</div>
          <div className="text-[11px] text-slate-400 font-mono">/{row.slug}</div>
        </div>
      ),
    },
    {
      key: 'difficulty',
      header: 'Difficulty',
      render: (row) => <StatusBadge value={row.difficulty} />,
    },
    {
      key: 'topics',
      header: 'Topics',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.topics?.slice(0, 3).map((t) => (
            <span
              key={t.slug}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
            >
              {t.name}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'testCases',
      header: 'Test Cases',
      render: (row) => (
        <span className="font-mono text-slate-700 font-semibold">
          {row.testCasesCount ?? 0} cases
        </span>
      ),
    },
    {
      key: 'submissions',
      header: 'Submissions & AC Rate',
      render: (row) => {
        const ac = Math.round(row.acceptanceRate || 0);
        return (
          <div className="w-36">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-slate-800">{ac}% AC</span>
              <span className="text-slate-400 font-mono">{row.submissionsCount ?? 0} subs</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  ac >= 65 ? 'bg-emerald-600' : ac >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, ac)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <button
          type="button"
          onClick={() => handleQuickToggleStatus(row)}
          title="Click to toggle PUBLISHED / DRAFT"
          className="cursor-pointer"
        >
          <StatusBadge value={row.status} />
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="inline-flex items-center gap-1.5">
          <Button variant="secondary" size="sm" icon={Edit3} onClick={() => openEditModal(row)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setArchiveTarget(row)}
            className="text-rose-600 hover:bg-rose-50"
          />
        </div>
      ),
    },
  ];

  const publishedCount = problems.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = problems.filter((p) => p.status === 'DRAFT').length;
  const totalTestCasesCount = problems.reduce((acc, p) => acc + (p.testCasesCount ?? 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Curriculum & Problem Repository"
        icon={Code2}
        title="Question & Problem Bank"
        subtitle="Upload DSA coding questions, configure sample & hidden judge test cases, and manage multi-language boilerplates"
        actions={
          <>
            <Button variant="secondary" icon={Download} onClick={handleExportCsv}>
              Export CSV
            </Button>
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => {
                if (!bulkJsonText) loadSampleBulkTemplate();
                setBulkOpen(true);
              }}
            >
              Bulk Upload (JSON / CSV)
            </Button>
            <Button icon={Plus} onClick={openCreateModal}>
              Upload New Question
            </Button>
          </>
        }
      />

      {/* Problem Bank KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Bank Problems"
          value={total || problems.length}
          sublabel={`Across ${topics.length} syllabus topics`}
          icon={Code2}
          tone="emerald"
        />
        <StatCard
          label="Published (Live)"
          value={publishedCount}
          sublabel="Visible in Student Portal"
          icon={CheckCircle2}
          tone="blue"
        />
        <StatCard
          label="Draft / In Review"
          value={draftCount}
          sublabel="Staged for upcoming tests"
          icon={FileText}
          tone="amber"
        />
        <StatCard
          label="Judge0 Test Cases"
          value={totalTestCasesCount}
          sublabel="Sample & hidden grading cases"
          icon={FlaskConical}
          tone="purple"
        />
      </div>

      {/* Quick Difficulty Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: '', label: 'All Problems' },
          { id: 'EASY', label: 'Easy' },
          { id: 'MEDIUM', label: 'Medium' },
          { id: 'HARD', label: 'Hard' },
        ].map((pill) => {
          const active = difficultyFilter === pill.id;
          return (
            <button
              key={pill.id || 'all'}
              type="button"
              onClick={() => {
                setDifficultyFilter(pill.id);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                active
                  ? 'bg-[#0b5c39] text-white border-[#0b5c39] shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200/90 hover:bg-slate-50'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      <FilterBar
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        searchPlaceholder="Search by question title or slug..."
        onRefresh={loadProblems}
      >
        <Select
          value={difficultyFilter}
          onChange={(e) => {
            setDifficultyFilter(e.target.value);
            setPage(1);
          }}
          className="w-36"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-36"
        >
          <option value="">All Statuses</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
        </Select>

        <Select
          value={topicFilter}
          onChange={(e) => {
            setTopicFilter(e.target.value);
            setPage(1);
          }}
          className="w-40"
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        rows={problems}
        rowKey={(r) => r.id}
        loading={loading}
        emptyMessage="No questions found matching your filters."
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
      />

      {/* ── Upload / Edit Question Modal ── */}
      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={form.id ? `Edit Question: ${form.title}` : 'Upload New Coding Question'}
        subtitle="Configure problem statement, examples, hidden grading test cases, and language starter templates"
        maxWidth="max-w-4xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button icon={CheckCircle2} loading={saving} onClick={handleSaveQuestion}>
              {form.id ? 'Save Changes' : 'Upload Question'}
            </Button>
          </>
        }
      >
        {/* Modal Sub-tabs */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-3">
          {[
            { id: 'core', label: '1. Statement & Topics', icon: FileText },
            { id: 'examples', label: `2. Constraints & Examples (${form.examples.length})`, icon: Layers },
            { id: 'testcases', label: `3. Judge Test Cases (${form.testCases.length})`, icon: FlaskConical },
            { id: 'boilerplate', label: '4. Starter Boilerplate', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Core & Statement */}
        {activeTab === 'core' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Question Title" required className="sm:col-span-2">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Container With Most Water"
                />
              </FormField>

              <FormField label="URL Slug" hint="Auto-generated if blank">
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="container-with-most-water"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Difficulty" required>
                <Select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </Select>
              </FormField>

              <FormField label="Publication Status" required>
                <Select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ContentStatus })}
                >
                  <option value="PUBLISHED">PUBLISHED (Live)</option>
                  <option value="DRAFT">DRAFT (Hidden from students)</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </Select>
              </FormField>

              <FormField label="Execution Mode">
                <Select
                  value={form.executionMode}
                  onChange={(e) => setForm({ ...form, executionMode: e.target.value as ExecutionMode })}
                >
                  <option value="FUNCTION">FUNCTION (LeetCode Class/Method)</option>
                  <option value="STDIN_STDOUT">STDIN / STDOUT</option>
                </Select>
              </FormField>
            </div>

            {/* Topics Selection + Quick Add */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  Syllabus Topics <span className="text-rose-500">*</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <Input
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="New topic name..."
                    className="w-44 py-1 text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    loading={creatingTopic}
                    onClick={handleCreateTopicInline}
                  >
                    + Add Topic
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {topics.map((t) => {
                  const selected = form.topicSlugs.includes(t.slug);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        const next = selected
                          ? form.topicSlugs.filter((s) => s !== t.slug)
                          : [...form.topicSlugs, t.slug];
                        setForm({
                          ...form,
                          topicSlugs: next,
                          primaryTopicSlug: next[0] || '',
                        });
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#0b5c39] text-white border-[#0b5c39]'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <FormField label="Problem Statement (Markdown supported)" required>
              <Textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the problem clearly, including input/output specifications..."
              />
            </FormField>

            <FormField label="Editorial / Solution Approach (Optional)">
              <Textarea
                rows={3}
                value={form.editorial}
                onChange={(e) => setForm({ ...form, editorial: e.target.value })}
                placeholder="Explain optimal time/space complexity and algorithm intuition..."
              />
            </FormField>
          </div>
        )}

        {/* Tab 2: Constraints, Hints & Public Examples */}
        {activeTab === 'examples' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Constraints" hint="One constraint per line">
                <Textarea
                  rows={4}
                  value={form.constraintsText}
                  onChange={(e) => setForm({ ...form, constraintsText: e.target.value })}
                  placeholder={'2 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9'}
                  className="font-mono"
                />
              </FormField>

              <FormField label="Hints" hint="One hint per line">
                <Textarea
                  rows={4}
                  value={form.hintsText}
                  onChange={(e) => setForm({ ...form, hintsText: e.target.value })}
                  placeholder={'Try using a two-pointer approach.\nCan you precompute prefix sums?'}
                />
              </FormField>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Public Problem Examples</h4>
                <p className="text-[11px] text-slate-500">Shown in the problem description for students</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() =>
                  setForm({
                    ...form,
                    examples: [...form.examples, { input: '', output: '', explanation: '' }],
                  })
                }
              >
                Add Example
              </Button>
            </div>

            <div className="space-y-3">
              {form.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Example #{idx + 1}</span>
                    {form.examples.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            examples: form.examples.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-xs text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <FormField label="Input">
                      <Input
                        value={ex.input}
                        onChange={(e) => {
                          const next = [...form.examples];
                          next[idx] = { ...ex, input: e.target.value };
                          setForm({ ...form, examples: next });
                        }}
                        placeholder="nums = [2,7,11,15], target = 9"
                        className="font-mono"
                      />
                    </FormField>
                    <FormField label="Output">
                      <Input
                        value={ex.output}
                        onChange={(e) => {
                          const next = [...form.examples];
                          next[idx] = { ...ex, output: e.target.value };
                          setForm({ ...form, examples: next });
                        }}
                        placeholder="[0,1]"
                        className="font-mono"
                      />
                    </FormField>
                  </div>
                  <FormField label="Explanation (Optional)">
                    <Input
                      value={ex.explanation || ''}
                      onChange={(e) => {
                        const next = [...form.examples];
                        next[idx] = { ...ex, explanation: e.target.value };
                        setForm({ ...form, examples: next });
                      }}
                      placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                    />
                  </FormField>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Judge Test Cases (Sample & Hidden) */}
        {activeTab === 'testcases' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  Judge Evaluation Test Cases (Sample &amp; Hidden)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Sample cases run when students click &ldquo;Run Code&rdquo;; Hidden cases grade final submissions.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() =>
                  setForm({
                    ...form,
                    testCases: [
                      ...form.testCases,
                      {
                        input: '',
                        expectedOutput: '',
                        isHidden: true,
                        timeLimitMs: 2000,
                        memoryLimitKb: 262144,
                      },
                    ],
                  })
                }
              >
                Add Test Case
              </Button>
            </div>

            <div className="space-y-3">
              {form.testCases.map((tc, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">Test Case #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = [...form.testCases];
                          next[idx] = { ...tc, isHidden: !tc.isHidden };
                          setForm({ ...form, testCases: next });
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border cursor-pointer ${
                          tc.isHidden
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {tc.isHidden ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden Grading Case</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Public Sample Case</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500">Time (ms):</span>
                      <Input
                        type="number"
                        value={tc.timeLimitMs ?? 2000}
                        onChange={(e) => {
                          const next = [...form.testCases];
                          next[idx] = { ...tc, timeLimitMs: Number(e.target.value) };
                          setForm({ ...form, testCases: next });
                        }}
                        className="w-24 py-1 text-xs"
                      />
                      {form.testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              testCases: form.testCases.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-xs text-rose-600 hover:underline cursor-pointer ml-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <FormField label="Standard Input (stdin)">
                      <Textarea
                        rows={2}
                        value={tc.input}
                        onChange={(e) => {
                          const next = [...form.testCases];
                          next[idx] = { ...tc, input: e.target.value };
                          setForm({ ...form, testCases: next });
                        }}
                        placeholder="[2,7,11,15]&#10;9"
                        className="font-mono"
                      />
                    </FormField>

                    <FormField label="Expected Output (stdout)">
                      <Textarea
                        rows={2}
                        value={tc.expectedOutput}
                        onChange={(e) => {
                          const next = [...form.testCases];
                          next[idx] = { ...tc, expectedOutput: e.target.value };
                          setForm({ ...form, testCases: next });
                        }}
                        placeholder="[0,1]"
                        className="font-mono"
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Language Starter Boilerplate */}
        {activeTab === 'boilerplate' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              {(['python', 'cpp', 'java', 'javascript'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer ${
                    activeLang === lang
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <FormField
              label={`Starter Code Template (${activeLang.toUpperCase()})`}
              hint="Pre-populated in the student code editor"
            >
              <Textarea
                rows={10}
                value={form.boilerplate[activeLang] || ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    boilerplate: { ...form.boilerplate, [activeLang]: e.target.value },
                  })
                }
                className="font-mono text-xs bg-slate-950 text-emerald-300 border-slate-800"
              />
            </FormField>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
        loading={saving}
        title="Archive Question?"
        description={`Are you sure you want to archive "${archiveTarget?.title}"? It will be hidden from students.`}
        confirmLabel="Archive Question"
      />

      {/* ── Bulk Upload & Validation Preview Modal ── */}
      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Bulk Question Upload & Validation Preview"
        subtitle="Upload JSON or CSV problem definitions, inspect duplicate slugs & missing topics, and safely import valid DSA problems"
        maxWidth="max-w-5xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkOpen(false)}>
              Close
            </Button>
            <Button
              variant="secondary"
              icon={Sparkles}
              loading={validatingBulk}
              onClick={handleValidateBulk}
            >
              1. Validate &amp; Preview
            </Button>
            <Button
              icon={CheckCircle2}
              loading={importingBulk}
              disabled={!bulkValidation || bulkValidation.validCount === 0}
              onClick={handleImportBulk}
            >
              2. Import Valid Questions ({bulkValidation?.validCount ?? 0})
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600">
              Upload a <strong className="text-slate-900">.json</strong> or{' '}
              <strong className="text-slate-900">.csv</strong> file, or edit the JSON payload directly below.
              Existing problems are never overwritten silently.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={loadSampleBulkTemplate}>
                Load Sample Template
              </Button>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>Choose JSON / CSV File</span>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleBulkFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <FormField
            label="Problem Array Payload (JSON)"
            hint="Each record supports title, slug, difficulty, status, description, topicSlugs, examples, testCases, boilerplate"
          >
            <Textarea
              rows={8}
              value={bulkJsonText}
              onChange={(e) => {
                setBulkJsonText(e.target.value);
                setBulkValidation(null);
              }}
              className="font-mono text-xs bg-slate-950 text-emerald-300 border-slate-800"
            />
          </FormField>

          {bulkValidation && (
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Total Rows</div>
                  <div className="text-lg font-extrabold text-slate-900">
                    {bulkValidation.totalRecords}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="text-[10px] font-bold uppercase text-emerald-700">Ready to Import</div>
                  <div className="text-lg font-extrabold text-emerald-800">
                    {bulkValidation.validCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="text-[10px] font-bold uppercase text-amber-700">Duplicates Skipped</div>
                  <div className="text-lg font-extrabold text-amber-800">
                    {bulkValidation.duplicateCount}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                  <div className="text-[10px] font-bold uppercase text-rose-700">Invalid Rows</div>
                  <div className="text-lg font-extrabold text-rose-800">
                    {bulkValidation.errorCount}
                  </div>
                </div>
              </div>

              <DataTable
                rows={bulkValidation.items}
                rowKey={(r) => `${r.index}-${r.slug}`}
                columns={[
                  {
                    key: 'row',
                    header: '#',
                    render: (r) => <span className="font-mono text-slate-400">#{r.index + 1}</span>,
                  },
                  {
                    key: 'title',
                    header: 'Problem & Slug',
                    render: (r) => (
                      <div>
                        <div className="font-bold text-slate-900">{r.title || '(Missing Title)'}</div>
                        <div className="text-[11px] font-mono text-slate-400">/{r.slug}</div>
                      </div>
                    ),
                  },
                  {
                    key: 'diff',
                    header: 'Difficulty',
                    render: (r) => <StatusBadge value={r.difficulty} />,
                  },
                  {
                    key: 'cases',
                    header: 'Cases',
                    render: (r) => (
                      <span className="text-xs text-slate-600">
                        {r.examplesCount} ex • {r.testCasesCount} tests
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Validation Verdict',
                    render: (r) =>
                      r.valid ? (
                        <StatusBadge value="PUBLISHED" label="VALID" />
                      ) : r.isDuplicateInDb || r.isDuplicateInBatch ? (
                        <StatusBadge value="DRAFT" label="DUPLICATE" />
                      ) : (
                        <StatusBadge value="VIOLATION" label="INVALID" />
                      ),
                  },
                  {
                    key: 'issues',
                    header: 'Diagnostics / Warnings',
                    render: (r) => (
                      <div className="space-y-0.5 text-[11px]">
                        {r.errors.map((err, i) => (
                          <div key={i} className="text-rose-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                        {r.warnings.map((w, i) => (
                          <div key={i} className="text-amber-700">
                            • {w}
                          </div>
                        ))}
                        {r.errors.length === 0 && r.warnings.length === 0 && (
                          <span className="text-emerald-700 font-semibold">All checks passed</span>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

