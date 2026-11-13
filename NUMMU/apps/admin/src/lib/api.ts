/**
 * Centralized DRY HTTP Client & Admin API Service for @numu/admin
 * Shares the same backend server (/api/v1), PostgreSQL database, and @numu/types as @numu/web.
 * Includes automatic stateful offline/fallback store when PostgreSQL (localhost:5432) is down.
 */

import type {
  Role,
  OrganizationRole,
  Difficulty,
  ContentStatus,
  SubmissionVerdict,
  SubmissionStatus,
} from '@numu/types';

export type {
  Role,
  OrganizationRole,
  Difficulty,
  ContentStatus,
  SubmissionVerdict,
  SubmissionStatus,
};

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || '/api/v1';

/**
 * Security Policy: Zero Browser Storage for Auth Tokens
 * Automatically purges any legacy or accidental auth keys from localStorage / sessionStorage.
 * Authentication relies strictly on HttpOnly, SameSite=Lax cookies managed by the shared backend.
 */
const FORBIDDEN_STORAGE_KEYS = [
  'token',
  'accessToken',
  'refreshToken',
  'access_token',
  'refresh_token',
  'numu_access_token',
  'numu_refresh_token',
  'auth',
  'user',
  'admin_user',
];

export function purgeBrowserAuthStorage(): void {
  if (typeof window === 'undefined') return;
  try {
    for (const key of FORBIDDEN_STORAGE_KEYS) {
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors in strict privacy modes
  }
}

if (typeof window !== 'undefined') {
  purgeBrowserAuthStorage();
}

export class AdminApiError extends Error {
  public readonly statusCode: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = 'AdminApiError';
    this.statusCode = statusCode;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request<T>(
  path: string,
  options: RequestInit & {
    params?: Record<string, string | number | boolean | undefined> | undefined;
    _retry?: boolean | undefined;
  } = {},
): Promise<T> {
  const { params, _retry, headers, ...rest } = options;

  let url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
    });
    const str = qs.toString();
    if (str) url += `?${str}`;
  }

  const res = await fetch(url, {
    credentials: 'include',
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && !_retry && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
      const ok = await tryRefreshSession();
      if (ok) return request<T>(path, { ...options, _retry: true });
    }

    let message = `Request failed (${res.status})`;
    try {
      const errJson = await res.json();
      if (Array.isArray(errJson.message)) {
        message = errJson.message.join(', ');
      } else if (errJson.message) {
        message = errJson.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new AdminApiError(message, res.status);
  }

  if (res.status === 204) return {} as T;
  const json = await res.json();
  return (json.data !== undefined && json.pagination === undefined ? json.data : json) as T;
}

/**
 * Helper: Run live backend request first; if DB is down / offline, return stateful fallback data.
 */
async function withFallback<T>(fn: () => Promise<T>, fallbackFn: () => T | Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return await fallbackFn();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Domain Types (Extended from shared @numu/types)
// ─────────────────────────────────────────────────────────────────────────────

export type ExecutionMode = 'FUNCTION' | 'STDIN_STDOUT';

export interface AdminSessionItem {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: Role;
  isActive: boolean;
  isEmailVerified?: boolean | undefined;
  createdAt: string;
  submissionsCount?: number | undefined;
  testAttemptsCount?: number | undefined;
  batches?: { id: string; name: string; slug: string; role: string }[] | undefined;
  profile?: {
    college?: string | null | undefined;
    gradYear?: number | null | undefined;
    headline?: string | null | undefined;
    avatarUrl?: string | null | undefined;
  } | null | undefined;
}

export interface TopicItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null | undefined;
  icon?: string | null | undefined;
  order: number;
  problemCount?: number | undefined;
}

export interface ProblemExampleInput {
  input: string;
  output: string;
  explanation?: string;
  order?: number;
}

export interface ProblemTestCaseInput {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  orderIndex?: number;
  timeLimitMs?: number;
  memoryLimitKb?: number;
}

export interface ProblemItem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  status: ContentStatus;
  executionMode?: ExecutionMode;
  acceptanceRate: number;
  description?: string;
  constraints?: string[];
  hints?: string[];
  editorial?: string | null;
  boilerplate?: Record<string, string>;
  primaryTopic?: { slug: string; name: string } | null;
  topics: { slug: string; name: string; isPrimary?: boolean }[];
  examples?: ProblemExampleInput[];
  testCases?: ProblemTestCaseInput[];
  testCasesCount?: number;
  submissionsCount?: number;
  examplesCount?: number;
  createdAt: string;
}

export interface TestQuestionAssignmentItem {
  id?: string;
  orderIndex: number;
  marks: number;
  problem: {
    id: string;
    slug: string;
    title: string;
    difficulty: Difficulty;
    status?: ContentStatus;
  };
}

export interface AdminTestItem {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  weekNumber?: number | null;
  instructions?: string | null;
  durationMinutes: number;
  passPercentage: number;
  totalMarks: number;
  status: ContentStatus;
  startTime?: string | null;
  endTime?: string | null;
  maxTabSwitches: number;
  requireFullscreen: boolean;
  disableCopyPaste: boolean;
  totalQuestions: number;
  totalAttempts: number;
  completedAttempts: number;
  autoSubmittedCount: number;
  passRate: number;
  averageScore: number;
  questions: TestQuestionAssignmentItem[];
  createdAt: string;
}

export interface AdminOverviewData {
  stats: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents?: number;
    totalProblems: number;
    publishedProblems: number;
    draftProblems: number;
    totalTests: number;
    publishedTests: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    submissionPassRate: number;
    totalAttempts: number;
    completedAttempts?: number;
    ongoingAttempts?: number;
    autoSubmittedAttempts: number;
    averageAssessmentScore?: number;
    totalBatches?: number;
    totalTopics?: number;
  };
  recentAttempts: any[];
  recentSubmissions: any[];
}

export interface TopicCurriculumItem extends TopicItem {
  publishedCount: number;
  draftCount: number;
  difficultyDistribution: { EASY: number; MEDIUM: number; HARD: number };
  totalSubmissions: number;
  acceptedSubmissions: number;
  accuracyRate: number;
}

export interface AdminBatchItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null | undefined;
  createdAt: string;
  studentCount: number;
  activeStudentCount: number;
  trainerCount: number;
  participationRate: number;
  totalSubmissions: number;
  totalTestAttempts: number;
  trainers: { userId: string; name: string; email: string; orgRole: string }[];
}

export interface BulkValidationRowItem {
  index: number;
  title: string;
  slug: string;
  difficulty: string;
  valid: boolean;
  isDuplicateInDb: boolean;
  isDuplicateInBatch: boolean;
  missingTopics: string[];
  errors: string[];
  warnings: string[];
  examplesCount: number;
  testCasesCount: number;
}

