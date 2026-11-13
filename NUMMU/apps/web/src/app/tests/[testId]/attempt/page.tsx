'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { testsService } from '@/services/tests.service';
import type { AttemptQuestion, UserQuestionAnswer } from '@/types/tests';
import {
  Clock,
  Bookmark,
  BookmarkCheck,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  AlertTriangle,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
  Terminal,
  Code2,
  Loader2,
  AlertCircle,
  ShieldAlert,
  ShieldCheck,
  EyeOff,
} from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import dynamic from 'next/dynamic';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-xs text-slate-400 bg-[#18181f]">
      Loading code editor environment...
    </div>
  ),
});

const MONACO_LANG_MAP: Record<string, string> = {
  Python: 'python',
  'C++': 'cpp',
  Java: 'java',
  JavaScript: 'javascript',
  TypeScript: 'typescript',
};

function normalizeLangKey(lang: string): string {
  const l = lang.toLowerCase();
  if (l.includes('python')) return 'python';
  if (l.includes('c++') || l === 'cpp') return 'cpp';
  if (l.includes('java') && !l.includes('script')) return 'java';
  if (l.includes('type')) return 'typescript';
  if (l.includes('java')) return 'javascript';
  return 'python';
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const AttemptTimerBadge = React.memo(function AttemptTimerBadge({
  initialSeconds,
  isPaused,
  onTimeExpired,
}: {
  initialSeconds: number;
  isPaused: boolean;
  onTimeExpired: () => void;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isPaused, onTimeExpired]);

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-xs font-bold shadow-2xs">
      <Clock className="w-3.5 h-3.5 text-amber-600" />
      <span className="hidden sm:inline text-amber-700 font-sans text-[11px] font-semibold">
        Time Left:
      </span>
      <span className="text-sm">{formatTime(seconds)}</span>
    </div>
  );
});

