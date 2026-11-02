/**
 * DSA Page — Dummy Data
 * Replace these exports with real API calls when the backend is ready.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface DsaProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  acceptance: string;
  isSolved: boolean;
  isBookmarked: boolean;
  solvedOn?: string; // "Oct 02"
}

export interface DsaTopic {
  label: string;
  slug: string;
  /** Path relative to /public, e.g. "/assets/topics/arrays.webp" */
  image?: string;
  icon?: string;
  totalProblems: number;
  solvedProblems: number;
  /** Tailwind accent class for the card border on hover */
  accent?: string;
  color?: string;
}

export interface WeakTopic {
  rank: number;
  label: string;
  pct: number;   // mastery %
  barColor: string;
}

export interface HeatmapCell {
  date: string; // "Oct 09"
  dayLabel: string; // "Thu"
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface DsaUpcomingTest {
  title: string;
  daysUntil: string;
  questionCount: number;
  durationMinutes: number;
  mode: string;
  topics: string;
  registeredCount: number;
}

export interface DsaContinueModule {
  topicTitle: string;
  problemTitle: string;
  difficulty: Difficulty;
  completedCount: number;
  totalCount: number;
  progressPct: number;
}

export interface DsaDailyChallenge {
  title: string;
  difficulty: Difficulty;
  tags: string[];
  solversToday: number;
  timeLeftLabel: string;
  xp: number;
}

// ─── DSA Overview Stats ────────────────────────────────────────────────────────

export const DSA_STATS = {
  totalSolved: 147,
  totalAvailable: 500,
  easy: 72,
  medium: 58,
  hard: 17,
  streak: 12,
  daysActive: 28,
  thisWeek: 5,
  progressPct: Math.round((147 / 500) * 100), // 29
  currentTopic: 'Arrays',
  currentTopicSlug: 'arrays',
};

// ─── Heatmap (21 days) ────────────────────────────────────────────────────────

export const DSA_HEATMAP: HeatmapCell[] = [
  // Week 1
  { date: 'Sep 19', dayLabel: 'Thu', count: 4, level: 3 },
  { date: 'Sep 20', dayLabel: 'Fri', count: 6, level: 4 },
  { date: 'Sep 21', dayLabel: 'Sat', count: 2, level: 1 },
  { date: 'Sep 22', dayLabel: 'Sun', count: 7, level: 4 },
  { date: 'Sep 23', dayLabel: 'Mon', count: 3, level: 2 },
  { date: 'Sep 24', dayLabel: 'Tue', count: 5, level: 3 },
  { date: 'Sep 25', dayLabel: 'Wed', count: 4, level: 3 },
  // Week 2
  { date: 'Sep 26', dayLabel: 'Thu', count: 8, level: 4 },
  { date: 'Sep 27', dayLabel: 'Fri', count: 1, level: 1 },
  { date: 'Sep 28', dayLabel: 'Sat', count: 0, level: 0 },
  { date: 'Sep 29', dayLabel: 'Sun', count: 5, level: 3 },
  { date: 'Sep 30', dayLabel: 'Mon', count: 6, level: 4 },
  { date: 'Oct 01', dayLabel: 'Tue', count: 4, level: 3 },
  { date: 'Oct 02', dayLabel: 'Wed', count: 3, level: 2 },
  // Week 3
  { date: 'Oct 03', dayLabel: 'Thu', count: 5, level: 3 },
  { date: 'Oct 04', dayLabel: 'Fri', count: 7, level: 4 },
  { date: 'Oct 05', dayLabel: 'Sat', count: 4, level: 3 },
  { date: 'Oct 06', dayLabel: 'Sun', count: 6, level: 4 },
  { date: 'Oct 07', dayLabel: 'Mon', count: 3, level: 2 },
  { date: 'Oct 08', dayLabel: 'Tue', count: 5, level: 3 },
  { date: 'Oct 09', dayLabel: 'Today', count: 4, level: 3 },
];

// ─── Today's Practice Problems ────────────────────────────────────────────────

export const DSA_PRACTICE_PROBLEMS: DsaProblem[] = [
  {
    id: 'p1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Hash Map',
    acceptance: '52.3%',
    isSolved: true,
    isBookmarked: false,
  },
  {
    id: 'p2',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    acceptance: '54.8%',
    isSolved: false,
    isBookmarked: true,
  },
  {
    id: 'p3',
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Two Pointers',
    acceptance: '34.8%',
    isSolved: false,
    isBookmarked: false,
  },
  {
    id: 'p4',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    acceptance: '61.4%',
    isSolved: false,
    isBookmarked: false,
  },
  {
    id: 'p5',
    title: 'Move Zeroes',
    difficulty: 'Easy',
    category: 'Array',
    acceptance: '61.1%',
    isSolved: true,
    isBookmarked: false,
  },
];

// ─── Recent Solved Problems ───────────────────────────────────────────────────

export const DSA_RECENT_PROBLEMS: DsaProblem[] = [
  {
    id: 'r1',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks',
    acceptance: '41.3%',
    isSolved: true,
    isBookmarked: false,
    solvedOn: 'Sep 18',
  },
  {
    id: 'r2',
    title: 'Merge Two Sorted Lists',
    difficulty: 'Easy',
    category: 'Linked List',
    acceptance: '64.5%',
    isSolved: true,
    isBookmarked: false,
    solvedOn: 'Sep 17',
  },
  {
    id: 'r3',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    acceptance: '50.6%',
    isSolved: true,
    isBookmarked: true,
    solvedOn: 'Sep 17',
  },
  {
    id: 'r4',
    title: 'Climbing Stairs',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    acceptance: '52.1%',
    isSolved: true,
    isBookmarked: false,
    solvedOn: 'Sep 16',
  },
  {
    id: 'r5',
    title: 'House Robber',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    acceptance: '50.4%',
    isSolved: true,
    isBookmarked: false,
    solvedOn: 'Sep 15',
  },
];

// ─── Weak Topics ──────────────────────────────────────────────────────────────

export const DSA_WEAK_TOPICS: WeakTopic[] = [
  { rank: 1, label: 'Dynamic Programming', pct: 24, barColor: 'bg-red-400' },
  { rank: 2, label: 'Trees',               pct: 32, barColor: 'bg-orange-400' },
  { rank: 3, label: 'Graphs',              pct: 36, barColor: 'bg-orange-400' },
  { rank: 4, label: 'Heap / Priority Q',   pct: 40, barColor: 'bg-amber-400' },
  { rank: 5, label: 'Backtracking',        pct: 42, barColor: 'bg-amber-400' },
];

// ─── Explore Topics ───────────────────────────────────────────────────────────

export const DSA_TOPICS: DsaTopic[] = [
  { label: 'Arrays',           slug: 'arrays',     icon: '▦',  totalProblems: 120, solvedProblems: 42, color: 'bg-blue-50 border-blue-100 text-blue-600' },
  { label: 'Strings',          slug: 'strings',    icon: 'T',  totalProblems: 95,  solvedProblems: 31, color: 'bg-purple-50 border-purple-100 text-purple-600' },
  { label: 'Linked List',      slug: 'linked-list',icon: '⛓', totalProblems: 80,  solvedProblems: 18, color: 'bg-pink-50 border-pink-100 text-pink-600' },
  { label: 'Stacks & Queues',  slug: 'stacks',     icon: '⊞', totalProblems: 70,  solvedProblems: 22, color: 'bg-orange-50 border-orange-100 text-orange-600' },
  { label: 'Trees',            slug: 'trees',      icon: '🌲', totalProblems: 110, solvedProblems: 14, color: 'bg-green-50 border-green-100 text-green-700' },
  { label: 'Graphs',           slug: 'graphs',     icon: '⬡',  totalProblems: 93,  solvedProblems: 10, color: 'bg-teal-50 border-teal-100 text-teal-600' },
  { label: 'Dynamic Prog.',    slug: 'dp',         icon: '⚡',  totalProblems: 120, solvedProblems: 8,  color: 'bg-yellow-50 border-yellow-100 text-yellow-700' },
  { label: 'Greedy',           slug: 'greedy',     icon: '◈',  totalProblems: 65,  solvedProblems: 19, color: 'bg-rose-50 border-rose-100 text-rose-600' },
];

// ─── Continue Learning ────────────────────────────────────────────────────────

export const DSA_CONTINUE: DsaContinueModule = {
  topicTitle: 'Arrays — Two Pointers',
  problemTitle: 'Container With Most Water',
  difficulty: 'Medium',
  completedCount: 4,
  totalCount: 12,
  progressPct: 33,
};

// ─── Daily Challenge ─────────────────────────────────────────────────────────

export const DSA_DAILY_CHALLENGE: DsaDailyChallenge = {
  title: 'Longest Substring Without Repeating Characters',
  difficulty: 'Medium',
  tags: ['Hash Map', 'String', 'Sliding Window'],
  solversToday: 1285,
  timeLeftLabel: '13h 24m',
  xp: 50,
};

// ─── Upcoming Test ────────────────────────────────────────────────────────────

export const DSA_UPCOMING_TEST: DsaUpcomingTest = {
  title: 'DSA Mock Test — 2',
  daysUntil: '2 days',
  questionCount: 50,
  durationMinutes: 90,
  mode: 'Mixed',
  topics: 'Arrays, Strings, Trees, DP & more',
  registeredCount: 1240,
};