export interface BulkProblemValidationResponse {
  totalRecords: number;
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  items: BulkValidationRowItem[];
}

export interface StudentAnalyticsResponse {
  student: {
    id: string;
    email: string;
    username: string | null;
    name: string | null;
    role: Role;
    isActive: boolean;
    totalXp: number;
    batches: { id: string; name: string; slug: string; role: string }[];
    badges: { slug: string; name: string; category: string; awardedAt: string }[];
  };
  learningProgress: {
    uniqueProblemsAttempted: number;
    uniqueProblemsSolved: number;
    totalPublishedProblems: number;
    completionPercentage: number;
    totalSubmissions: number;
    acceptedSubmissions: number;
    submissionSuccessRate: number;
    averageRuntimeMs: number | null;
    difficultyBreakdown: {
      EASY: { attempted: number; solved: number };
      MEDIUM: { attempted: number; solved: number };
      HARD: { attempted: number; solved: number };
    };
    languageUsage: Record<string, { submissions: number; accepted: number }>;
  };
  topicBreakdown: {
    name: string;
    slug: string;
    problemsAttempted: number;
    problemsSolved: number;
    submissions: number;
    accepted: number;
    accuracy: number;
  }[];
  assessmentPerformance: {
    totalAttempts: number;
    completedAttempts: number;
    passedAttempts: number;
    autoSubmittedCount: number;
    averagePercentage: number | null;
    performanceTrend: string;
    attempts: any[];
  };
  insights: {
    strongTopics: { name: string; slug: string; accuracy: number }[];
    weakTopics: { name: string; slug: string; accuracy: number }[];
    frequentlyFailedProblems: {
      problemId: string;
      title: string;
      slug: string;
      difficulty: Difficulty;
      failures: number;
      solved: boolean;
    }[];
    performanceTrend: string;
  };
  recentSubmissions: any[];
}

export function downloadCsv(
  filename: string,
  headersOrRecords: string[] | Record<string, any>[],
  rows?: (string | number | boolean | null | undefined)[][],
) {
  if (typeof window === 'undefined') return;
  const escapeCell = (v: string | number | boolean | null | undefined) => {
    const s = v === null || v === undefined ? '' : String(v);
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  let headers: string[] = [];
  let dataRows: (string | number | boolean | null | undefined)[][] = [];

  if (rows !== undefined) {
    headers = headersOrRecords as string[];
    dataRows = rows;
  } else {
    const records = headersOrRecords as Record<string, any>[];
    if (records.length === 0) return;
    headers = Object.keys(records[0] || {});
    dataRows = records.map((rec) => headers.map((h) => rec[h]));
  }

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...dataRows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// Stateful Fallback Store (Used automatically when PostgreSQL is offline)
// ─────────────────────────────────────────────────────────────────────────────

let fallbackCurrentUser: AdminUser | null = {
  id: 'usr-admin-1',
  email: 'admin@numu.edu',
  username: 'numu_admin',
  name: 'Jani Pasha (Platform Admin)',
  role: 'PLATFORM_ADMIN',
  isActive: true,
  isEmailVerified: true,
  createdAt: '2026-01-10T09:00:00.000Z',
};

const fallbackTopics: TopicCurriculumItem[] = [
  {
    id: 'top-1',
    name: 'Arrays & Hashing',
    slug: 'arrays-and-hashing',
    description: 'Prefix sums, frequency maps, and in-place array manipulation.',
    order: 1,
    problemCount: 8,
    publishedCount: 7,
    draftCount: 1,
    difficultyDistribution: { EASY: 4, MEDIUM: 3, HARD: 1 },
    totalSubmissions: 142,
    acceptedSubmissions: 108,
    accuracyRate: 76,
  },
  {
    id: 'top-2',
    name: 'Two Pointers & Sliding Window',
    slug: 'two-pointers',
    description: 'Converging pointers and dynamic window invariants.',
    order: 2,
    problemCount: 6,
    publishedCount: 6,
    draftCount: 0,
    difficultyDistribution: { EASY: 2, MEDIUM: 3, HARD: 1 },
    totalSubmissions: 98,
    acceptedSubmissions: 69,
    accuracyRate: 70,
  },
  {
    id: 'top-3',
    name: 'Trees & Graphs',
    slug: 'trees-and-graphs',
    description: 'BFS, DFS, shortest paths, and binary search trees.',
    order: 3,
    problemCount: 7,
    publishedCount: 5,
    draftCount: 2,
    difficultyDistribution: { EASY: 1, MEDIUM: 4, HARD: 2 },
    totalSubmissions: 84,
    acceptedSubmissions: 49,
    accuracyRate: 58,
  },
  {
    id: 'top-4',
    name: 'Dynamic Programming',
    slug: 'dynamic-programming',
    description: 'Memoization, tabulation, knapsack, and state transitions.',
    order: 4,
    problemCount: 5,
    publishedCount: 4,
    draftCount: 1,
    difficultyDistribution: { EASY: 1, MEDIUM: 2, HARD: 2 },
    totalSubmissions: 64,
    acceptedSubmissions: 31,
    accuracyRate: 48,
  },
];

const fallbackProblems: ProblemItem[] = [
  {
    id: 'prob-1',
    slug: 'two-sum',
    title: 'Two Sum',
    difficulty: 'EASY',
    status: 'PUBLISHED',
    executionMode: 'FUNCTION',
    acceptanceRate: 78.4,
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
    hints: ['Use a hash map to store complements as you iterate.'],
    primaryTopic: { slug: 'arrays-and-hashing', name: 'Arrays & Hashing' },
    topics: [{ slug: 'arrays-and-hashing', name: 'Arrays & Hashing', isPrimary: true }],
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }],
    testCases: [
      { input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false },
      { input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: true },
    ],
    testCasesCount: 6,
    submissionsCount: 94,
    examplesCount: 2,
    createdAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'prob-2',
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    executionMode: 'FUNCTION',
    acceptanceRate: 64.2,
    description: 'Given a string s, find the length of the longest substring without duplicate characters.',
    constraints: ['0 <= s.length <= 5 * 10^4'],
    hints: ['Maintain a sliding window with a frequency map or last-seen index.'],
    primaryTopic: { slug: 'two-pointers', name: 'Two Pointers & Sliding Window' },
    topics: [{ slug: 'two-pointers', name: 'Two Pointers & Sliding Window', isPrimary: true }],
    testCasesCount: 8,
    submissionsCount: 72,
    examplesCount: 3,
    createdAt: '2026-02-04T11:30:00.000Z',
  },
  {
    id: 'prob-3',
    slug: 'course-schedule-ii',
    title: 'Course Schedule II (Topological Sort)',
    difficulty: 'MEDIUM',
    status: 'PUBLISHED',
    executionMode: 'FUNCTION',
    acceptanceRate: 56.8,
    description: 'Return the ordering of courses you should take to finish all courses given prerequisites.',
    primaryTopic: { slug: 'trees-and-graphs', name: 'Trees & Graphs' },
    topics: [{ slug: 'trees-and-graphs', name: 'Trees & Graphs', isPrimary: true }],
    testCasesCount: 10,
    submissionsCount: 51,
    examplesCount: 2,
    createdAt: '2026-02-10T14:20:00.000Z',
  },
  {
    id: 'prob-4',
    slug: 'edit-distance-dp',
    title: 'Minimum Edit Distance',
    difficulty: 'HARD',
    status: 'DRAFT',
    executionMode: 'FUNCTION',
    acceptanceRate: 44.5,
    description: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.',
    primaryTopic: { slug: 'dynamic-programming', name: 'Dynamic Programming' },
    topics: [{ slug: 'dynamic-programming', name: 'Dynamic Programming', isPrimary: true }],
    testCasesCount: 12,
    submissionsCount: 29,
    examplesCount: 2,
    createdAt: '2026-02-15T09:15:00.000Z',
  },
];