export default function TestAttemptInterfacePage() {
  const params = useParams();
  const router = useRouter();
  const rawTestId = params ? (params['testId'] as string) : 'weekly-dsa-12';
  const testId = rawTestId || 'weekly-dsa-12';

  // Loading & Test state from backend
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [testMeta, setTestMeta] = useState<any>(null);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);

  // Active question index
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentQuestion: AttemptQuestion | undefined = questions[currentIdx];

  // User responses state for all questions
  const [answers, setAnswers] = useState<Record<number, UserQuestionAnswer>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());

  // Active language & editor code
  const [language, setLanguage] = useState<string>('Python');
  const [code, setCode] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(13);
  const [isEditorFullscreen, setIsEditorFullscreen] = useState(false);

  // Collapsible panels state
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);
  const [isDescCollapsed, setIsDescCollapsed] = useState(false);

  // LeetCode draggable testcases drawer state
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [consoleHeight, setConsoleHeight] = useState(230);
  const [consoleTab, setConsoleTab] = useState<'testcase' | 'result'>('testcase');
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);

  // Dragging refs
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(230);

  // Run code & submission state
  const [runStatus, setRunStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [testResult, setTestResult] = useState<{
    status: 'passed' | 'failed';
    runtime: string;
    memory: string;
    output: string;
    expected: string;
    input: string;
  } | null>(null);

  // Server Authoritative Timer
  const [totalSecondsLeft, setTotalSecondsLeft] = useState<number>(90 * 60);
  const timeSpentOnCurrentRef = useRef<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Submit confirmation modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // ── Proctoring State (Fullscreen + Tab Switch Counter + Copy/Paste Guard) ──
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [requireFullscreen, setRequireFullscreen] = useState<boolean>(true);
  const [disableCopyPaste, setDisableCopyPaste] = useState<boolean>(true);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [maxTabSwitches, setMaxTabSwitches] = useState<number>(3);
  const [showTabWarningModal, setShowTabWarningModal] = useState<boolean>(false);
  const [autoTerminatedReason, setAutoTerminatedReason] = useState<string | null>(null);
  const lastViolationTsRef = useRef<number>(0);
  const hadEnteredFullscreenRef = useRef<boolean>(false);
  const tabSwitchCountRef = useRef<number>(0);
  tabSwitchCountRef.current = tabSwitchCount;

  // Left panel tab
  const [leftTab, setLeftTab] = useState<'Description' | 'Submissions' | 'Editorial'>('Description');

  // Autosave timer ref
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;

  // ── 1. Initialize or Resume Attempt from Backend ──
  useEffect(() => {
    let isMounted = true;
    async function initAttempt() {
      try {
        setLoading(true);
        setInitError(null);
        const data = await testsService.startOrResumeAttempt(testId);

        if (!isMounted) return;

        if (data.status === 'SUBMITTED' || data.status === 'EXPIRED') {
          router.replace(`/tests/${testId}/results`);
          return;
        }

        setTestMeta(data.test);
        setQuestions(data.questions);
        setTotalSecondsLeft(data.totalSecondsLeft ?? 5400);
        setTabSwitchCount(data.tabSwitchCount ?? 0);
        setMaxTabSwitches(data.test?.maxTabSwitches ?? 3);
        setRequireFullscreen(data.test?.requireFullscreen ?? true);
        setDisableCopyPaste(data.test?.disableCopyPaste ?? true);

        // Populate answers map
        const loadedAnswers: Record<number, UserQuestionAnswer> = {};
        const loadedMarked = new Set<number>();

        if (data.answers) {
          Object.entries(data.answers).forEach(([key, ans]: [string, any]) => {
            const num = parseInt(key, 10);
            loadedAnswers[num] = {
              questionNumber: num,
              code: ans.code,
              language: ans.language || 'Python',
              status: ans.isSubmitted ? 'answered' : ans.code ? 'answered' : 'unanswered',
              timeSpentSeconds: ans.timeSpentSeconds || 0,
              isMarkedForReview: ans.isMarkedForReview,
              isSubmitted: ans.isSubmitted,
              verdict: ans.verdict,
              testsPassed: ans.testsPassed,
              totalTests: ans.totalTests,
              marksAwarded: ans.marksAwarded,
            };

            if (ans.isMarkedForReview) {
              loadedMarked.add(num);
            }
          });
        }

        setAnswers(loadedAnswers);
        setMarkedQuestions(loadedMarked);

        const restoredIdx = Math.min(Math.max(0, data.currentQuestion ?? 0), Math.max(0, data.questions.length - 1));
        setCurrentIdx(restoredIdx);
      } catch (err: any) {
        if (isMounted) {
          if (err?.statusCode === 401 || err?.status === 401) {
            router.replace(`/login?callbackUrl=${encodeURIComponent(`/tests/${testId}/attempt`)}`);
            return;
          }
          setInitError(err?.response?.data?.message || err?.message || 'Failed to start or resume assessment.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAttempt();
    return () => {
      isMounted = false;
    };
  }, [testId, router]);

  // ── 2. Sync Boilerplate or Saved Code When Question or Language Changes ──
  useEffect(() => {
    if (!currentQuestion) return;

    const existingCode = answersRef.current[currentQuestion.number]?.code;
    if (existingCode !== undefined && existingCode !== '') {
      setCode(existingCode);
    } else {
      const langKey = normalizeLangKey(language);
      const bp = currentQuestion.boilerplate as Record<string, string> | undefined;
      const template = bp?.[langKey] || bp?.['python'] || Object.values(bp || {})[0] || '';
      setCode(template);
    }

    timeSpentOnCurrentRef.current = 0;
    setRunStatus('idle');
    setTestResult(null);
    setActiveCaseIdx(0);
  }, [currentIdx, language, currentQuestion]);

  // ── 3. Debounced Autosave to Backend ──
  const triggerAutosave = useCallback(
    (newCode: string, lang: string, isMarked: boolean) => {
      if (!currentQuestion || isSubmitting) return;

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(async () => {
        try {
          await testsService.autosaveAnswer(testId, {
            problemSlug: currentQuestion.slug,
            code: newCode,
            language: normalizeLangKey(lang),
            isMarkedForReview: isMarked,
            currentQuestionIndex: currentIdx,
            timeSpentSeconds: timeSpentOnCurrentRef.current,
          });
        } catch {
          // silently handle autosave failures (retry next turn)
        }
      }, 1200);
    },
    [currentQuestion, currentIdx, testId, isSubmitting],
  );

  const handleCodeChange = (newVal: string | undefined) => {
    const updated = newVal || '';
    setCode(updated);

    if (currentQuestion) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.number]: {
          ...(prev[currentQuestion.number] ?? {
            questionNumber: currentQuestion.number,
            timeSpentSeconds: 0,
          }),
          code: updated,
          language,
          status: 'answered',
        },
      }));
      triggerAutosave(updated, language, markedQuestions.has(currentQuestion.number));
    }
  };

  // ── 4. Silent Background Timer for Active Question Time (No React Re-renders) ──
  useEffect(() => {
    if (loading || initError || isSubmitting) return;

    const interval = setInterval(() => {
      timeSpentOnCurrentRef.current += 1;
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, initError, isSubmitting]);

  const exitFullscreenSafely = useCallback(async () => {
    if (typeof document !== 'undefined') {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else if ((document as any).webkitFullscreenElement) {
          await (document as any).webkitExitFullscreen?.();
        } else if ((document as any).mozFullScreenElement) {
          await (document as any).mozCancelFullScreen?.();
        } else if ((document as any).msFullscreenElement) {
          await (document as any).msExitFullscreen?.();
        }
      } catch {
        // Ignore if already exited or user cancelled
      }
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      hadEnteredFullscreenRef.current = true;
    } catch {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
  }, []);

  const handleAutoFinalize = useCallback(
    async (reason?: string) => {
      try {
        setIsSubmitting(true);
        if (reason) setAutoTerminatedReason(reason);
        await exitFullscreenSafely();
        await testsService.finalizeAttempt(
          testId,
          reason ? { autoSubmitted: true, terminationReason: reason } : undefined,
        );
        router.replace(`/tests/${testId}/results`);
      } catch {
        await exitFullscreenSafely();
        router.replace(`/tests/${testId}/results`);
      }
    },
    [testId, router, exitFullscreenSafely],
  );

  // ── 4b. Proctoring: Fullscreen Tracking + Tab Switch Counter (> maxTabSwitches auto-submits) ──
  useEffect(() => {
    if (loading || initError || isSubmitting) return;

    // Attempt automatic fullscreen entry on mount
    if (typeof document !== 'undefined') {
      setIsFullscreen(Boolean(document.fullscreenElement));
      if (document.fullscreenElement) {
        hadEnteredFullscreenRef.current = true;
      } else {
        document.documentElement.requestFullscreen?.().then(() => {
          setIsFullscreen(true);
          hadEnteredFullscreenRef.current = true;
        }).catch(() => {
          // Browser requires explicit user gesture; Fullscreen Gate modal will prompt the user
        });
      }
    }

    const handleFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (active) {
        hadEnteredFullscreenRef.current = true;
      } else if (hadEnteredFullscreenRef.current && !isSubmitting) {
        testsService.reportViolation(testId, 'FULLSCREEN_EXIT').catch(() => {});
      }
    };

    const recordTabSwitch = async () => {
      const now = Date.now();
      // Debounce within 1s so visibilitychange + window blur don't double-count a single switch
      if (now - lastViolationTsRef.current < 1000) return;
      lastViolationTsRef.current = now;

      const nextCount = tabSwitchCountRef.current + 1;
      tabSwitchCountRef.current = nextCount;
      setTabSwitchCount(nextCount);

      // Flush latest code before potential auto-submission
      if (currentQuestion) {
        testsService
          .autosaveAnswer(testId, {
            problemSlug: currentQuestion.slug,
            code,
            language: normalizeLangKey(language),
            isMarkedForReview: markedQuestions.has(currentQuestion.number),
            currentQuestionIndex: currentIdx,
            timeSpentSeconds: timeSpentOnCurrentRef.current,
          })
          .catch(() => {});
      }

      if (nextCount > maxTabSwitches) {
        const reason = `Auto-submitted: Exceeded maximum allowed tab switches (${maxTabSwitches})`;
        await handleAutoFinalize(reason);
        return;
      }

      setShowTabWarningModal(true);

      try {
        const serverRes = await testsService.reportViolation(testId, 'TAB_SWITCH');
        setTabSwitchCount(serverRes.tabSwitchCount);
        tabSwitchCountRef.current = serverRes.tabSwitchCount;
        if (serverRes.autoSubmitted || serverRes.tabSwitchCount > serverRes.maxTabSwitches) {
          const reason =
            serverRes.terminationReason ||
            `Auto-submitted: Exceeded maximum allowed tab switches (${serverRes.maxTabSwitches})`;
          exitFullscreenSafely();
          router.replace(`/tests/${testId}/results`);
        }
      } catch {
        // Local threshold check above still enforces the > maxTabSwitches termination
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        void recordTabSwitch();
      }
    };

    const handleWindowBlur = () => {
      // Strictly detect when window loses focus (switched tab, alt-tabbed, switched apps)
      void recordTabSwitch();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    // ── Copy/Paste Proctoring Prevention (when enabled by Admin) ──
    const preventCopyPaste = (e: ClipboardEvent) => {
      if (disableCopyPaste) {
        e.preventDefault();
      }
    };

    const preventCut = (e: ClipboardEvent) => {
      if (disableCopyPaste) {
        e.preventDefault();
      }
    };

    const preventContextMenu = (e: MouseEvent) => {
      if (disableCopyPaste) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!disableCopyPaste) return;
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Cmd+C, Cmd+V, Cmd+X
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'C', 'V', 'X'].includes(e.key)) {
        e.preventDefault();
      }
    };

    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('cut', preventCut);
    document.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('cut', preventCut);
      document.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    loading,
    initError,
    isSubmitting,
    testId,
    maxTabSwitches,
    disableCopyPaste,
    currentQuestion,
    code,
    language,
    markedQuestions,
    currentIdx,
    handleAutoFinalize,
    exitFullscreenSafely,
    router,
  ]);

  // ── 5. Drag Divider Handlers for Testcases Drawer ──
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = consoleHeight;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startYRef.current - moveEvent.clientY;
      const newHeight = Math.min(Math.max(startHeightRef.current + deltaY, 44), 520);
      setConsoleHeight(newHeight);
      setIsConsoleOpen(newHeight > 50);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const toggleConsoleOpen = () => {
    if (isConsoleOpen) {
      setIsConsoleOpen(false);
    } else {
      setIsConsoleOpen(true);
      if (consoleHeight < 120) setConsoleHeight(230);
    }
  };

  const isMarked = currentQuestion ? markedQuestions.has(currentQuestion.number) : false;

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    const next = new Set(markedQuestions);
    const willBeMarked = !next.has(currentQuestion.number);

    if (willBeMarked) {
      next.add(currentQuestion.number);
    } else {
      next.delete(currentQuestion.number);
    }
    setMarkedQuestions(next);
    triggerAutosave(code, language, willBeMarked);
  };

  // ── 6. Live Run Code via Judge0 ──
  const handleRunCode = async () => {
    if (!currentQuestion) return;

    setRunStatus('running');
    setIsConsoleOpen(true);
    if (consoleHeight < 150) setConsoleHeight(230);
    setConsoleTab('result');

    try {
      const res = await testsService.runCode(testId, {
        problemSlug: currentQuestion.slug,
        language: normalizeLangKey(language),
        code,
      });

      const isPass = res.verdict === 'ACCEPTED';
      setRunStatus(isPass ? 'success' : 'failed');

      const sampleCase = currentQuestion.testCases?.[activeCaseIdx] || {
        input: 'Sample Cases',
        expectedOutput: '',
      };

      setTestResult({
        status: isPass ? 'passed' : 'failed',
        runtime: `${res.runtimeMs || 0} ms`,
        memory: `${((res.memoryKb || 0) / 1024).toFixed(1)} MB`,
        input: sampleCase.input,
        expected: sampleCase.expectedOutput || res.verdict,
        output: res.compileError || res.stderr || res.stdout || `Verdict: ${res.verdict}`,
      });
    } catch (err: any) {
      setRunStatus('failed');
      setTestResult({
        status: 'failed',
        runtime: '0 ms',
        memory: '0 MB',
        input: 'Execution Failed',
        expected: 'ACCEPTED',
        output: err?.response?.data?.message || err?.message || 'Error executing code on runner.',
      });
    }
  };

  // ── 7. Submit Single Question Evaluation against All Test Cases ──
  const handleSubmitCode = async () => {
    if (!currentQuestion) return;

    setRunStatus('running');
    setIsConsoleOpen(true);
    if (consoleHeight < 150) setConsoleHeight(230);
    setConsoleTab('result');

    try {
      const result = await testsService.submitQuestion(testId, {
        problemSlug: currentQuestion.slug,
        language: normalizeLangKey(language),
        code,
      });

      const isPass = result.verdict === 'ACCEPTED';
      setRunStatus(isPass ? 'success' : 'failed');

      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.number]: {
          questionNumber: currentQuestion.number,
          code,
          language,
          status: 'answered',
          timeSpentSeconds: timeSpentOnCurrentRef.current,
          isSubmitted: true,
          verdict: result.verdict,
          testsPassed: result.testsPassed,
          totalTests: result.totalTests,
          marksAwarded: result.marksAwarded,
        },
      }));

      setTestResult({
        status: isPass ? 'passed' : 'failed',
        runtime: `${result.runtimeMs || 0} ms`,
        memory: `${((result.memoryKb || 0) / 1024).toFixed(1)} MB`,
        input: `Full Test Suite (${result.testsPassed}/${result.totalTests} Passed)`,
        expected: `${result.maxMarks} Marks`,
        output: isPass
          ? `Accepted! Full question score awarded: ${result.marksAwarded}/${result.maxMarks} marks.`
          : `Verdict: ${result.verdict} (${result.marksAwarded}/${result.maxMarks} marks). ${result.compileError || result.stderr || ''}`,
      });
    } catch (err: any) {
      setRunStatus('failed');
      setTestResult({
        status: 'failed',
        runtime: '0 ms',
        memory: '0 MB',
        input: 'Submission Error',
        expected: '',
        output: err?.response?.data?.message || err?.message || 'Submission failed.',
      });
    }
  };

  // ── 8. Finalize Entire Test Attempt ──
  const handleFinalizeTest = async () => {
    try {
      setIsSubmitting(true);
      setShowSubmitModal(false);
      await exitFullscreenSafely();
      await testsService.finalizeAttempt(testId);
      router.push(`/tests/${testId}/results`);
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err?.response?.data?.message || 'Failed to submit test. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#141417] text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-200">Initializing Assessment Workspace</h2>
        <p className="text-xs text-slate-400 mt-1">Restoring live attempt state, questions, and test runner...</p>
      </div>
    );
  }

  if (initError || !currentQuestion) {
    return (
      <div className="h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Unable to Start Assessment</h2>
        <p className="text-sm text-slate-600 max-w-md mb-6">{initError || 'Test questions could not be loaded.'}</p>
        <Link
          href={`/tests/${testId}`}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition"
        >
          Back to Instructions
        </Link>
      </div>
    );
  }

  const answeredCount = Object.values(answers).filter((a) => a.status === 'answered').length;
  const markedCount = markedQuestions.size;
  const unansweredCount = questions.length - answeredCount;

  const currentCases = currentQuestion.testCases && currentQuestion.testCases.length > 0
    ? currentQuestion.testCases
    : [
        { input: 'Sample Case', expectedOutput: 'Output' },
      ];

  const selectedCase = currentCases[activeCaseIdx] ?? currentCases[0]!;

  return (
    <div className="h-screen max-h-screen bg-[#f8fafc] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans overflow-hidden">
      {/* ── Top Bar (Test Header + Timer + Submit) ── */}
      <header className="h-14 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/tests" className="shrink-0">
            <Logo size="sm" />
          </Link>
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 truncate">
                {testMeta?.title || 'Weekly DSA Test'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Assessment
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden md:block">
              {questions.length} Questions • {testMeta?.durationMinutes || 90} mins • {testMeta?.passPercentage || 60}% pass mark
            </div>
          </div>
        </div>

        {/* Center: Question Navigator Dropdown */}
        <div className="relative">
          <div className="flex items-center gap-1 bg-slate-100/90 border border-slate-200/90 rounded-xl p-1 shadow-2xs">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Previous Question"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsNavCollapsed((prev) => !prev)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-white text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <span className="font-bold text-slate-900">
                Question {currentQuestion.number}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500 font-normal">
                {questions.length}
              </span>

              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  currentQuestion.difficulty === 'EASY' || currentQuestion.difficulty === 'Easy'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : currentQuestion.difficulty === 'HARD' || currentQuestion.difficulty === 'Hard'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {currentQuestion.difficulty}
              </span>

              {isNavCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <button
              disabled={currentIdx === questions.length - 1}
              onClick={() => setCurrentIdx((p) => Math.min(questions.length - 1, p + 1))}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Next Question"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Question Palette Dropdown */}
          {!isNavCollapsed && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsNavCollapsed(true)}
              />

              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[460px] sm:w-[520px] z-50 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="font-bold text-slate-800">
                    Questions Navigator
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600" />
                      <span>{answeredCount} Answered</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full ring-2 ring-emerald-600 bg-white" />
                      <span>Current</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>{markedCount} Marked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-200" />
                      <span>{unansweredCount} Unanswered</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto no-scrollbar p-1">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentIdx;
                    const isAns = answers[q.number]?.status === 'answered' || answers[q.number]?.isSubmitted;
                    const isMkd = markedQuestions.has(q.number);

                    let bgStyle = 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900';
                    if (isAns) bgStyle = 'bg-emerald-600 text-white font-bold border-emerald-600';
                    if (isMkd) bgStyle = 'bg-amber-400 text-slate-950 font-bold border-amber-400';
                    if (isCurrent) bgStyle += ' ring-2 ring-emerald-500 ring-offset-1 font-black';

                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setCurrentIdx(idx);
                          setIsNavCollapsed(true);
                        }}
                        className={`h-9 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer shadow-2xs ${bgStyle}`}
                        title={`Question ${q.number}: ${q.title} (${q.difficulty})`}
                      >
                        Q{q.number} ({q.marks}m)
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Proctoring Status, Timer & Submit Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tab Switch Counter Pill */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
              tabSwitchCount === 0
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : tabSwitchCount < maxTabSwitches
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-800 animate-pulse'
            }`}
            title={`Maximum ${maxTabSwitches} tab switches allowed. Exceeding ${maxTabSwitches} switches automatically ends and submits the test.`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>
              Tab Switches: {tabSwitchCount}/{maxTabSwitches}
            </span>
          </div>

          {/* Fullscreen Status Toggle Button */}
          <button
            type="button"
            onClick={enterFullscreen}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isFullscreen
                ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
            }`}
            title={isFullscreen ? 'Full-Screen Proctoring Active' : 'Click to enter Full-Screen Mode'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">{isFullscreen ? 'Full Screen' : 'Enter Full Screen'}</span>
          </button>

          <AttemptTimerBadge
            initialSeconds={totalSecondsLeft}
            isPaused={loading || Boolean(initError) || isSubmitting}
            onTimeExpired={() => handleAutoFinalize('Auto-submitted: Assessment timer expired')}
          />

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-4 py-1.5 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail Navigation */}
        <aside className="w-11 bg-white border-r border-slate-200/90 flex flex-col items-center py-4 gap-4 shrink-0 hidden sm:flex">
          <button
            className="p-2 rounded-xl bg-emerald-50 text-emerald-800"
            title="Questions Navigator"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Submissions Log"
            onClick={() => setLeftTab('Submissions')}
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Leaderboard (Unlocks after test)"
          >
            <Trophy className="w-4 h-4" />
          </button>
        </aside>

        {/* ── 2-Column Split Interface ── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* ── Left Column: Problem Statement ── */}
          <div
            className={`flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 bg-white overflow-hidden transition-all duration-200 ${
              isDescCollapsed ? 'w-full lg:w-12 shrink-0' : 'w-full lg:w-1/2'
            }`}
          >
            {isDescCollapsed ? (
              <div className="h-full flex flex-col items-center py-4 justify-between bg-slate-50 border-r border-slate-200 select-none">
                <button
                  onClick={() => setIsDescCollapsed(false)}
                  className="p-2 text-slate-600 hover:bg-white rounded-xl shadow-2xs border border-slate-200 hover:text-emerald-700 cursor-pointer"
                  title="Expand Problem Description"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest -rotate-90 select-none py-12 whitespace-nowrap">
                  Problem Description
                </span>
                <div />
              </div>
            ) : (
              <>
                {/* Tabs Header */}
                <div className="h-10 border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between shrink-0 bg-slate-50/70">
                  <div className="flex items-center gap-1">
                    {(['Description', 'Submissions', 'Editorial'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setLeftTab(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          leftTab === t
                            ? 'bg-white text-emerald-800 border border-slate-200 shadow-2xs'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Mark for review toggle */}
                    <button
                      onClick={toggleMarkForReview}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        isMarked
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {isMarked ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                          <span className="text-[11px] font-bold">Marked</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-[11px]">Mark</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setIsDescCollapsed(true)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 hidden lg:block cursor-pointer"
                      title="Collapse Description"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
                  {leftTab === 'Description' && (
                    <>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                            {currentQuestion.number}. {currentQuestion.title}
                          </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              currentQuestion.difficulty === 'EASY' || currentQuestion.difficulty === 'Easy'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : currentQuestion.difficulty === 'HARD' || currentQuestion.difficulty === 'Hard'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {currentQuestion.difficulty}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {currentQuestion.marks} Marks
                          </span>
                          {currentQuestion.topics?.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {currentQuestion.description}
                      </div>

                      {/* Examples */}
                      {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                        <div className="space-y-3 pt-2">
                          {currentQuestion.examples.map((ex, i) => (
                            <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs font-mono">
                              <div className="font-bold text-slate-800 font-sans">
                                Example {i + 1}:
                              </div>
                              <div>
                                <span className="text-slate-400 select-none">Input: </span>
                                <span className="text-slate-800">{ex.input}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 select-none">Output: </span>
                                <span className="text-slate-800">{ex.output}</span>
                              </div>
                              {ex.explanation && (
                                <div className="text-slate-500 font-sans text-[11px] pt-1 border-t border-slate-200/60">
                                  <span className="font-semibold">Explanation: </span>
                                  {ex.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Constraints */}
                      {currentQuestion.constraints && currentQuestion.constraints.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <div className="text-xs font-bold text-slate-800">Constraints:</div>
                          <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 font-mono">
                            {currentQuestion.constraints.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {leftTab === 'Submissions' && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      {answers[currentQuestion.number]?.isSubmitted ? (
                        <div className="space-y-2">
                          <div className="text-emerald-700 font-bold">
                            Question Answer Submitted ({answers[currentQuestion.number]?.verdict || 'EVALUATED'})
                          </div>
                          <div>
                            Marks Awarded: {answers[currentQuestion.number]?.marksAwarded ?? 0} / {currentQuestion.marks}
                          </div>
                        </div>
                      ) : (
                        'No code submitted yet for this question.'
                      )}
                    </div>
                  )}

                  {leftTab === 'Editorial' && (
                    <div className="py-8 text-center text-xs text-slate-400">
                      🔒 Editorials unlock once the test submission deadline passes.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* ── Right Column: Dark Theme Monaco Workspace + Testcases ── */}
          <div className="flex-1 flex flex-col bg-[#141417] text-white overflow-hidden relative">
            {/* Code Editor Header Toolbar */}
            <div className="h-10 bg-[#1c1c24] border-b border-[#292934] px-3 sm:px-4 flex items-center justify-between shrink-0 select-none">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#242430] border border-[#363646] hover:border-[#48485c] transition-colors">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="Python" className="bg-[#1c1c24] text-slate-200">Python 3</option>
                    <option value="C++" className="bg-[#1c1c24] text-slate-200">C++ (g++ 17)</option>
                    <option value="Java" className="bg-[#1c1c24] text-slate-200">Java (OpenJDK 17)</option>
                    <option value="JavaScript" className="bg-[#1c1c24] text-slate-200">JavaScript (Node.js)</option>
                    <option value="TypeScript" className="bg-[#1c1c24] text-slate-200">TypeScript</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex items-center bg-[#242430] border border-[#363646] rounded-md text-[10px] font-mono">
                  <button
                    onClick={() => setFontSize((s) => Math.max(11, s - 1))}
                    className="px-2 py-0.5 hover:text-white transition-colors cursor-pointer"
                    title="Decrease Font Size"
                  >
                    A-
                  </button>
                  <span className="px-1.5 text-slate-300 border-x border-[#363646]">{fontSize}px</span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(18, s + 1))}
                    className="px-2 py-0.5 hover:text-white transition-colors cursor-pointer"
                    title="Increase Font Size"
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={() => {
                    const bp = currentQuestion.boilerplate as Record<string, string> | undefined;
                    const langKey = normalizeLangKey(language);
                    setCode(bp?.[langKey] || bp?.['python'] || Object.values(bp || {})[0] || '');
                  }}
                  className="p-1.5 hover:text-white rounded hover:bg-[#2b2b38] transition-colors cursor-pointer"
                  title="Reset code to default template"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsEditorFullscreen((prev) => !prev)}
                  className="p-1.5 hover:text-white rounded hover:bg-[#2b2b38] transition-colors cursor-pointer hidden sm:block"
                  title={isEditorFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
                >
                  {isEditorFullscreen ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Editor Canvas */}
            <div className="flex-1 relative overflow-hidden bg-[#18181f]">
              <MonacoEditor
                height="100%"
                language={MONACO_LANG_MAP[language] || 'python'}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  fontSize,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
                  fontWeight: '400',
                  fontLigatures: true,
                  lineNumbers: 'on',
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: 'line',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  smoothScrolling: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: 'on',
                  padding: { top: 12, bottom: 12 },
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true, indentation: true },
                }}
                loading={
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Loading code editor...
                  </div>
                }
              />
            </div>

            {/* LeetCode-Style Draggable Resizable Testcases Drawer */}
            <div
              style={{ height: isConsoleOpen ? `${consoleHeight}px` : '40px' }}
              className="bg-[#1c1c24] border-t border-[#292934] flex flex-col shrink-0 transition-height duration-75 relative z-10"
            >
              <div
                onMouseDown={handleDragStart}
                className="h-2 w-full bg-[#20202a] hover:bg-emerald-500/70 active:bg-emerald-500 cursor-row-resize flex items-center justify-center group transition-colors select-none"
                title="Drag to resize test cases console"
              >
                <div className="w-12 h-1 rounded-full bg-[#414154] group-hover:bg-white/80 transition-colors" />
              </div>

              <div className="h-9 px-3 sm:px-4 bg-[#1a1a22] border-b border-[#292934] flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleConsoleOpen}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isConsoleOpen
                        ? 'bg-[#292938] text-white border-[#3e3e52]'
                        : 'bg-[#20202a] text-slate-300 hover:bg-[#282836] border-[#303040]'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Console</span>
                    {isConsoleOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  <span className="w-px h-4 bg-[#2f2f3d] mx-1.5" />

                  <button
                    onClick={() => {
                      setConsoleTab('testcase');
                      setIsConsoleOpen(true);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      consoleTab === 'testcase' && isConsoleOpen
                        ? 'bg-[#292936] text-emerald-400 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Testcase</span>
                  </button>

                  <button
                    onClick={() => {
                      setConsoleTab('result');
                      setIsConsoleOpen(true);
                    }}
                    className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      consoleTab === 'result' && isConsoleOpen
                        ? 'bg-[#292936] text-emerald-400 shadow-2xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Test Result</span>
                    {testResult && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleConsoleOpen}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#282834] transition-colors cursor-pointer"
                  >
                    {isConsoleOpen ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Console Body */}
              {isConsoleOpen && (
                <div className="flex-1 overflow-y-auto p-3.5 font-mono text-xs bg-[#18181f]">
                  {consoleTab === 'testcase' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {currentCases.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveCaseIdx(i)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              activeCaseIdx === i
                                ? 'bg-[#2f2f3d] text-white border border-[#444458]'
                                : 'bg-[#202029] text-slate-400 hover:text-slate-200 border border-transparent'
                            }`}
                          >
                            Case {i + 1}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 pt-1">
                        <div>
                          <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Input
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#1e1e27] border border-[#2d2d3c] text-emerald-300 font-mono text-xs">
                            {selectedCase.input}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
                            Expected Output
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#1e1e27] border border-[#2d2d3c] text-slate-300 font-mono text-xs">
                            {selectedCase.expectedOutput}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {consoleTab === 'result' && (
                    <div className="space-y-3">
                      {runStatus === 'running' && (
                        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs font-sans">Compiling & executing code on Judge0...</span>
                        </div>
                      )}

                      {runStatus !== 'running' && testResult && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#2d2d3c]">
                            <div className="flex items-center gap-2">
                              {testResult.status === 'passed' ? (
                                <span className="inline-flex items-center gap-1.5 text-sm font-black text-emerald-400 font-sans">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                  Accepted
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-sm font-black text-rose-400 font-sans">
                                  <XCircle className="w-4 h-4 text-rose-400" />
                                  Evaluation Failed
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                              <span>Runtime: <strong className="text-slate-200">{testResult.runtime}</strong></span>
                              <span>Memory: <strong className="text-slate-200">{testResult.memory}</strong></span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Execution Context
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#1e1e27] border border-[#2d2d3c] text-slate-300">
                                {testResult.input}
                              </div>
                            </div>

                            <div>
                              <div className="text-[11px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Output / Runner Verdict
                              </div>
                              <div className="p-2.5 rounded-xl bg-[#1e1e27] border border-slate-700 font-mono text-slate-200 whitespace-pre-wrap">
                                {testResult.output}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {runStatus !== 'running' && !testResult && (
                        <div className="py-6 text-center text-slate-400 font-sans">
                          Click <strong className="text-slate-200">&ldquo;Run Code&rdquo;</strong> to compile against sample cases, or <strong className="text-slate-200">&ldquo;Submit&rdquo;</strong> to evaluate against the full test suite.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Fixed Controls Bar */}
            <div className="h-12 bg-[#17171e] border-t border-[#292936] px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-20">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#20202a] hover:bg-[#2a2a38] text-xs font-medium disabled:opacity-30 disabled:pointer-events-none text-slate-300 border border-[#2d2d3a] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  <button
                    disabled={currentIdx === questions.length - 1}
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#20202a] hover:bg-[#2a2a38] text-xs font-medium disabled:opacity-30 disabled:pointer-events-none text-slate-300 border border-[#2d2d3a] transition-colors cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunCode}
                  disabled={runStatus === 'running'}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-xl bg-[#262634] hover:bg-[#323244] border border-[#3c3c4f] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Run code against sample test cases via Judge0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Run Code</span>
                </button>

                <button
                  onClick={handleSubmitCode}
                  disabled={runStatus === 'running'}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer active:scale-95 disabled:opacity-50"
                  title="Submit code for full test suite scoring"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Submit Test Confirmation Modal ── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ready to Submit Assessment?
                </h3>
                <p className="text-xs text-slate-500">
                  Review your question completion before final submission.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="p-2 bg-white rounded-xl border border-slate-100">
                <div className="text-lg font-black text-emerald-700">{answeredCount}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Answered</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100">
                <div className="text-lg font-black text-amber-600">{markedCount}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Marked</div>
              </div>
              <div className="p-2 bg-white rounded-xl border border-slate-100">
                <div className="text-lg font-black text-slate-700">{unansweredCount}</div>
                <div className="text-[10px] text-slate-400 font-semibold">Unanswered</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Once finalized, your solution will be scored authoritatively across all questions and your result will be saved permanently.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isSubmitting}
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Back to Test
              </button>

              <button
                disabled={isSubmitting}
                onClick={handleFinalizeTest}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Finalizing...</span>
                  </>
                ) : (
                  <span>Confirm & Submit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Switch Violation Warning Modal ── */}
      {showTabWarningModal && !isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tab Switch Detected ({tabSwitchCount} / {maxTabSwitches})
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Proctoring Violation Warning
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 text-xs text-slate-700 leading-relaxed space-y-1.5">
              <p>
                Leaving the test tab or switching windows is strictly monitored.
              </p>
              <p className="font-bold text-rose-800">
                {tabSwitchCount >= maxTabSwitches
                  ? 'FINAL WARNING: One more tab switch will immediately end and auto-submit your test!'
                  : `You have ${maxTabSwitches - tabSwitchCount} warning(s) remaining. Exceeding ${maxTabSwitches} tab switches will automatically end and submit your test.`}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowTabWarningModal(false);
                  void enterFullscreen();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                I Understand — Return to Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Fullscreen Proctoring Gate Overlay ── */}
      {requireFullscreen && !isFullscreen && !showTabWarningModal && !showSubmitModal && !isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
              <Maximize2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-900">
                Full-Screen Mode Required
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This assessment must be taken in full-screen proctored mode. Switching tabs more than{' '}
                <strong>{maxTabSwitches} times</strong> will automatically end and submit your test.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 rounded-2xl py-2.5 px-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Full-Screen Lock
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <EyeOff className="w-4 h-4 text-amber-600" />
                Tab Switches: {tabSwitchCount}/{maxTabSwitches}
              </span>
            </div>

            <button
              type="button"
              onClick={enterFullscreen}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0b5c39] hover:bg-[#094d2f] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Enter Full-Screen to Continue Test</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Auto-Termination Overlay ── */}
      {autoTerminatedReason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-300 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-rose-600 animate-spin mx-auto" />
            <h3 className="text-base font-extrabold text-slate-900">
              Auto-Submitting Assessment
            </h3>
            <p className="text-xs text-rose-700 font-semibold">{autoTerminatedReason}</p>
          </div>
        </div>
      )}
    </div>
  );
}
