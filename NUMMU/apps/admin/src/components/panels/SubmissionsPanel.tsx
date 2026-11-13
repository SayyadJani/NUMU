'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Download,
  Code2,
  AlertTriangle,
} from 'lucide-react';
import { adminApi, downloadCsv } from '@/lib/api';
import {
  PageHeader,
  StatCard,
  FilterBar,
  DataTable,
  Modal,
  Select,
  Button,
  StatusBadge,
  type ColumnDef,
} from '@/components/ui/primitives';
import { CharacterAvatar } from '@/components/ui/brand';

export function SubmissionsPanel({
  onNotify,
}: {
  onNotify: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    total: 0,
    accepted: 0,
    failed: 0,
    pending: 0,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [verdict, setVerdict] = useState('');
  const [status, setStatus] = useState('');
  const [language, setLanguage] = useState('');

  // Submission Detail Modal
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.listSubmissions({
        page,
        limit: 20,
        search: search.trim() || undefined,
        verdict: verdict || undefined,
        status: status || undefined,
        language: language || undefined,
      });
      setItems(res.items || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotal(res.pagination?.total || 0);
      if (res.summary) setSummary(res.summary);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load submissions', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, verdict, status, language, onNotify]);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  const openInspector = async (id: string) => {
    try {
      setLoadingDetail(true);
      const detail = await adminApi.getSubmission(id);
      setSelectedSubmission(detail);
    } catch (err: any) {
      onNotify(err.message || 'Failed to load submission details', 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExportCsv = () => {
    downloadCsv(
      'numu-submissions-report.csv',
      [
        'Submission ID',
        'Student Name',
        'Student Email',
        'Problem Title',
        'Difficulty',
        'Language',
        'Status',
        'Verdict',
        'Tests Passed',
        'Total Tests',
        'Runtime (ms)',
        'Memory (KB)',
        'Submitted At',
      ],
      items.map((s) => [
        s.id,
        s.user?.name || s.user?.username || 'Student',
        s.user?.email || '',
        s.problem?.title || '',
        s.problem?.difficulty || '',
        s.language,
        s.status,
        s.verdict,
        s.testsPassed ?? 0,
        s.totalTests ?? 0,
        s.runtimeMs ?? '',
        s.memoryKb ?? '',
        new Date(s.createdAt).toISOString(),
      ]),
    );
    onNotify('Submissions report exported to CSV');
  };

  const columns: ColumnDef<any>[] = [
    {
      key: 'student',
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <CharacterAvatar seed={s.user?.name || s.user?.email || 'Student'} size={30} />
          <div>
            <div className="font-bold text-slate-900">
              {s.user?.name || s.user?.username || 'Student'}
            </div>
            <div className="text-[11px] text-slate-400">{s.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'problem',
      header: 'Problem',
      render: (s) => (
        <div>
          <div className="font-semibold text-slate-800">{s.problem?.title}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {s.problem?.difficulty && <StatusBadge value={s.problem.difficulty} />}
            <span className="text-[10px] font-mono text-slate-400">/{s.problem?.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'language',
      header: 'Language',
      render: (s) => (
        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold uppercase">
          {s.language}
        </span>
      ),
    },
    {
      key: 'verdict',
      header: 'Judge0 Verdict',
      render: (s) => {
        const passed = s.testsPassed ?? 0;
        const tot = Math.max(1, s.totalTests ?? 1);
        const pct = Math.round((passed / tot) * 100);
        return (
          <div className="w-36 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <StatusBadge value={s.verdict} />
              <span className="text-[10px] text-slate-500 font-mono font-bold">
                {passed}/{s.totalTests ?? 0}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'execution',
      header: 'Runtime / Memory',
      render: (s) => (
        <div className="text-[11px] font-mono text-slate-600">
          <div>{s.runtimeMs !== null && s.runtimeMs !== undefined ? `${s.runtimeMs} ms` : '—'}</div>
          <div className="text-slate-400">
            {s.memoryKb ? `${Math.round(s.memoryKb / 1024 * 10) / 10} MB` : '—'}
          </div>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (s) => (
        <span className="text-[11px] text-slate-500">
          {new Date(s.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Inspect',
      className: 'text-right',
      render: (s) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Code2}
          loading={loadingDetail && selectedSubmission?.id === s.id}
          onClick={() => openInspector(s.id)}
        >
          Inspect Code
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        badge="Judge0 Execution Pipeline"
        icon={Terminal}
        title="Submissions & Judge0 Evaluations"
        subtitle="Monitor real-time student code evaluations, Judge0 verdicts, compilation errors, and test-case pass rates."
        actions={
          <Button variant="secondary" icon={Download} onClick={handleExportCsv}>
            Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Submissions"
          value={summary.total}
          sublabel="Matched by current filters"
          icon={Terminal}
          tone="blue"
        />
        <StatCard
          label="Accepted (AC)"
          value={summary.accepted}
          sublabel={
            summary.total > 0
              ? `${Math.round((summary.accepted / summary.total) * 100)}% acceptance rate`
              : '0% acceptance rate'
          }
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Rejected / Errors"
          value={summary.failed}
          sublabel="WA, TLE, MLE, CE, or RE"
          icon={XCircle}
          tone="rose"
        />
        <StatCard
          label="Queued / Processing"
          value={summary.pending}
          sublabel="In Judge0 worker pipeline"
          icon={Clock}
          tone="amber"
        />
      </div>

      {/* Quick Verdict Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { id: '', label: 'All Verdicts' },
          { id: 'AC', label: 'Accepted (AC)' },
          { id: 'WA', label: 'Wrong Answer (WA)' },
          { id: 'TLE', label: 'Time Limit (TLE)' },
          { id: 'CE', label: 'Compile Error (CE)' },
        ].map((pill) => {
          const active = verdict === pill.id;
          return (
            <button
              key={pill.id || 'all'}
              type="button"
              onClick={() => {
                setVerdict(pill.id);
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
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        searchPlaceholder="Search student name, email, or problem title..."
        onRefresh={loadSubmissions}
      >
        <Select
          value={verdict}
          onChange={(e) => {
            setVerdict(e.target.value);
            setPage(1);
          }}
          className="w-44"
        >
          <option value="">All Verdicts</option>
          <option value="ACCEPTED">Accepted (AC)</option>
          <option value="WRONG_ANSWER">Wrong Answer (WA)</option>
          <option value="TIME_LIMIT_EXCEEDED">Time Limit (TLE)</option>
          <option value="MEMORY_LIMIT_EXCEEDED">Memory Limit (MLE)</option>
          <option value="COMPILATION_ERROR">Compilation Error (CE)</option>
          <option value="RUNTIME_ERROR">Runtime Error (RE)</option>
          <option value="PENDING">Pending</option>
        </Select>

        <Select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setPage(1);
          }}
          className="w-36"
        >
          <option value="">All Languages</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
        </Select>

        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="w-36"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="QUEUED">Queued</option>
          <option value="PROCESSING">Processing</option>
          <option value="FAILED">Failed</option>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={items}
        rowKey={(s) => s.id}
        loading={loading}
        emptyTitle="No submissions found"
        emptySubtitle="Try clearing your search or verdict filters."
        page={page}
        totalPages={totalPages}
        totalItems={total}
        onPageChange={setPage}
      />

      {/* Submission & Judge0 Execution Inspector Modal */}
      <Modal
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        title={`Submission Inspector — ${selectedSubmission?.problem?.title || ''}`}
        subtitle={`Submitted by ${selectedSubmission?.user?.name || selectedSubmission?.user?.email || 'Student'} • ${selectedSubmission ? new Date(selectedSubmission.createdAt).toLocaleString() : ''}`}
        maxWidth="max-w-4xl"
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Verdict
                </span>
                <div className="mt-1">
                  <StatusBadge value={selectedSubmission.verdict} />
                </div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Test Cases Passed
                </span>
                <span className="font-extrabold text-slate-900 text-sm mt-1 block">
                  {selectedSubmission.testsPassed} / {selectedSubmission.totalTests}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Execution Runtime
                </span>
                <span className="font-mono font-bold text-slate-800 text-sm mt-1 block">
                  {selectedSubmission.runtimeMs ?? 0} ms
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Language & Mode
                </span>
                <span className="font-mono font-bold text-slate-800 uppercase text-xs mt-1 block">
                  {selectedSubmission.language} ({selectedSubmission.problem?.executionMode || 'FUNCTION'})
                </span>
              </div>
            </div>

            {selectedSubmission.compileError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                <div className="font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" /> Compilation Error Output
                </div>
                <pre className="font-mono text-[11px] text-rose-900 whitespace-pre-wrap overflow-x-auto">
                  {selectedSubmission.compileError}
                </pre>
              </div>
            )}

            {selectedSubmission.stderr && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                <div className="font-bold text-amber-900 mb-1">Standard Error (stderr)</div>
                <pre className="font-mono text-[11px] text-amber-900 whitespace-pre-wrap overflow-x-auto">
                  {selectedSubmission.stderr}
                </pre>
              </div>
            )}

            <div>
              <div className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" /> Submitted Source Code
              </div>
              <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-300 border border-slate-800 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed">
                {selectedSubmission.code || selectedSubmission.sourceCode || '// Empty submission'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