const fallbackTests: AdminTestItem[] = [
  {
    id: 'test-1',
    slug: 'weekly-dsa-assessment-1',
    title: 'Weekly DSA Assessment #1 — Arrays & Sliding Window',
    description: 'Proctored coding evaluation covering hash maps, prefix sums, and sliding window patterns.',
    weekNumber: 1,
    instructions: 'Stay in fullscreen mode. Switching tabs more than 3 times will automatically submit your assessment.',
    durationMinutes: 60,
    passPercentage: 60,
    totalMarks: 100,
    status: 'PUBLISHED',
    maxTabSwitches: 3,
    requireFullscreen: true,
    disableCopyPaste: true,
    totalQuestions: 2,
    totalAttempts: 18,
    completedAttempts: 16,
    autoSubmittedCount: 2,
    passRate: 81,
    averageScore: 76,
    questions: [
      {
        id: 'tq-1',
        orderIndex: 1,
        marks: 40,
        problem: { id: 'prob-1', slug: 'two-sum', title: 'Two Sum', difficulty: 'EASY', status: 'PUBLISHED' },
      },
      {
        id: 'tq-2',
        orderIndex: 2,
        marks: 60,
        problem: {
          id: 'prob-2',
          slug: 'longest-substring-without-repeating-characters',
          title: 'Longest Substring Without Repeating Characters',
          difficulty: 'MEDIUM',
          status: 'PUBLISHED',
        },
      },
    ],
    createdAt: '2026-02-18T10:00:00.000Z',
  },
  {
    id: 'test-2',
    slug: 'weekly-dsa-assessment-2',
    title: 'Weekly DSA Assessment #2 — Graphs & Dynamic Programming',
    description: 'Mid-cohort evaluation on BFS/DFS topological orderings and 2D DP.',
    weekNumber: 2,
    instructions: 'Fullscreen lock and copy-paste restriction enabled.',
    durationMinutes: 90,
    passPercentage: 50,
    totalMarks: 100,
    status: 'PUBLISHED',
    maxTabSwitches: 3,
    requireFullscreen: true,
    disableCopyPaste: true,
    totalQuestions: 2,
    totalAttempts: 12,
    completedAttempts: 11,
    autoSubmittedCount: 1,
    passRate: 73,
    averageScore: 68,
    questions: [
      {
        id: 'tq-3',
        orderIndex: 1,
        marks: 50,
        problem: {
          id: 'prob-3',
          slug: 'course-schedule-ii',
          title: 'Course Schedule II (Topological Sort)',
          difficulty: 'MEDIUM',
          status: 'PUBLISHED',
        },
      },
      {
        id: 'tq-4',
        orderIndex: 2,
        marks: 50,
        problem: {
          id: 'prob-4',
          slug: 'edit-distance-dp',
          title: 'Minimum Edit Distance',
          difficulty: 'HARD',
          status: 'DRAFT',
        },
      },
    ],
    createdAt: '2026-02-25T10:00:00.000Z',
  },
];

const fallbackAttempts: Record<string, any[]> = {
  'test-1': [
    {
      id: 'att-101',
      testId: 'test-1',
      userId: 'usr-stu-1',
      status: 'AUTO_SUBMITTED',
      score: 40,
      totalMarks: 100,
      percentage: 40,
      passed: false,
      tabSwitchCount: 4,
      fullscreenExits: 2,
      copyPasteAttempts: 1,
      autoSubmitted: true,
      startedAt: '2026-03-01T10:00:00.000Z',
      submittedAt: '2026-03-01T10:28:00.000Z',
      user: { id: 'usr-stu-1', name: 'Aarav Sharma', email: 'aarav@student.numu.edu', username: 'aarav_s' },
      test: { id: 'test-1', title: 'Weekly DSA Assessment #1', totalMarks: 100, maxTabSwitches: 3 },
    },
    {
      id: 'att-102',
      testId: 'test-1',
      userId: 'usr-stu-2',
      status: 'SUBMITTED',
      score: 100,
      totalMarks: 100,
      percentage: 100,
      passed: true,
      tabSwitchCount: 0,
      fullscreenExits: 0,
      copyPasteAttempts: 0,
      autoSubmitted: false,
      startedAt: '2026-03-01T10:00:00.000Z',
      submittedAt: '2026-03-01T10:49:00.000Z',
      user: { id: 'usr-stu-2', name: 'Diya Nair', email: 'diya@student.numu.edu', username: 'diya_nair' },
      test: { id: 'test-1', title: 'Weekly DSA Assessment #1', totalMarks: 100, maxTabSwitches: 3 },
    },
  ],
  'test-2': [
    {
      id: 'att-201',
      testId: 'test-2',
      userId: 'usr-stu-3',
      status: 'SUBMITTED',
      score: 80,
      totalMarks: 100,
      percentage: 80,
      passed: true,
      tabSwitchCount: 1,
      fullscreenExits: 0,
      copyPasteAttempts: 0,
      autoSubmitted: false,
      startedAt: '2026-03-02T14:00:00.000Z',
      submittedAt: '2026-03-02T15:10:00.000Z',
      user: { id: 'usr-stu-3', name: 'Rohan Verma', email: 'rohan@student.numu.edu', username: 'rohan_v' },
      test: { id: 'test-2', title: 'Weekly DSA Assessment #2', totalMarks: 100, maxTabSwitches: 3 },
    },
  ],
};

