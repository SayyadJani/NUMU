'use client';

import React, { useEffect, useState, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { OnMount } from '@monaco-editor/react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-xs text-slate-400 bg-[#1e1e1e]">
      Loading editor...
    </div>
  ),
});
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  Copy,
  RotateCcw,
  Code2,
  FileText,
  AlertCircle,
  Loader2,
  Play,
  Send,
  Maximize2,
  Minimize2,
  Check,
  BookOpen,
  ListFilter,
  Search,
  X,
} from 'lucide-react';
import { dsaService } from '@/services/dsa.service';
import { submissionsService } from '@/services/submissions.service';
import { useAuth } from '@/contexts/auth-context';
import type {
  ProblemDetail,
  ProblemListItem,
  Difficulty,
  SupportedLanguage,
  RunResult,
  TestCaseRunResult,
  SubmissionDetail,
  SubmissionVerdict,
} from '@numu/types';

type MonacoEditorInstance = Parameters<NonNullable<OnMount>>[0];

const DIFF_BADGE: Record<Difficulty, string> = {
  EASY: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  MEDIUM: 'text-amber-700 bg-amber-50 border-amber-200',
  HARD: 'text-red-700 bg-red-50 border-red-200',
};

const VERDICT_STYLES: Record<SubmissionVerdict, { bg: string; text: string; border: string; label: string }> = {
  ACCEPTED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Accepted' },
  WRONG_ANSWER: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Wrong Answer' },
  TIME_LIMIT_EXCEEDED: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Time Limit Exceeded' },
  MEMORY_LIMIT_EXCEEDED: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Memory Limit Exceeded' },
  COMPILATION_ERROR: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Compilation Error' },
  RUNTIME_ERROR: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', label: 'Runtime Error' },
  INTERNAL_ERROR: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', label: 'Internal Error' },
  PENDING: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Pending Evaluation' },
};

const MONACO_LANG_MAP: Record<string, string> = {
  python: 'python',
  cpp: 'cpp',
  java: 'java',
  javascript: 'javascript',
  typescript: 'typescript',
};

interface LocalDraft {
  code: string;
  updatedAt: number;
  version: number;
}

function getDraftStorageKey(userId: string | undefined, slug: string, lang: string): string {
  const safeUser = userId || 'anonymous';
  return `numu_draft_v1_${safeUser}_${slug}_${lang}`;
}

/**
 * In-memory editor scratchpad for problem editor session.
 * Explicitly TEMPORARY and UNSAVED active editor state.
 * Strictly adheres to the Zero Browser Storage policy (no localStorage/sessionStorage/IndexedDB).
 * Does not survive page reloads or device changes; final code submissions are persisted via the Submissions API.
 */
const inMemoryDraftStore = new Map<string, LocalDraft>();

function loadSavedDraft(userId: string | undefined, slug: string, lang: string): string | null {
  const key = getDraftStorageKey(userId, slug, lang);
  const draft = inMemoryDraftStore.get(key);
  return draft ? draft.code : null;
}

function saveLocalDraft(userId: string | undefined, slug: string, lang: string, code: string, version: number): boolean {
  const key = getDraftStorageKey(userId, slug, lang);
  inMemoryDraftStore.set(key, {
    code,
    updatedAt: Date.now(),
    version,
  });
  return true;
}

function removeSavedDraft(userId: string | undefined, slug: string, lang: string): void {
  const key = getDraftStorageKey(userId, slug, lang);
  inMemoryDraftStore.delete(key);
}

