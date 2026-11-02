/**
 * DUMMY DATA — Dashboard State & Metrics
 * All mock data here can be replaced with real backend API endpoints.
 */

export interface DashboardTask {
  id: string;
  label: string;
  category: 'dsa' | 'project' | 'test' | 'contest';
  xp: number;
  done: boolean;
}

export interface DashboardProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  acceptance: string;
  isBookmarked: boolean;
  isSolved: boolean;
  link: string;
}

export interface ActivityDay {
  date: string;
  dayName: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export const DUMMY_USER_PROFILE = {
  name: 'Johnny',
  username: 'johnny_dev',
  role: 'Student',
  college: 'VIT Vellore',
  avatar: 'J',
  level: 4,
  levelTitle: 'Senior Code Artisan',
  xp: 2450,
  xpToNextLevel: 3000,
  streak: 12,
  streakFrozen: true,
  freezeCount: 1,
  globalRank: 142,
  totalStudents: 12400,
  readinessScore: 84, // percentage
};

export const DUMMY_STATS = {
  dsaSolved: 142,
  dsaTotal: 500,
  dsaEasy: 68,
  dsaMedium: 56,
  dsaHard: 18,
  projectsBuilt: 3,
  projectsTarget: 8,
  contestRating: 1640,
  contestRatingDelta: '+34',
  testsCompleted: 9,
  accuracyRate: '88.4%',
};

// 21 days for clean 3-week activity heatmap
export const DUMMY_HEATMAP_DAYS: ActivityDay[] = [
  // Week 1
  { date: 'Sep 19', dayName: 'Thu', count: 4, level: 3 },
  { date: 'Sep 20', dayName: 'Fri', count: 6, level: 4 },
  { date: 'Sep 21', dayName: 'Sat', count: 2, level: 1 },
  { date: 'Sep 22', dayName: 'Sun', count: 7, level: 4 },
  { date: 'Sep 23', dayName: 'Mon', count: 3, level: 2 },
  { date: 'Sep 24', dayName: 'Tue', count: 5, level: 3 },
  { date: 'Sep 25', dayName: 'Wed', count: 4, level: 3 },
  // Week 2
  { date: 'Sep 26', dayName: 'Thu', count: 8, level: 4 },
  { date: 'Sep 27', dayName: 'Fri', count: 1, level: 1 },
  { date: 'Sep 28', dayName: 'Sat', count: 0, level: 0 },
  { date: 'Sep 29', dayName: 'Sun', count: 5, level: 3 },
  { date: 'Sep 30', dayName: 'Mon', count: 6, level: 4 },
  { date: 'Oct 01', dayName: 'Tue', count: 4, level: 3 },
  { date: 'Oct 02', dayName: 'Wed', count: 3, level: 2 },
  // Week 3
  { date: 'Oct 03', dayName: 'Thu', count: 5, level: 3 },
  { date: 'Oct 04', dayName: 'Fri', count: 7, level: 4 },
  { date: 'Oct 05', dayName: 'Sat', count: 4, level: 3 },
  { date: 'Oct 06', dayName: 'Sun', count: 6, level: 4 },
  { date: 'Oct 07', dayName: 'Mon', count: 3, level: 2 },
  { date: 'Oct 08', dayName: 'Tue', count: 5, level: 3 },
  { date: 'Oct 09', dayName: 'Today', count: 4, level: 3 },
];

export const INITIAL_TASKS: DashboardTask[] = [
  { id: 't1', label: 'Solve Daily Coding Challenge (Container With Most Water)', category: 'dsa', xp: 50, done: true },
  { id: 't2', label: 'Complete 3 Binary Search practice problems', category: 'dsa', xp: 40, done: true },
  { id: 't3', label: 'Push JWT Auth implementation for Expense Tracker', category: 'project', xp: 60, done: false },
  { id: 't4', label: 'Review editorial for Weekly Contest #42 problems', category: 'contest', xp: 30, done: false },
  { id: 't5', label: 'Complete 30-min Campus DSA Placement Mock', category: 'test', xp: 75, done: false },
];

export const DUMMY_DAILY_CHALLENGE = {
  id: 'dc-102',
  title: 'Container With Most Water',
  difficulty: 'Medium' as const,
  category: 'Two Pointers · Array',
  xp: 50,
  acceptance: '54.2%',
  timeLeft: '06h 45m',
  streakMultiplier: '1.5x XP Boost',
  link: '/tests/weekly-dsa-12/attempt',
};

export const DUMMY_CONTINUE_MODULE = {
  trackName: 'DSA Master Track',
  moduleTitle: 'Binary Search & Rotated Arrays',
  currentProblem: 'Search in Rotated Sorted Array',
  problemDifficulty: 'Medium' as const,
  completedInTopic: 14,
  totalInTopic: 20,
  progressPercent: 70,
  estMinutes: 20,
  link: '/tests/weekly-dsa-12/attempt',
};

export const DUMMY_UPCOMING_CONTEST = {
  id: 'contest-43',
  title: 'NUMU Weekly Contest #43',
  date: 'Sunday, 10:00 AM IST',
  countdown: '2d 14h 22m',
  duration: '90 Minutes',
  problemCount: 4,
  registeredCount: 1420,
  isRegistered: false,
  prize: 'Top 50 Fast-Tracked to Recruiter Screening',
};

export const DUMMY_UPCOMING_TEST = {
  id: 'campus-mock-12',
  title: 'Campus Placement Mock Test #12',
  organization: 'VIT Placement Cell & NUMU',
  date: 'Tomorrow, 06:00 PM IST',
  duration: '60 Minutes',
  questionsCount: 50,
  testId: 'weekly-dsa-12',
  syllabus: 'Arrays, Strings, Hashmaps & Bit Manipulation',
};

export const DUMMY_RECOMMENDED_PROBLEMS: DashboardProblem[] = [
  {
    id: 'p1',
    title: 'Two Sum II - Input Array Is Sorted',
    difficulty: 'Medium',
    category: 'Two Pointers',
    acceptance: '61.4%',
    isBookmarked: true,
    isSolved: false,
    link: '/tests/weekly-dsa-12/attempt',
  },
  {
    id: 'p2',
    title: '3Sum - Unique Triplets',
    difficulty: 'Medium',
    category: 'Two Pointers',
    acceptance: '34.8%',
    isBookmarked: false,
    isSolved: false,
    link: '/tests/weekly-dsa-12/attempt',
  },
  {
    id: 'p3',
    title: 'Find Minimum in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    acceptance: '49.8%',
    isBookmarked: false,
    isSolved: true,
    link: '/tests/weekly-dsa-12/attempt',
  },
  {
    id: 'p4',
    title: 'Valid Palindrome II',
    difficulty: 'Easy',
    category: 'Strings',
    acceptance: '40.2%',
    isBookmarked: true,
    isSolved: true,
    link: '/tests/weekly-dsa-12/attempt',
  },
  {
    id: 'p5',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    category: 'Binary Search',
    acceptance: '38.6%',
    isBookmarked: false,
    isSolved: false,
    link: '/tests/weekly-dsa-12/attempt',
  },
];

export const DUMMY_PROJECT = {
  title: 'Fullstack Expense & Budget SaaS',
  description: 'Production Next.js 15, Server Actions, PostgreSQL & Stripe billing.',
  stage: 'Sprint 3 of 5 · API & Database Indexing',
  progressPercent: 65,
  stars: 12,
  nextMilestone: 'Setup Refresh Token Rotation & Session Invalidation',
  githubUrl: 'https://github.com/johnny/numu-expense-tracker',
  reviewsPending: 1,
};

export const DUMMY_ACTIVITIES = [
  {
    id: 'a1',
    title: 'Solved "Search in Rotated Sorted Array"',
    detail: 'Optimal O(log n) solution • 14ms (faster than 98.2%)',
    time: '2 hours ago',
    type: 'dsa',
    xp: '+40 XP',
  },
  {
    id: 'a2',
    title: 'Submitted Pull Request for Expense Tracker',
    detail: 'Branch: feature/jwt-auth-middleware • 4 files changed',
    time: '5 hours ago',
    type: 'project',
    xp: '+60 XP',
  },
  {
    id: 'a3',
    title: 'Achieved 12-Day Coding Streak',
    detail: 'Earned 1x Streak Freeze shield protection',
    time: 'Yesterday',
    type: 'streak',
    xp: '+100 XP',
  },
  {
    id: 'a4',
    title: 'Participated in NUMU Weekly Contest #42',
    detail: 'Solved 3/4 problems • Global Rank #142 (+34 Rating)',
    time: '3 days ago',
    type: 'contest',
    xp: '+150 XP',
  },
];

export const DUMMY_GOALS = [
  {
    id: 'g1',
    title: 'Weekly Problems Target',
    current: 14,
    target: 20,
    unit: 'problems',
    progress: 70,
  },
  {
    id: 'g2',
    title: 'SaaS Capstone Project',
    current: 3,
    target: 5,
    unit: 'sprints',
    progress: 60,
  },
  {
    id: 'g3',
    title: 'Campus Test Readiness',
    current: 42,
    target: 50,
    unit: 'concepts',
    progress: 84,
  },
];