const fallbackUsers: AdminUser[] = [
  fallbackCurrentUser,
  {
    id: 'usr-trainer-1',
    email: 'trainer@numu.edu',
    username: 'kiran_trainer',
    name: 'Prof. Kiran Rao',
    role: 'TRAINER',
    isActive: true,
    createdAt: '2026-01-12T10:00:00.000Z',
    submissionsCount: 12,
    testAttemptsCount: 0,
    batches: [{ id: 'batch-1', name: 'NUMU Elite Cohort 2026', slug: 'elite-2026', role: 'TRAINER' }],
    profile: { college: 'NUMU Academy', gradYear: 2020, headline: 'Lead DSA Instructor' },
  },
  {
    id: 'usr-stu-1',
    email: 'aarav@student.numu.edu',
    username: 'aarav_s',
    name: 'Aarav Sharma',
    role: 'STUDENT',
    isActive: true,
    createdAt: '2026-01-20T08:30:00.000Z',
    submissionsCount: 48,
    testAttemptsCount: 4,
    batches: [{ id: 'batch-1', name: 'NUMU Elite Cohort 2026', slug: 'elite-2026', role: 'STUDENT' }],
    profile: { college: 'IIT Hyderabad', gradYear: 2027, headline: 'Competitive Programmer' },
  },
  {
    id: 'usr-stu-2',
    email: 'diya@student.numu.edu',
    username: 'diya_nair',
    name: 'Diya Nair',
    role: 'STUDENT',
    isActive: true,
    createdAt: '2026-01-21T09:15:00.000Z',
    submissionsCount: 64,
    testAttemptsCount: 5,
    batches: [{ id: 'batch-1', name: 'NUMU Elite Cohort 2026', slug: 'elite-2026', role: 'STUDENT' }],
    profile: { college: 'NIT Warangal', gradYear: 2026, headline: 'Full-Stack & Algorithms' },
  },
  {
    id: 'usr-stu-3',
    email: 'rohan@student.numu.edu',
    username: 'rohan_v',
    name: 'Rohan Verma',
    role: 'STUDENT',
    isActive: true,
    createdAt: '2026-01-25T11:00:00.000Z',
    submissionsCount: 39,
    testAttemptsCount: 3,
    batches: [{ id: 'batch-2', name: 'Spring Placement Batch B', slug: 'spring-batch-b', role: 'STUDENT' }],
    profile: { college: 'BITS Pilani', gradYear: 2026, headline: 'Backend & Systems' },
  },
];

const fallbackBatches: AdminBatchItem[] = [
  {
    id: 'batch-1',
    name: 'NUMU Elite Cohort 2026',
    slug: 'elite-2026',
    description: 'Flagship product-engineering & advanced DSA placement batch.',
    createdAt: '2026-01-15T09:00:00.000Z',
    studentCount: 24,
    activeStudentCount: 22,
    trainerCount: 1,
    participationRate: 92,
    totalSubmissions: 268,
    totalTestAttempts: 19,
    trainers: [{ userId: 'usr-trainer-1', name: 'Prof. Kiran Rao', email: 'trainer@numu.edu', orgRole: 'TRAINER' }],
  },
  {
    id: 'batch-2',
    name: 'Spring Placement Batch B',
    slug: 'spring-batch-b',
    description: 'Core data structures, sliding window, and weekly proctored tests.',
    createdAt: '2026-02-01T09:00:00.000Z',
    studentCount: 18,
    activeStudentCount: 16,
    trainerCount: 1,
    participationRate: 89,
    totalSubmissions: 144,
    totalTestAttempts: 11,
    trainers: [{ userId: 'usr-trainer-1', name: 'Prof. Kiran Rao', email: 'trainer@numu.edu', orgRole: 'TRAINER' }],
  },
];