interface ProblemPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProblemDetailPage({ params }: ProblemPageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const { user, isAuthenticated } = useAuth();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('typescript');
  const [userCode, setUserCode] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [copied, setCopied] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [expandedHints, setExpandedHints] = useState<number[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Left panel tab: 'description' | 'solution'
  const [leftTab, setLeftTab] = useState<'description' | 'solution'>('description');

  // Quick Problem Switcher Drawer state
  const [isProblemListOpen, setIsProblemListOpen] = useState(false);
  const [allProblems, setAllProblems] = useState<ProblemListItem[]>([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');
  const [problemDifficultyFilter, setProblemDifficultyFilter] = useState<'ALL' | Difficulty>('ALL');

  // Execution & Submissions state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'run' | 'submission' | 'console'>('run');
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionDetail | null>(null);
  const [lastSubmittedCode, setLastSubmittedCode] = useState<string | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Collapsible & Resizable Console Panel state
  // Initially closed as requested ("initially it should close when I run or submit it should automatically open")
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(240);
  const [isDragging, setIsDragging] = useState(false);

  // Solution tab state
  const [solutionLang, setSolutionLang] = useState<string>('python');

  // Synchronous references
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const codeRef = useRef<string>('');
  const saveVersionRef = useRef<number>(0);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const runSeqRef = useRef<number>(0);
  const submitSeqRef = useRef<number>(0);

  // Synchronous flush of pending draft changes to in-memory draft store
  const flushSave = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    const current = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    if (current === undefined || current === null) return;
    const v = ++saveVersionRef.current;
    const ok = saveLocalDraft(user?.id, slug, selectedLang, current, v);
    if (ok) {
      setSaveStatus('saved');
    } else {
      setSaveStatus('error');
    }
  }, [user?.id, slug, selectedLang]);

  // Load problem details & restore saved draft
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    dsaService
      .getProblemBySlug(slug)
      .then((data) => {
        if (!mounted) return;
        setProblem(data);

        const langs = Object.keys(data.boilerplate || {}) as SupportedLanguage[];
        const defaultLang = langs.includes('python')
          ? 'python'
          : langs.includes('typescript')
            ? 'typescript'
            : langs[0] || 'typescript';

        setSelectedLang(defaultLang);

        // Check if there is an existing saved draft for this user + problem + language
        const savedDraft = loadSavedDraft(user?.id, slug, defaultLang);
        const initialCode =
          savedDraft !== null
            ? savedDraft
            : data.boilerplate?.[defaultLang] || '// Write your solution here\n';

        codeRef.current = initialCode;
        setUserCode(initialCode);
        setSaveStatus('saved');

        // Initialize solution language default
        const availableSols = data.solutions || [];
        if (availableSols.length > 0) {
          const matchLang = availableSols.find((s) => s.language === defaultLang);
          setSolutionLang(matchLang ? matchLang.language : availableSols[0]!.language);
        } else {
          setSolutionLang(defaultLang);
        }
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        const msg = err instanceof Error ? err.message : 'Problem not found';
        setError(msg);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [slug, user?.id]);

  // Fetch all problems list for quick problem switcher drawer
  useEffect(() => {
    let mounted = true;
    setLoadingProblems(true);
    dsaService
      .getProblems({ limit: 100 })
      .then((res) => {
        if (mounted && res?.items) {
          setAllProblems(res.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadingProblems(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Flush before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushSave]);

  // Console drag resize handler
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const onMouseMove = (moveEvent: MouseEvent) => {
      // Dragging up increases height; dragging down decreases height
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeight + deltaY, 120), 500);
      setConsoleHeight(newHeight);
      if (!isConsoleOpen) {
        setIsConsoleOpen(true);
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Monaco editor change handler
  const handleEditorChange = (val: string | undefined) => {
    const code = val ?? '';
    codeRef.current = code;
    setUserCode(code);
    saveVersionRef.current += 1;
    setSaveStatus('unsaved');

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    const versionToSave = saveVersionRef.current;
    autosaveTimerRef.current = setTimeout(() => {
      setSaveStatus('saving');
      const ok = saveLocalDraft(user?.id, slug, selectedLang, codeRef.current, versionToSave);
      if (ok && saveVersionRef.current === versionToSave) {
        setSaveStatus('saved');
      } else if (!ok) {
        setSaveStatus('error');
      }
    }, 600);
  };

  // Monaco mount handler
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    // Auto-save on blur
    editor.onDidBlurEditorText(() => {
      flushSave();
    });
  };

  // Language change handler with automatic draft persistence per language
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    if (newLang === selectedLang) return;

    // 1. Flush pending changes for the current language
    flushSave();

    setSelectedLang(newLang);

    // 2. Check for saved draft for the new language
    const savedDraft = loadSavedDraft(user?.id, slug, newLang);
    const newCode =
      savedDraft !== null
        ? savedDraft
        : problem?.boilerplate?.[newLang] || '// Write your solution here\n';

    codeRef.current = newCode;
    setUserCode(newCode);
    setSaveStatus('saved');

    // 3. Update editor text synchronously without unmounting Monaco
    if (editorRef.current && editorRef.current.getValue() !== newCode) {
      editorRef.current.setValue(newCode);
    }

    // 4. Update solution tab language if a solution exists in the selected language
    if (problem?.solutions && problem.solutions.some((s) => s.language === newLang)) {
      setSolutionLang(newLang);
    }
  };

  const handleCopy = () => {
    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    const starter = problem?.boilerplate?.[selectedLang] || '// Write your solution here\n';
    removeSavedDraft(user?.id, slug, selectedLang);
    codeRef.current = starter;
    setUserCode(starter);
    if (editorRef.current) {
      editorRef.current.setValue(starter);
    }
    setSaveStatus('saved');
  };

  const toggleHint = (idx: number) => {
    setExpandedHints((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  // Run code against sample test cases (automatically opens console)
  const handleRunCode = async () => {
    if (!isAuthenticated) {
      setIsConsoleOpen(true);
      setActiveTab('console');
      setExecutionError('You must be signed in to run or submit code. Please log in to continue.');
      return;
    }

    // Read the exact latest code synchronously from Monaco editor at click time
    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    if (!currentCode || !currentCode.trim()) {
      setIsConsoleOpen(true);
      setActiveTab('console');
      setExecutionError('Cannot execute empty code. Please write your solution before running.');
      return;
    }

    // Flush autosave in parallel without blocking execution
    flushSave();

    // Automatically expand the console drawer & clear previous run info
    setIsConsoleOpen(true);
    setActiveTab('run');
    setRunResult(null);
    setExecutionError(null);

    const seq = ++runSeqRef.current;
    setIsRunning(true);
    setSelectedCaseIndex(0);

    try {
      const res = await submissionsService.runCode({
        problemSlug: slug,
        language: selectedLang,
        code: currentCode, // Exact immutable source code snapshot
      });

      // Discard stale out-of-order execution responses
      if (runSeqRef.current !== seq) {
        return;
      }

      setRunResult(res);

      // Check if execution had any compiler or runtime error
      const hasError = Boolean(
        res.compileError ||
        res.stderr ||
        res.verdict === 'COMPILATION_ERROR' ||
        res.verdict === 'RUNTIME_ERROR' ||
        res.verdict === 'INTERNAL_ERROR'
      );

      setIsConsoleOpen(true);
      if (hasError) {
        // If error on run, open console tab
        setActiveTab('console');
      } else {
        // If simple test cases worked, open test cases tab
        setActiveTab('run');
      }
    } catch (err: unknown) {
      if (runSeqRef.current === seq) {
        const msg = err instanceof Error ? err.message : 'Execution failed';
        setExecutionError(msg);
        setIsConsoleOpen(true);
        setActiveTab('console');
      }
    } finally {
      if (runSeqRef.current === seq) {
        setIsRunning(false);
      }
    }
  };

  // Submit code for full 10-testcase evaluation (automatically opens console)
  const handleSubmitCode = async () => {
    if (!isAuthenticated) {
      setIsConsoleOpen(true);
      setActiveTab('console');
      setExecutionError('You must be signed in to submit code. Please log in to continue.');
      return;
    }

    // Read exact latest code synchronously
    const currentCode = editorRef.current ? editorRef.current.getValue() : codeRef.current;
    if (!currentCode || !currentCode.trim()) {
      setIsConsoleOpen(true);
      setActiveTab('console');
      setExecutionError('Cannot submit empty code. Please write your solution before submitting.');
      return;
    }

    flushSave();

    // Automatically expand the console drawer & clear previous submission info
    setIsConsoleOpen(true);
    setActiveTab('submission');
    setSubmissionResult(null);
    setExecutionError(null);

    const seq = ++submitSeqRef.current;
    setIsSubmitting(true);

    try {
      const res = await submissionsService.submitCode({
        problemSlug: slug,
        language: selectedLang,
        code: currentCode, // Exact immutable source code snapshot
      });

      if (submitSeqRef.current !== seq) {
        return;
      }

      setSubmissionResult(res);
      setLastSubmittedCode(currentCode);

      // Check if submission had any compiler or runtime error
      const hasError = Boolean(
        res.compileError ||
        res.stderr ||
        res.verdict === 'COMPILATION_ERROR' ||
        res.verdict === 'RUNTIME_ERROR' ||
        res.verdict === 'INTERNAL_ERROR'
      );

      setIsConsoleOpen(true);
      if (hasError) {
        // When click on submit if any error open console
        setActiveTab('console');
      } else {
        // When there is no error open submission tab
        setActiveTab('submission');
      }
    } catch (err: unknown) {
      if (submitSeqRef.current === seq) {
        const msg = err instanceof Error ? err.message : 'Submission failed';
        setExecutionError(msg);
        setIsConsoleOpen(true);
        setActiveTab('console');
      }
    } finally {
      if (submitSeqRef.current === seq) {
        setIsSubmitting(false);
      }
    }
  };

  // Reference solution lookup
  const solutions = problem?.solutions || [];
  const currentSolution =
    solutions.find((s) => s.language === solutionLang) || solutions[0] || null;

  const handleCopySolution = () => {
    if (!currentSolution) return;
    navigator.clipboard.writeText(currentSolution.code);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  const isCodeModifiedSinceSubmission =
    lastSubmittedCode !== null && (editorRef.current?.getValue() ?? codeRef.current) !== lastSubmittedCode;

  // Filtered problems for Problem List drawer
  const filteredProblems = allProblems.filter((p) => {
    const matchesSearch =
      problemSearch.trim() === '' ||
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.topics.some((t) => t.name.toLowerCase().includes(problemSearch.toLowerCase()));

    const matchesDiff =
      problemDifficultyFilter === 'ALL' || p.difficulty === problemDifficultyFilter;

    return matchesSearch && matchesDiff;
  });

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-slate-900 overflow-hidden'
          : 'w-full h-screen max-h-screen flex flex-col min-h-0 overflow-hidden bg-[#f8fafc]'
      }
    >
      {/* Top navigation bar with quick problem switcher */}
      <div className="bg-white border-b border-slate-200 px-4 h-12 flex items-center justify-between shrink-0 shadow-2xs relative z-40">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <Link
            href="/dashboard/dsa/problems"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/80 shadow-2xs"
            title="Back to Problems Catalog"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Problem List</span>
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          {/* Quick Problem List Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsProblemListOpen(!isProblemListOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 shadow-2xs"
              title="Browse & search other problems without leaving this tab"
            >
              <ListFilter className="w-3.5 h-3.5 text-emerald-600" />
              <span>Switch Problem</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  isProblemListOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Quick Problem Switcher Popover / Drawer */}
            {isProblemListOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/20"
                  onClick={() => setIsProblemListOpen(false)}
                />
                <div className="absolute left-0 top-10 z-50 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[480px] animate-in fade-in zoom-in-95 duration-100">
                  {/* Header & Search */}
                  <div className="p-3 border-b border-slate-100 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Quick Problem Switcher
                      </span>
                      <button
                        onClick={() => setIsProblemListOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search problems or topics..."
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        autoFocus
                        className="w-full bg-white border border-slate-200 text-slate-800 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-2xs font-sans"
                      />
                    </div>

                    {/* Difficulty Chips */}
                    <div className="flex items-center gap-1">
                      {(['ALL', 'EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setProblemDifficultyFilter(diff)}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
                            problemDifficultyFilter === diff
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Problems Scrollable List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1">
                    {loadingProblems ? (
                      <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>Loading problems...</span>
                      </div>
                    ) : filteredProblems.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No problems match your search.
                      </div>
                    ) : (
                      filteredProblems.map((p) => {
                        const isCurrent = p.slug === slug;
                        return (
                          <Link
                            key={p.id}
                            href={`/dashboard/dsa/problems/${p.slug}`}
                            onClick={() => setIsProblemListOpen(false)}
                            className={`p-2.5 rounded-lg flex items-center justify-between transition-colors ${
                              isCurrent
                                ? 'bg-emerald-50 text-emerald-900 font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="space-y-0.5 max-w-[240px]">
                              <div className="text-xs truncate font-medium flex items-center gap-1.5">
                                {isCurrent && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                                )}
                                <span>{p.title}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                <span>{p.primaryTopic?.name || 'General'}</span>
                                <span>· {p.acceptanceRate.toFixed(0)}% acc</span>
                              </div>
                            </div>

                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                                DIFF_BADGE[p.difficulty]
                              }`}
                            >
                              {p.difficulty}
                            </span>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-slate-900 font-bold text-xs truncate max-w-[320px]">
              {problem?.title || slug}
            </span>
            {problem && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  DIFF_BADGE[problem.difficulty]
                }`}
              >
                {problem.difficulty}
              </span>
            )}
          </div>
        </div>

        {problem && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden md:inline">
              Acceptance: <span className="font-semibold text-slate-700">{problem.acceptanceRate.toFixed(1)}%</span>
            </span>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit fullscreen' : 'Expand full screen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Main content body */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Loading problem statement...</span>
        </div>
      ) : error || !problem ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <h2 className="text-lg font-bold text-slate-800">Problem Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md">
            {error || `We couldn't locate a published problem with the slug "${slug}".`}
          </p>
          <Link
            href="/dashboard/dsa/problems"
            className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
          >
            Return to Problem Catalog
          </Link>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column: Description & Official Reference Solution Tabs */}
          <div className="lg:col-span-6 border-r border-slate-200/80 bg-white flex flex-col min-h-0 overflow-hidden">
            {/* Top Left Pane Tabs: [ Description | Solution ] */}
            <div className="border-b border-slate-200 px-4 h-11 flex items-center justify-between shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
                <button
                  onClick={() => setLeftTab('description')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    leftTab === 'description'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Description</span>
                </button>

                <button
                  onClick={() => setLeftTab('solution')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    leftTab === 'solution'
                      ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Solution</span>
                  {solutions.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-full font-bold">
                      {solutions.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Left Pane Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {leftTab === 'description' ? (
                <>
                  <div className="space-y-2">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                      {problem.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {problem.topics.map((t) => (
                        <span
                          key={t.slug}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            t.isPrimary
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Statement</span>
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                      {problem.description}
                    </div>
                  </div>

                  {/* Examples */}
                  {problem.examples && problem.examples.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Examples</span>
                      </div>
                      <div className="space-y-3">
                        {problem.examples.map((ex, idx) => (
                          <div
                            key={ex.id || idx}
                            className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden text-xs"
                          >
                            <div className="px-3.5 py-1.5 bg-slate-100/70 border-b border-slate-200/80 font-bold text-slate-700 text-xs">
                              Example {idx + 1}
                            </div>
                            <div className="p-3.5 space-y-2 font-mono">
                              <div>
                                <span className="text-slate-500 font-sans font-medium text-[11px] block mb-0.5">Input:</span>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 select-all font-mono">
                                  {ex.input}
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-500 font-sans font-medium text-[11px] block mb-0.5">Output:</span>
                                <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-emerald-700 font-semibold select-all font-mono">
                                  {ex.output}
                                </div>
                              </div>
                              {ex.explanation && (
                                <div className="pt-1">
                                  <span className="text-slate-500 font-sans font-medium text-[11px] block mb-0.5">Explanation:</span>
                                  <div className="font-sans text-slate-600 text-xs leading-relaxed bg-white/60 p-2.5 rounded-lg border border-slate-200/60">
                                    {ex.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {problem.constraints && problem.constraints.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Constraints
                      </div>
                      <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5">
                        <ul className="space-y-1.5 text-xs text-slate-700 font-mono">
                          {problem.constraints.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-emerald-600 font-bold select-none">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Hints */}
                  {problem.hints && problem.hints.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>Hints ({problem.hints.length})</span>
                      </div>
                      <div className="space-y-2">
                        {problem.hints.map((hint, idx) => {
                          const isExpanded = expandedHints.includes(idx);
                          return (
                            <div
                              key={idx}
                              className="border border-slate-200 rounded-lg text-xs overflow-hidden"
                            >
                              <button
                                onClick={() => toggleHint(idx)}
                                className="w-full text-left px-3.5 py-2.5 bg-slate-50/80 hover:bg-slate-100 flex items-center justify-between font-medium text-slate-700 transition-colors"
                              >
                                <span>Hint {idx + 1}</span>
                                <ChevronRight
                                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>
                              {isExpanded && (
                                <div className="p-3.5 bg-white text-slate-600 border-t border-slate-200 leading-relaxed">
                                  {hint}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Left Tab: Solution Section */
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {currentSolution?.title || 'Official Reference Solution'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Verified canonical approach with complexity bounds and complete implementation.
                    </p>
                  </div>

                  {solutions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 bg-slate-50 rounded-xl border border-slate-200">
                      <Code2 className="w-8 h-8 text-slate-400" />
                      <div className="text-sm font-semibold text-slate-700">
                        No Official Solution Published Yet
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        An official reference solution has not been published for this problem yet.
                        Try exploring the hints or writing your own optimal implementation!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Language Switcher & Copy Solution Button */}
                      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-600">Language:</span>
                          <select
                            value={solutionLang}
                            onChange={(e) => setSolutionLang(e.target.value)}
                            className="bg-white border border-slate-300 text-xs text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold shadow-2xs"
                          >
                            {solutions.map((s) => (
                              <option key={s.language} value={s.language}>
                                {s.language.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={handleCopySolution}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          {copiedSolution ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 text-xs">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copy Solution</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Complexity Badges */}
                      {(currentSolution?.timeComplexity || currentSolution?.spaceComplexity) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentSolution?.timeComplexity && (
                            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3">
                              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                                Time Complexity
                              </span>
                              <div className="text-xs font-mono font-medium text-emerald-950 mt-1">
                                {currentSolution.timeComplexity}
                              </div>
                            </div>
                          )}
                          {currentSolution?.spaceComplexity && (
                            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3">
                              <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
                                Space Complexity
                              </span>
                              <div className="text-xs font-mono font-medium text-blue-950 mt-1">
                                {currentSolution.spaceComplexity}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Approach Explanation */}
                      {currentSolution?.explanation && (
                        <div className="space-y-2">
                          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Approach & Intuition
                          </div>
                          <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-4">
                            {currentSolution.explanation}
                          </div>
                        </div>
                      )}

                      {/* Read-Only Solution Code Viewer */}
                      {currentSolution?.code && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-bold uppercase tracking-wider">
                              Implementation ({currentSolution.language})
                            </span>
                            <span className="text-[11px] text-slate-400 italic">
                              Reference only — separate from your editable draft
                            </span>
                          </div>
                          <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-slate-100 whitespace-pre-wrap overflow-x-auto leading-relaxed shadow-sm">
                            {currentSolution.code}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Code Editor & Execution Console (50%) */}
          <div className="lg:col-span-6 h-full flex flex-col bg-slate-900 text-slate-100 overflow-hidden min-h-0">
            {/* Editor Toolbar */}
            <div className="bg-slate-950 border-b border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 h-9">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Language:
                  </span>
                  <select
                    value={selectedLang}
                    onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    {Object.keys(problem.boilerplate || {}).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtle Autosave Status Badge */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                  {saveStatus === 'saving' && (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                      <span>Saving...</span>
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Saved</span>
                    </span>
                  )}
                  {saveStatus === 'unsaved' && (
                    <span className="text-[10px] text-amber-400/90 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Unsaved</span>
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <button
                      onClick={flushSave}
                      className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 underline"
                      title="Draft could not be saved. Click to retry."
                    >
                      <AlertCircle className="w-3 h-3" />
                      <span>Save failed (Retry)</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetCode}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                  title="Reset to starter boilerplate"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[10px]">Reset</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                  title="Copy code"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Code Editor (Maximized when console is closed!) */}
            <div className="flex-1 min-h-[140px] overflow-hidden bg-[#1e1e1e]">
              <MonacoEditor
                height="100%"
                language={MONACO_LANG_MAP[selectedLang] || 'typescript'}
                theme="vs-dark"
                value={userCode}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  tabSize: 4,
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 },
                }}
              />
            </div>

            {/* Draggable & Collapsible Execution Console */}
            <div
              className={`shrink-0 border-t border-zinc-800 bg-[#0e0e11] flex flex-col min-h-0 relative ${
                isConsoleOpen ? '' : 'h-8'
              }`}
              style={isConsoleOpen ? { height: `${consoleHeight}px` } : undefined}
            >
              {/* Drag Handle Top Border */}
              <div
                onMouseDown={handleMouseDown}
                className="h-1.5 w-full bg-zinc-800 hover:bg-emerald-500/80 active:bg-emerald-500 cursor-row-resize transition-colors flex items-center justify-center shrink-0 group select-none z-10"
                title="Drag to resize console height"
              >
                <div className="w-10 h-0.5 bg-zinc-600 group-hover:bg-white rounded-full" />
              </div>

              {/* Console Header Tabs & Collapse/Expand Toggle */}
              <div className="border-b border-zinc-800/80 px-4 h-7.5 flex items-center justify-between text-xs bg-[#121216] shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setActiveTab('run');
                      setIsConsoleOpen(true);
                    }}
                    className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                      activeTab === 'run'
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Test Result
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('submission');
                      setIsConsoleOpen(true);
                    }}
                    className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                      activeTab === 'submission'
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Submission
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('console');
                      setIsConsoleOpen(true);
                    }}
                    className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      activeTab === 'console'
                        ? 'bg-zinc-800 text-white font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>Console</span>
                    {(runResult?.stderr ||
                      submissionResult?.stderr ||
                      runResult?.compileError ||
                      submissionResult?.compileError) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {(runResult || submissionResult) && isConsoleOpen && (
                    <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                      {(runResult?.runtimeMs || submissionResult?.runtimeMs) && (
                        <span>Runtime: {runResult?.runtimeMs || submissionResult?.runtimeMs} ms</span>
                      )}
                      {(runResult?.memoryKb || submissionResult?.memoryKb) && (
                        <span>
                          · Memory:{' '}
                          {Math.round(
                            (runResult?.memoryKb || submissionResult?.memoryKb || 0) / 1024,
                          )}{' '}
                          MB
                        </span>
                      )}
                    </div>
                  )}

                  {/* Toggle Button to Collapse or Expand Console */}
                  <button
                    onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors flex items-center gap-1"
                    title={isConsoleOpen ? 'Collapse console' : 'Expand console'}
                  >
                    <span className="text-[10px] text-zinc-500 hidden sm:inline">
                      {isConsoleOpen ? 'Collapse' : 'Expand'}
                    </span>
                    {isConsoleOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Console Body (Visible only when isConsoleOpen is true) */}
              {isConsoleOpen && (
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-zinc-300 min-h-0">
                  {/* Clean Error Notification */}
                  {executionError && (
                    <div className="mb-3 px-3.5 py-2.5 bg-rose-950/40 border border-rose-900/50 rounded-lg text-rose-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>
                          {executionError.includes('token')
                            ? 'Your session has expired. Please log in again to continue.'
                            : executionError}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Test Result Tab */}
                  {activeTab === 'run' && (
                    <div>
                      {isRunning ? (
                        <div className="space-y-4 font-sans animate-pulse py-1">
                          <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <span>Running code against sample test cases...</span>
                          </div>

                          {/* Skeletons for Test Case Tabs */}
                          <div className="flex gap-2">
                            <div className="h-7 w-20 bg-zinc-800 rounded-lg" />
                            <div className="h-7 w-20 bg-zinc-800 rounded-lg" />
                            <div className="h-7 w-20 bg-zinc-800 rounded-lg" />
                          </div>

                          {/* Skeletons for Case Details */}
                          <div className="space-y-3 pt-1">
                            <div>
                              <div className="h-3 w-12 bg-zinc-800 rounded mb-1.5" />
                              <div className="h-10 bg-zinc-800/80 rounded-lg border border-zinc-700/50" />
                            </div>
                            <div>
                              <div className="h-3 w-24 bg-zinc-800 rounded mb-1.5" />
                              <div className="h-10 bg-zinc-800/80 rounded-lg border border-zinc-700/50" />
                            </div>
                          </div>
                        </div>
                      ) : !runResult ? (
                        <div className="text-zinc-500 text-center py-8 text-xs font-sans">
                          You have not run the code yet. Click{' '}
                          <span className="text-zinc-300 font-medium">Run Code</span> below to test
                          against sample test cases.
                        </div>
                      ) : (
                        <div className="space-y-4 font-sans">
                          {/* Status Header */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`text-base font-bold ${
                                  runResult.verdict === 'ACCEPTED'
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                {runResult.verdict === 'ACCEPTED'
                                  ? 'Accepted'
                                  : VERDICT_STYLES[runResult.verdict]?.label || runResult.verdict}
                              </span>
                              <span className="text-xs text-zinc-500 font-normal">
                                · All {runResult.testCases?.length || 3} sample cases evaluated
                              </span>
                            </div>
                          </div>

                          {/* Minimalist LeetCode Style Case Tabs */}
                          {runResult.testCases && runResult.testCases.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-1.5 border-b border-zinc-800/80 pb-2">
                                {runResult.testCases.map((c: TestCaseRunResult, idx: number) => {
                                  const isPassed = c.isMatch;
                                  const isSelected = selectedCaseIndex === idx;
                                  return (
                                    <button
                                      key={idx}
                                      onClick={() => setSelectedCaseIndex(idx)}
                                      className={`px-3 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                        isSelected
                                          ? 'bg-zinc-800 text-white font-semibold'
                                          : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/50'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          isPassed ? 'bg-emerald-400' : 'bg-rose-400'
                                        }`}
                                      />
                                      <span>Case {idx + 1}</span>
                                    </button>
                                  );
                                })}
                              </div>

                              {/* Active Case Details */}
                              {(() => {
                                const activeCase =
                                  runResult.testCases?.[selectedCaseIndex] ||
                                  runResult.testCases?.[0];
                                if (!activeCase) return null;
                                return (
                                  <div className="space-y-3 font-mono text-xs">
                                    {/* Input */}
                                    <div>
                                      <div className="text-[11px] text-zinc-500 font-sans mb-1 font-medium">
                                        Input:
                                      </div>
                                      <pre className="bg-[#18181b] border border-zinc-800/80 text-zinc-200 px-3 py-2 rounded text-xs whitespace-pre-wrap">
                                        {activeCase.input}
                                      </pre>
                                    </div>

                                    {/* Output vs Expected Output */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <div>
                                        <div className="text-[11px] text-zinc-500 font-sans mb-1 font-medium">
                                          Your Output:
                                        </div>
                                        <pre
                                          className={`px-3 py-2 rounded text-xs whitespace-pre-wrap border ${
                                            activeCase.isMatch
                                              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                                              : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                                          }`}
                                        >
                                          {activeCase.userOutput || '(empty output)'}
                                        </pre>
                                      </div>
                                      <div>
                                        <div className="text-[11px] text-zinc-500 font-sans mb-1 font-medium">
                                          Expected Output:
                                        </div>
                                        <pre className="bg-[#18181b] border border-zinc-800/80 text-zinc-200 px-3 py-2 rounded text-xs whitespace-pre-wrap">
                                          {activeCase.expectedOutput}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission Tab */}
                  {activeTab === 'submission' && (
                    <div>
                      {isSubmitting ? (
                        <div className="space-y-4 font-sans animate-pulse py-1">
                          <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            <span>Submitting solution & evaluating all test cases...</span>
                          </div>

                          {/* Verdict Header Skeleton */}
                          <div className="h-6 w-36 bg-zinc-800 rounded-lg" />

                          {/* Metric Cards Skeleton */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="h-16 bg-zinc-800/70 border border-zinc-700/40 rounded-xl" />
                            <div className="h-16 bg-zinc-800/70 border border-zinc-700/40 rounded-xl" />
                          </div>

                          {/* Progress summary skeleton */}
                          <div className="h-8 bg-zinc-800/60 border border-zinc-700/40 rounded-lg" />
                        </div>
                      ) : !submissionResult ? (
                        <div className="text-zinc-500 text-center py-8 text-xs font-sans">
                          No submission evaluated yet. Click{' '}
                          <span className="text-emerald-400 font-medium">Submit</span> below to run all
                          10 hidden and public test cases.
                        </div>
                      ) : (
                        <div className="space-y-4 font-sans">
                          {/* Minimalist LeetCode Style Verdict Header */}
                          <div>
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`text-base font-bold ${
                                  submissionResult.verdict === 'ACCEPTED'
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                                }`}
                              >
                                {submissionResult.verdict === 'ACCEPTED'
                                  ? 'Accepted'
                                  : VERDICT_STYLES[submissionResult.verdict]?.label ||
                                    submissionResult.verdict}
                              </span>
                              <span className="text-xs text-zinc-500 font-normal">
                                · {submissionResult.testsPassed} / {submissionResult.totalTests}{' '}
                                testcases passed
                              </span>
                            </div>

                            {/* Snapshot warning if code was modified since submission */}
                            {isCodeModifiedSinceSubmission && (
                              <div className="mt-1 text-[11px] text-amber-400/90 flex items-center gap-1 font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span>Showing result for submitted snapshot. Current editor has unsaved/modified changes.</span>
                              </div>
                            )}
                          </div>

                          {/* Clean Stats Cards */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#18181b] border border-zinc-800/80 rounded px-3 py-2">
                              <div className="text-[11px] text-zinc-500 mb-0.5">Runtime</div>
                              <div className="text-sm font-semibold text-zinc-200 font-mono">
                                {submissionResult.runtimeMs
                                  ? `${submissionResult.runtimeMs} ms`
                                  : 'N/A'}
                              </div>
                            </div>
                            <div className="bg-[#18181b] border border-zinc-800/80 rounded px-3 py-2">
                              <div className="text-[11px] text-zinc-500 mb-0.5">Memory</div>
                              <div className="text-sm font-semibold text-zinc-200 font-mono">
                                {submissionResult.memoryKb
                                  ? `${Math.round(submissionResult.memoryKb / 1024)} MB`
                                  : 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Runtime Error in Submission */}
                          {submissionResult.stderr && (
                            <div className="p-3 bg-rose-950/30 border border-rose-900/40 rounded-lg text-rose-300 font-mono text-[11px] space-y-1">
                              <div className="font-semibold text-rose-400 font-sans text-xs">
                                Runtime Error (stderr):
                              </div>
                              <pre className="whitespace-pre-wrap overflow-x-auto max-h-32">
                                {submissionResult.stderr}
                              </pre>
                            </div>
                          )}

                          {/* Compiler Error in Submission */}
                          {submissionResult.compileError && (
                            <div className="p-3 bg-amber-950/30 border border-amber-900/40 rounded-lg text-amber-300 font-mono text-[11px] space-y-1">
                              <div className="font-semibold text-amber-400 font-sans text-xs">
                                Compiler Error:
                              </div>
                              <pre className="whitespace-pre-wrap overflow-x-auto max-h-32">
                                {submissionResult.compileError}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Console Tab */}
                  {activeTab === 'console' && (
                    <div className="space-y-2.5 font-mono text-xs">
                      {(isRunning || isSubmitting) ? (
                        <div className="flex items-center gap-2 text-zinc-400 text-xs py-4 animate-pulse font-sans">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                          <span>{isRunning ? 'Running code...' : 'Evaluating submission...'} Waiting for output stream...</span>
                        </div>
                      ) : !runResult && !submissionResult && !executionError ? (
                        <div className="text-zinc-500 text-center py-8 text-xs font-sans">
                          No logs yet. Click <span className="text-zinc-300 font-medium">Run Code</span>{' '}
                          or <span className="text-emerald-400 font-medium">Submit</span> to view
                          standard output, standard error, and compiler diagnostics.
                        </div>
                      ) : null}

                      {executionError && !runResult?.stderr && !submissionResult?.stderr && !runResult?.compileError && !submissionResult?.compileError && (
                        <div className="space-y-1">
                          <div className="text-rose-400 text-[11px] font-sans font-semibold">Diagnostic Error:</div>
                          <pre className="bg-[#18181b] border border-rose-900/40 text-rose-300 p-2.5 rounded text-[11px] whitespace-pre-wrap overflow-x-auto max-h-40">
                            {executionError}
                          </pre>
                        </div>
                      )}

                      {(runResult?.stderr || submissionResult?.stderr) && (
                        <div className="space-y-1">
                          <div className="text-rose-400 text-[11px]">stderr:</div>
                          <pre className="bg-[#18181b] border border-rose-900/40 text-rose-300 p-2.5 rounded text-[11px] whitespace-pre-wrap overflow-x-auto max-h-40">
                            {runResult?.stderr || submissionResult?.stderr}
                          </pre>
                        </div>
                      )}

                      {(runResult?.compileError || submissionResult?.compileError) && (
                        <div className="space-y-1">
                          <div className="text-amber-400 text-[11px]">compiler output:</div>
                          <pre className="bg-[#18181b] border border-amber-900/40 text-amber-300 p-2.5 rounded text-[11px] whitespace-pre-wrap overflow-x-auto max-h-40">
                            {runResult?.compileError || submissionResult?.compileError}
                          </pre>
                        </div>
                      )}

                      {(runResult?.stdout || submissionResult?.stdout) && (
                        <div className="space-y-1">
                          <div className="text-zinc-400 text-[11px]">stdout:</div>
                          <pre className="bg-[#18181b] border border-zinc-800 text-zinc-200 p-2.5 rounded text-[11px] whitespace-pre-wrap overflow-x-auto max-h-40">
                            {runResult?.stdout || submissionResult?.stdout}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Execution Footer Bar (Permanently pinned at bottom) */}
            <div className="bg-[#121216] border-t border-zinc-800/80 px-4 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs">
                {isRunning ? (
                  <span className="text-blue-400 font-medium flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Running sample test cases...</span>
                  </span>
                ) : isSubmitting ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Evaluating all test cases...</span>
                  </span>
                ) : saveStatus === 'saving' ? (
                  <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                    <span>Saving draft...</span>
                  </span>
                ) : saveStatus === 'unsaved' ? (
                  <span className="text-amber-400/90 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Unsaved draft</span>
                  </span>
                ) : isCodeModifiedSinceSubmission ? (
                  <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Draft saved (Code modified since last submit)</span>
                  </span>
                ) : (
                  <span className="text-zinc-500 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Ready</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-zinc-700/80 transition-colors"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-zinc-300" />
                      <span>Run Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