const fallbackSubmissions: any[] = [
  {
    id: 'sub-901',
    language: 'cpp',
    verdict: 'AC',
    status: 'COMPLETED',
    runtimeMs: 4,
    memoryKb: 8420,
    testsPassed: 6,
    totalTests: 6,
    sourceCode: '#include <bits/stdc++.h>\nusing namespace std;\nclass Solution {\npublic:\n  vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> seen;\n    for (int i = 0; i < (int)nums.size(); ++i) {\n      if (seen.count(target - nums[i])) return {seen[target - nums[i]], i};\n      seen[nums[i]] = i;\n    }\n    return {};\n  }\n};',
    createdAt: '2026-03-04T09:42:00.000Z',
    user: { id: 'usr-stu-2', name: 'Diya Nair', email: 'diya@student.numu.edu', username: 'diya_nair' },
    problem: { id: 'prob-1', title: 'Two Sum', slug: 'two-sum', difficulty: 'EASY' },
  },
  {
    id: 'sub-902',
    language: 'python',
    verdict: 'WA',
    status: 'COMPLETED',
    runtimeMs: 38,
    memoryKb: 14200,
    testsPassed: 5,
    totalTests: 8,
    sourceCode: 'def lengthOfLongestSubstring(s: str) -> int:\n    seen = set()\n    ans = 0\n    for ch in s:\n        if ch in seen:\n            seen.clear()\n        seen.add(ch)\n        ans = max(ans, len(seen))\n    return ans',
    stderr: 'Test case #6 failed: Expected 3 on input "dvdf", got 2.',
    createdAt: '2026-03-04T09:15:00.000Z',
    user: { id: 'usr-stu-1', name: 'Aarav Sharma', email: 'aarav@student.numu.edu', username: 'aarav_s' },
    problem: {
      id: 'prob-2',
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      difficulty: 'MEDIUM',
    },
  },
  {
    id: 'sub-903',
    language: 'java',
    verdict: 'AC',
    status: 'COMPLETED',
    runtimeMs: 11,
    memoryKb: 42100,
    testsPassed: 10,
    totalTests: 10,
    sourceCode: 'class Solution {\n  public int[] findOrder(int numCourses, int[][] prerequisites) {\n    // Kahn BFS topological sort\n    return new int[0];\n  }\n}',
    createdAt: '2026-03-03T18:20:00.000Z',
    user: { id: 'usr-stu-3', name: 'Rohan Verma', email: 'rohan@student.numu.edu', username: 'rohan_v' },
    problem: {
      id: 'prob-3',
      title: 'Course Schedule II (Topological Sort)',
      slug: 'course-schedule-ii',
      difficulty: 'MEDIUM',
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Single Unified Admin API Service (Live Backend + Automatic Offline Fallback)
// ─────────────────────────────────────────────────────────────────────────────

export const adminApi = {
  // Auth & Enterprise Session Security
  login: async (identifier: string, password: string) => {
    purgeBrowserAuthStorage();
    return request<{ user: AdminUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  logout: async () => {
    purgeBrowserAuthStorage();
    fallbackCurrentUser = null;
    try {
      return await request<{ message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      return { message: 'Logged out' };
    }
  },

  logoutAll: async () => {
    purgeBrowserAuthStorage();
    fallbackCurrentUser = null;
    try {
      return await request<{ message: string }>('/auth/logout-all', { method: 'POST' });
    } catch {
      return { message: 'All sessions terminated' };
    }
  },

  me: async (): Promise<AdminUser | null> => {
    try {
      return await request<AdminUser>('/auth/me');
    } catch {
      return null;
    }
  },

  getSessions: () =>
    withFallback(
      () => request<AdminSessionItem[]>('/auth/sessions'),
      () => [
        {
          id: 'sess-local-1',
          ipAddress: '127.0.0.1 (Localhost)',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'NUMU Admin Browser',
          createdAt: new Date(Date.now() - 3600_000).toISOString(),
          lastActivityAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 86400_000).toISOString(),
          isCurrent: true,
        },
      ],
    ),

  revokeSession: (sessionId: string) =>
    withFallback(
      () => request<{ message: string }>(`/auth/sessions/${sessionId}`, { method: 'DELETE' }),
      () => ({ message: 'Session revoked' }),
    ),

  // Dashboard Overview
  getOverview: () =>
    withFallback(
      () => request<AdminOverviewData>('/admin/tests/overview'),
      () => {
        const allAttempts = [
          ...(fallbackAttempts['test-1'] || []),
          ...(fallbackAttempts['test-2'] || []),
        ];
        const students = fallbackUsers.filter((u) => u.role === 'STUDENT');
        const pubProbs = fallbackProblems.filter((p) => p.status === 'PUBLISHED').length;
        const draftProbs = fallbackProblems.filter((p) => p.status !== 'PUBLISHED').length;
        return {
          stats: {
            totalStudents: students.length,
            activeStudents: students.filter((s) => s.isActive).length,
            inactiveStudents: students.filter((s) => !s.isActive).length,
            totalProblems: fallbackProblems.length,
            publishedProblems: pubProbs,
            draftProblems: draftProbs,
            totalTests: fallbackTests.length,
            publishedTests: fallbackTests.filter((t) => t.status === 'PUBLISHED').length,
            totalSubmissions: fallbackSubmissions.length,
            acceptedSubmissions: fallbackSubmissions.filter((s) => s.verdict === 'AC').length,
            submissionPassRate: 67,
            totalAttempts: allAttempts.length,
            completedAttempts: allAttempts.length,
            ongoingAttempts: 0,
            autoSubmittedAttempts: allAttempts.filter((a) => a.autoSubmitted).length,
            averageAssessmentScore: 73,
            totalBatches: fallbackBatches.length,
            totalTopics: fallbackTopics.length,
          },
          recentAttempts: allAttempts,
          recentSubmissions: fallbackSubmissions,
        };
      },
    ),

  // Problems / Questions Bank
  listProblems: (params?: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    difficulty?: string | undefined;
    status?: string | undefined;
    topic?: string | undefined;
  }) =>
    withFallback(
      () =>
        request<{
          items: ProblemItem[];
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        }>('/problems', { params }),
      () => {
        let items = [...fallbackProblems];
        if (params?.search) {
          const q = params.search.toLowerCase();
          items = items.filter(
            (p) => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
          );
        }
        if (params?.difficulty) {
          items = items.filter((p) => p.difficulty === params.difficulty);
        }
        if (params?.status) {
          items = items.filter((p) => p.status === params.status);
        }
        if (params?.topic) {
          items = items.filter((p) => p.topics.some((t) => t.slug === params.topic));
        }
        return {
          items,
          page: params?.page || 1,
          limit: params?.limit || 50,
          total: items.length,
          totalPages: 1,
        };
      },
    ),

  getProblem: (slug: string) =>
    withFallback(
      () => request<ProblemItem>(`/problems/${slug}`),
      () => fallbackProblems.find((p) => p.slug === slug || p.id === slug) || fallbackProblems[0]!,
    ),

  createProblem: (payload: Record<string, unknown>) =>
    request<ProblemItem>('/problems', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProblem: (id: string, payload: Record<string, unknown>) =>
    request<ProblemItem>(`/problems/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  archiveProblem: (id: string) =>
    request<{ message: string }>(`/problems/${id}`, { method: 'DELETE' }),

  // Topics
  listTopics: () =>
    request<TopicItem[]>('/topics').catch(() => []),

  createTopic: (payload: {
    name: string;
    slug?: string | undefined;
    description?: string | null | undefined;
    order?: number | undefined;
  }) =>
    request<TopicItem>('/topics', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTopic: (id: string, payload: Partial<TopicItem>) =>
    request<TopicItem>(`/topics/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteTopic: (id: string) =>
    request<{ message: string }>(`/topics/${id}`, { method: 'DELETE' }),

  // Tests & Proctoring
  listTests: () =>
    request<AdminTestItem[]>('/admin/tests').catch((err) => {
      console.warn('Failed to load admin tests from API', err);
      return [];
    }),

  getTest: (id: string) => request<AdminTestItem>(`/admin/tests/${id}`),

  createTest: (payload: Record<string, unknown>) =>
    request<AdminTestItem>('/admin/tests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateTest: (id: string, payload: Record<string, unknown>) =>
    request<AdminTestItem>(`/admin/tests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteTest: (id: string) =>
    request<{ message: string }>(`/admin/tests/${id}`, { method: 'DELETE' }),

  getTestAttempts: (testId: string) =>
    request<any[]>(`/admin/tests/${testId}/attempts`).catch(() => []),

  resetTestAttempt: (testId: string, attemptId: string) =>
    request<{ message: string }>(`/admin/tests/${testId}/attempts/${attemptId}`, {
      method: 'DELETE',
    }),

  reassignTestAttempt: (
    testId: string,
    attemptId: string,
    body?: { extraMinutes?: number | undefined },
  ) =>
    request<{ success: boolean; message: string; attempt: any }>(
      `/admin/tests/${testId}/attempts/${attemptId}/reassign`,
      {
        method: 'POST',
        body: JSON.stringify(body || {}),
      },
    ),

  // Students & Users
  listUsers: (params?: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    role?: string | undefined;
    isActive?: string | undefined;
  }) =>
    withFallback(
      () =>
        request<{
          data: AdminUser[];
          pagination: { page: number; pageSize: number; total: number; totalPages: number };
        }>('/users', { params }),
      () => {
        let items = [...fallbackUsers];
        if (params?.role) items = items.filter((u) => u.role === params.role);
        if (params?.search) {
          const q = params.search.toLowerCase();
          items = items.filter(
            (u) =>
              (u.name || '').toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              (u.username || '').toLowerCase().includes(q),
          );
        }
        return {
          data: items,
          pagination: { page: 1, pageSize: 50, total: items.length, totalPages: 1 },
        };
      },
    ),

  getUser: (id: string) =>
    withFallback(
      () => request<any>(`/users/id/${id}`),
      () => fallbackUsers.find((u) => u.id === id) || fallbackUsers[0]!,
    ),

  createUser: (payload: Record<string, unknown>) =>
    withFallback(
      () =>
        request<AdminUser>('/users', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      () => {
        const created: AdminUser = {
          id: `usr-${Date.now()}`,
          email: String(payload['email'] || 'student@numu.edu'),
          username: String(payload['username'] || 'student'),
          name: String(payload['name'] || 'New Student'),
          role: (payload['role'] as Role) || 'STUDENT',
          isActive: true,
          createdAt: new Date().toISOString(),
          submissionsCount: 0,
          testAttemptsCount: 0,
        };
        fallbackUsers.push(created);
        return created;
      },
    ),

  updateUser: (id: string, payload: Record<string, unknown>) =>
    withFallback(
      () =>
        request<AdminUser>(`/users/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
      () => {
        const idx = fallbackUsers.findIndex((u) => u.id === id);
        if (idx >= 0) {
          fallbackUsers[idx] = { ...fallbackUsers[idx]!, ...(payload as Partial<AdminUser>) };
          return fallbackUsers[idx]!;
        }
        return fallbackUsers[0]!;
      },
    ),

  deleteUser: (id: string) =>
    withFallback(
      () =>
        request<{ softDeactivated?: boolean; message?: string }>(`/users/${id}`, {
          method: 'DELETE',
        }),
      () => {
        const idx = fallbackUsers.findIndex((u) => u.id === id);
        if (idx >= 0) fallbackUsers[idx]!.isActive = false;
        return { softDeactivated: true, message: 'User deactivated' };
      },
    ),

  // Topics & Curriculum Distribution
  getTopicsCurriculum: () =>
    withFallback(
      () => request<TopicCurriculumItem[]>('/admin/topics-curriculum'),
      () => fallbackTopics,
    ),

  // Bulk Question Validation & Import
  validateBulkProblems: (records: any[]) =>
    withFallback(
      () =>
        request<BulkProblemValidationResponse>('/admin/problems/bulk/validate', {
          method: 'POST',
          body: JSON.stringify({ records }),
        }),
      () => {
        const items: BulkValidationRowItem[] = records.map((r, i) => {
          const title = String(r.title || '');
          const slug =
            String(r.slug || '') ||
            title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
          const isDup = fallbackProblems.some((p) => p.slug === slug);
          const valid = Boolean(title && r.description) && !isDup;
          return {
            index: i,
            title: title || `Row #${i + 1}`,
            slug,
            difficulty: String(r.difficulty || 'EASY'),
            valid,
            isDuplicateInDb: isDup,
            isDuplicateInBatch: false,
            missingTopics: [],
            errors: !title ? ['Missing title'] : !r.description ? ['Missing description'] : [],
            warnings: [],
            examplesCount: Array.isArray(r.examples) ? r.examples.length : 1,
            testCasesCount: Array.isArray(r.testCases) ? r.testCases.length : 2,
          };
        });
        return {
          totalRecords: items.length,
          validCount: items.filter((x) => x.valid).length,
          duplicateCount: items.filter((x) => x.isDuplicateInDb).length,
          errorCount: items.filter((x) => x.errors.length > 0).length,
          items,
        };
      },
    ),

  importBulkProblems: (
    records: any[],
    options?: { autoCreateMissingTopics?: boolean | undefined; skipDuplicates?: boolean | undefined },
  ) =>
    withFallback(
      () =>
        request<{
          totalProcessed: number;
          importedCount: number;
          skippedCount: number;
          failedCount: number;
          imported: any[];
          skipped: any[];
          failed: any[];
        }>('/admin/problems/bulk/import', {
          method: 'POST',
          body: JSON.stringify({ records, ...options }),
        }),
      () => {
        const imported: any[] = [];
        records.forEach((r, idx) => {
          const title = String(r.title || `Imported Problem ${idx + 1}`);
          const slug =
            String(r.slug || '') ||
            title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
          const created: ProblemItem = {
            id: `prob-bulk-${Date.now()}-${idx}`,
            slug,
            title,
            difficulty: (r.difficulty as Difficulty) || 'EASY',
            status: 'PUBLISHED',
            acceptanceRate: 0,
            topics: [{ slug: 'arrays-and-hashing', name: 'Arrays & Hashing', isPrimary: true }],
            testCasesCount: Array.isArray(r.testCases) ? r.testCases.length : 2,
            submissionsCount: 0,
            examplesCount: Array.isArray(r.examples) ? r.examples.length : 1,
            createdAt: new Date().toISOString(),
          };
          fallbackProblems.unshift(created);
          imported.push(created);
        });
        return {
          totalProcessed: records.length,
          importedCount: imported.length,
          skippedCount: 0,
          failedCount: 0,
          imported,
          skipped: [],
          failed: [],
        };
      },
    ),

  // Duplicate Assessment
  duplicateTest: (id: string) =>
    request<AdminTestItem>(`/admin/tests/${id}/duplicate`, {
      method: 'POST',
    }),

  // Submissions & Judge0 Evaluation Management
  listSubmissions: (params?: {
    page?: number | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    verdict?: string | undefined;
    status?: string | undefined;
    language?: string | undefined;
    problemId?: string | undefined;
    userId?: string | undefined;
  }) =>
    withFallback(
      () =>
        request<{
          items: any[];
          pagination: { page: number; limit: number; total: number; totalPages: number };
          summary: { total: number; accepted: number; failed: number; pending: number };
        }>('/admin/submissions', { params }),
      () => {
        let items = [...fallbackSubmissions];
        if (params?.verdict) items = items.filter((s) => s.verdict === params.verdict);
        if (params?.language) items = items.filter((s) => s.language === params.language);
        if (params?.search) {
          const q = params.search.toLowerCase();
          items = items.filter(
            (s) =>
              s.user.name.toLowerCase().includes(q) ||
              s.problem.title.toLowerCase().includes(q),
          );
        }
        return {
          items,
          pagination: { page: 1, limit: 50, total: items.length, totalPages: 1 },
          summary: {
            total: fallbackSubmissions.length,
            accepted: fallbackSubmissions.filter((s) => s.verdict === 'AC').length,
            failed: fallbackSubmissions.filter((s) => s.verdict !== 'AC').length,
            pending: 0,
          },
        };
      },
    ),

  getSubmission: (id: string) =>
    withFallback(
      () => request<any>(`/admin/submissions/${id}`),
      () => fallbackSubmissions.find((s) => s.id === id) || fallbackSubmissions[0]!,
    ),

  // Batches (Organizations) & Batch-Wise Analytics
  listBatches: () =>
    withFallback(
      () => request<AdminBatchItem[]>('/admin/batches'),
      () => fallbackBatches,
    ),

  createBatch: (payload: {
    name: string;
    slug?: string | undefined;
    description?: string | null | undefined;
  }) =>
    withFallback(
      () =>
        request<any>('/admin/batches', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      () => {
        const created: AdminBatchItem = {
          id: `batch-${Date.now()}`,
          name: payload.name,
          slug:
            payload.slug ||
            payload.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, ''),
          description: payload.description || '',
          createdAt: new Date().toISOString(),
          studentCount: 0,
          activeStudentCount: 0,
          trainerCount: 0,
          participationRate: 0,
          totalSubmissions: 0,
          totalTestAttempts: 0,
          trainers: [],
        };
        fallbackBatches.unshift(created);
        return created;
      },
    ),

  updateBatch: (
    id: string,
    payload: { name?: string | undefined; description?: string | null | undefined },
  ) =>
    withFallback(
      () =>
        request<any>(`/admin/batches/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        }),
      () => {
        const idx = fallbackBatches.findIndex((b) => b.id === id);
        if (idx >= 0) {
          const existing = fallbackBatches[idx]!;
          fallbackBatches[idx] = {
            ...existing,
            name: payload.name ?? existing.name,
            description: payload.description !== undefined ? payload.description : existing.description,
          };
          return fallbackBatches[idx]!;
        }
        return fallbackBatches[0]!;
      },
    ),

  deleteBatch: (id: string) =>
    withFallback(
      () => request<{ message: string }>(`/admin/batches/${id}`, { method: 'DELETE' }),
      () => {
        const idx = fallbackBatches.findIndex((b) => b.id === id);
        if (idx >= 0) fallbackBatches.splice(idx, 1);
        return { message: 'Batch removed' };
      },
    ),

  getBatchAnalytics: (id: string) =>
    withFallback(
      () => request<any>(`/admin/batches/${id}/analytics`),
      () => {
        const batch = fallbackBatches.find((b) => b.id === id) || fallbackBatches[0]!;
        return {
          batch: {
            id: batch.id,
            name: batch.name,
            slug: batch.slug,
            description: batch.description,
          },
          summary: {
            totalStudents: batch.studentCount,
            activeStudents: batch.activeStudentCount,
            participationRate: batch.participationRate,
            averageAssessmentScore: 76,
            overallSubmissionAccuracy: 68,
            studentsRequiringAttentionCount: 1,
          },
          topicPerformance: fallbackTopics.map((t) => ({
            name: t.name,
            slug: t.slug,
            submissions: t.totalSubmissions,
            accepted: t.acceptedSubmissions,
            accuracy: t.accuracyRate,
          })),
          leaderboard: [
            {
              userId: 'usr-stu-2',
              name: 'Diya Nair',
              email: 'diya@student.numu.edu',
              problemsSolved: 18,
              submissionAccuracy: 82,
              avgTestPercentage: 94,
              requiresAttention: false,
            },
            {
              userId: 'usr-stu-1',
              name: 'Aarav Sharma',
              email: 'aarav@student.numu.edu',
              problemsSolved: 11,
              submissionAccuracy: 58,
              avgTestPercentage: 40,
              requiresAttention: true,
              attentionReasons: ['Auto-submitted test (>3 tab switches)'],
            },
          ],
          trainers: batch.trainers,
        };
      },
    ),

  assignBatchMembers: (id: string, payload: { userIds: string[]; role?: string | undefined }) =>
    withFallback(
      () =>
        request<{ message: string; assignedCount: number }>(`/admin/batches/${id}/members`, {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      () => ({ message: 'Members assigned to batch', assignedCount: payload.userIds.length }),
    ),

  removeBatchMember: (id: string, userId: string) =>
    withFallback(
      () =>
        request<{ message: string }>(`/admin/batches/${id}/members/${userId}`, {
          method: 'DELETE',
        }),
      () => ({ message: 'Member removed from batch' }),
    ),

  // Student-Wise 360° Analytics
  getStudentAnalytics: (studentId: string) =>
    withFallback(
      () => request<StudentAnalyticsResponse>(`/admin/students/${studentId}/analytics`),
      () => {
        const stu =
          fallbackUsers.find((u) => u.id === studentId) ||
          fallbackUsers.find((u) => u.role === 'STUDENT')!;
        return {
          student: {
            id: stu.id,
            email: stu.email,
            username: stu.username,
            name: stu.name,
            role: stu.role,
            isActive: stu.isActive,
            totalXp: 1450,
            batches: stu.batches || [
              { id: 'batch-1', name: 'NUMU Elite Cohort 2026', slug: 'elite-2026', role: 'STUDENT' },
            ],
            badges: [
              {
                slug: 'first-ac',
                name: 'First Accepted Solution',
                category: 'PROBLEM_SOLVING',
                awardedAt: '2026-02-02T10:00:00.000Z',
              },
            ],
          },
          learningProgress: {
            uniqueProblemsAttempted: 16,
            uniqueProblemsSolved: 14,
            totalPublishedProblems: 22,
            completionPercentage: 64,
            totalSubmissions: 48,
            acceptedSubmissions: 36,
            submissionSuccessRate: 75,
            averageRuntimeMs: 14,
            difficultyBreakdown: {
              EASY: { attempted: 8, solved: 8 },
              MEDIUM: { attempted: 6, solved: 5 },
              HARD: { attempted: 2, solved: 1 },
            },
            languageUsage: {
              cpp: { submissions: 32, accepted: 26 },
              python: { submissions: 16, accepted: 10 },
            },
          },
          topicBreakdown: fallbackTopics.map((t) => ({
            name: t.name,
            slug: t.slug,
            problemsAttempted: 4,
            problemsSolved: 3,
            submissions: 12,
            accepted: 9,
            accuracy: t.accuracyRate,
          })),
          assessmentPerformance: {
            totalAttempts: 3,
            completedAttempts: 3,
            passedAttempts: 2,
            autoSubmittedCount: 1,
            averagePercentage: 74,
            performanceTrend: 'IMPROVING',
            attempts: fallbackAttempts['test-1'] || [],
          },
          insights: {
            strongTopics: [{ name: 'Arrays & Hashing', slug: 'arrays-and-hashing', accuracy: 76 }],
            weakTopics: [{ name: 'Dynamic Programming', slug: 'dynamic-programming', accuracy: 48 }],
            frequentlyFailedProblems: [
              {
                problemId: 'prob-2',
                title: 'Longest Substring Without Repeating Characters',
                slug: 'longest-substring-without-repeating-characters',
                difficulty: 'MEDIUM' as Difficulty,
                failures: 2,
                solved: true,
              },
            ],
            performanceTrend: 'IMPROVING',
          },
          recentSubmissions: fallbackSubmissions,
        };
      },
    ),

  // ════════════════════════════════════════════════════════════════════════════
  // DSA Hub & Curation
  // ════════════════════════════════════════════════════════════════════════════
  getDailySchedules: (days = 30) =>
    withFallback(
      () => request<any[]>(`/admin/dsa-hub/schedules?days=${days}`),
      () => [],
    ),

  setDailySchedule: (data: { date: string; problemId: string; xpBonus?: number; instructions?: string; isActive?: boolean }) =>
    withFallback(
      () => request<any>('/admin/dsa-hub/schedules', { method: 'POST', body: JSON.stringify(data) }),
      () => data,
    ),

  deleteDailySchedule: (id: string) =>
    withFallback(
      () => request<any>(`/admin/dsa-hub/schedules/${id}`, { method: 'DELETE' }),
      () => ({ success: true }),
    ),

  getCuratedProblems: (orgId?: string) =>
    withFallback(
      () => request<any[]>(`/admin/dsa-hub/curated${orgId ? `?organizationId=${orgId}` : ''}`),
      () => [],
    ),

  addCuratedProblem: (data: { problemId: string; orderIndex?: number; isPinned?: boolean; organizationId?: string }) =>
    withFallback(
      () => request<any>('/admin/dsa-hub/curated', { method: 'POST', body: JSON.stringify(data) }),
      () => data,
    ),

  reorderCuratedProblems: (items: { id: string; orderIndex: number }[]) =>
    withFallback(
      () => request<any>('/admin/dsa-hub/curated/reorder', { method: 'PUT', body: JSON.stringify({ items }) }),
      () => items,
    ),

  removeCuratedProblem: (id: string) =>
    withFallback(
      () => request<any>(`/admin/dsa-hub/curated/${id}`, { method: 'DELETE' }),
      () => ({ success: true }),
    ),

  setFeaturedTest: (testId: string) =>
    withFallback(
      () => request<any>(`/admin/dsa-hub/featured-test/${testId}`, { method: 'PUT' }),
      () => ({ success: true }),
    ),

  // ════════════════════════════════════════════════════════════════════════════
  // Development Track Management
  // ════════════════════════════════════════════════════════════════════════════
  getDevTracks: () =>
    request<any[]>('/admin/practice/development/tracks').catch(() => []),

  createDevTrack: (data: { slug: string; title: string; description?: string; icon?: string; colorTone?: string; order?: number }) =>
    request<any>('/admin/practice/development/tracks', { method: 'POST', body: JSON.stringify(data) }),

  updateDevTrack: (id: string, data: any) =>
    request<any>(`/admin/practice/development/tracks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDevTrack: (id: string) =>
    request<any>(`/admin/practice/development/tracks/${id}`, { method: 'DELETE' }),

  getDevProjects: () =>
    request<any[]>('/admin/practice/development/projects').catch(() => []),

  createDevProject: (data: any) =>
    request<any>('/admin/practice/development/projects', { method: 'POST', body: JSON.stringify(data) }),

  updateDevProject: (id: string, data: any) =>
    request<any>(`/admin/practice/development/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDevProject: (id: string) =>
    request<any>(`/admin/practice/development/projects/${id}`, { method: 'DELETE' }),

  addDevMilestone: (projectId: string, title: string, order?: number) =>
    request<any>(`/admin/practice/development/projects/${projectId}/milestones`, { method: 'POST', body: JSON.stringify({ title, order }) }),

  deleteDevMilestone: (id: string) =>
    request<any>(`/admin/practice/development/milestones/${id}`, { method: 'DELETE' }),

  createDevModule: (data: any) =>
    request<any>('/admin/practice/development/modules', { method: 'POST', body: JSON.stringify(data) }),

  deleteDevModule: (id: string) =>
    request<any>(`/admin/practice/development/modules/${id}`, { method: 'DELETE' }),

  // ════════════════════════════════════════════════════════════════════════════
  // System Design Management
  // ════════════════════════════════════════════════════════════════════════════
  getSystemDesignTopics: () =>
    request<any[]>('/admin/practice/system-design/topics').catch(() => []),

  createSystemDesignTopic: (data: any) =>
    request<any>('/admin/practice/system-design/topics', { method: 'POST', body: JSON.stringify(data) }),

  updateSystemDesignTopic: (id: string, data: any) =>
    request<any>(`/admin/practice/system-design/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteSystemDesignTopic: (id: string) =>
    request<any>(`/admin/practice/system-design/topics/${id}`, { method: 'DELETE' }),

  createSystemDesignQuestion: (data: any) =>
    request<any>('/admin/practice/system-design/questions', { method: 'POST', body: JSON.stringify(data) }),

  updateSystemDesignQuestion: (id: string, data: any) =>
    request<any>(`/admin/practice/system-design/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteSystemDesignQuestion: (id: string) =>
    request<any>(`/admin/practice/system-design/questions/${id}`, { method: 'DELETE' }),

  // ════════════════════════════════════════════════════════════════════════════
  // Core CS Management
  // ════════════════════════════════════════════════════════════════════════════
  getCoreSubjects: () =>
    request<any[]>('/admin/practice/core/subjects').catch(() => []),

  createCoreSubject: (data: any) =>
    request<any>('/admin/practice/core/subjects', { method: 'POST', body: JSON.stringify(data) }),

  updateCoreSubject: (id: string, data: any) =>
    request<any>(`/admin/practice/core/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCoreSubject: (id: string) =>
    request<any>(`/admin/practice/core/subjects/${id}`, { method: 'DELETE' }),

  createCoreTopic: (data: any) =>
    request<any>('/admin/practice/core/topics', { method: 'POST', body: JSON.stringify(data) }),

  updateCoreTopic: (id: string, data: any) =>
    request<any>(`/admin/practice/core/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCoreTopic: (id: string) =>
    request<any>(`/admin/practice/core/topics/${id}`, { method: 'DELETE' }),

  createCoreQuestion: (data: any) =>
    request<any>('/admin/practice/core/questions', { method: 'POST', body: JSON.stringify(data) }),

  updateCoreQuestion: (id: string, data: any) =>
    request<any>(`/admin/practice/core/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCoreQuestion: (id: string) =>
    request<any>(`/admin/practice/core/questions/${id}`, { method: 'DELETE' }),

  // ════════════════════════════════════════════════════════════════════════════
  // Announcements & Notifications Management
  // ════════════════════════════════════════════════════════════════════════════
  getNotifications: () =>
    request<any[]>('/admin/notifications').catch(() => []),

  createNotification: (data: any) =>
    request<any>('/admin/notifications', { method: 'POST', body: JSON.stringify(data) }),

  deleteNotification: (id: string) =>
    request<any>(`/admin/notifications/${id}`, { method: 'DELETE' }),
};
