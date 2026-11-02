/**
 * PROFILE DATA MODELS & SEED DATA
 * Production-ready structures for NUMU Developer Profile
 */

import type {
  UserProfile,
  DsaStatistics,
  DevSkill,
  ActivityData,
  Achievement,
  Project,
  TestResult,
} from '@/types/profile';

export const INITIAL_PROFILE: UserProfile = {
  username: 'jani',
  displayName: 'Jani Pasha',
  isVerified: true,
  avatarUrl: null,
  college: 'B.V. Raju Institute of Technology',
  department: 'AI & Data Science',
  batch: 'Class of 2026',
  location: 'Hyderabad, India',
  joinedDate: 'Joined March 2024',
  bio: 'Full-stack software engineer focused on distributed systems, modern web architecture, and competitive algorithm design.\nLearning, building, and growing with NUMU.',
  tags: ['Full Stack Developer', 'Problem Solver', 'AI/ML Enthusiast', 'Open Source Contributor'],
  socials: [
    { platform: 'github', label: 'github.com/jani-pasha', url: 'https://github.com/jani-pasha' },
    { platform: 'linkedin', label: 'linkedin.com/in/jani-pasha', url: 'https://linkedin.com/in/jani-pasha' },
    { platform: 'website', label: 'jani.dev', url: 'https://jani.dev' },
  ],
  stats: {
    problemsSolved: 0,
    projectsCompleted: 0,
    contestRating: 1200,
    testsCompleted: 0,
    dayStreak: 0,
    globalRank: 1,
    acceptanceRate: '0.0%',
    easySolved: 0,
    mediumSolved: 0,
    hardSolved: 0,
    maxStreak: 0,
  },
  quote: '"Small steps everyday lead to extraordinary results."',
};

export const INITIAL_DEV_SKILLS: DevSkill[] = [
  // Frontend
  { name: 'Next.js 15', category: 'Frontend', level: 'Advanced', icon: '▲', color: 'text-slate-900', pct: 90 },
  { name: 'React 19', category: 'Frontend', level: 'Advanced', icon: '⚛️', color: 'text-cyan-500', pct: 92 },
  { name: 'TypeScript', category: 'Frontend', level: 'Advanced', icon: 'TS', color: 'text-blue-500', pct: 88 },
  { name: 'Tailwind CSS v4', category: 'Frontend', level: 'Advanced', icon: '🎨', color: 'text-teal-500', pct: 94 },

  // Backend
  { name: 'Node.js', category: 'Backend', level: 'Advanced', icon: '🟢', color: 'text-emerald-600', pct: 85 },
  { name: 'NestJS', category: 'Backend', level: 'Advanced', icon: '⚙️', color: 'text-red-500', pct: 82 },
  { name: 'REST & OpenAPI', category: 'Backend', level: 'Advanced', icon: '⚡', color: 'text-pink-500', pct: 88 },

  // Database
  { name: 'PostgreSQL 17', category: 'Database', level: 'Advanced', icon: '🐘', color: 'text-blue-600', pct: 84 },
  { name: 'Prisma ORM', category: 'Database', level: 'Advanced', icon: '💎', color: 'text-indigo-500', pct: 86 },
  { name: 'Redis', category: 'Database', level: 'Intermediate', icon: '🔴', color: 'text-rose-500', pct: 70 },

  // Cloud & Tools
  { name: 'Docker & Compose', category: 'Cloud & Tools', level: 'Advanced', icon: '🐳', color: 'text-sky-500', pct: 80 },
  { name: 'Git & GitHub Actions', category: 'Cloud & Tools', level: 'Advanced', icon: '🐙', color: 'text-slate-800', pct: 88 },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'DevPulse — Realtime Collaborative Code Studio',
    description: 'A browser-based cloud workspace featuring live Monaco pair programming, WebSockets room synchronization, and containerized Judge0 code execution.',
    tags: ['Next.js 15', 'TypeScript', 'WebSockets', 'Docker', 'Tailwind CSS'],
    level: 'Advanced',
    stars: 56,
    forks: 18,
    liveUrl: 'https://devpulse.preview.io',
    githubUrl: 'https://github.com/jani-pasha/devpulse',
    previewBg: 'from-emerald-900 to-slate-900',
    featured: true,
  },
  {
    id: 'proj-2',
    title: 'FlatMate — Student Housing & Roommate Matcher',
    description: 'Smart discovery platform connecting college students with compatible flatmates, verified rental listings, and automated utility split billing.',
    tags: ['React 19', 'NestJS', 'PostgreSQL', 'Prisma', 'Google Maps API'],
    level: 'Intermediate',
    stars: 34,
    forks: 9,
    liveUrl: 'https://flatmate-demo.app',
    githubUrl: 'https://github.com/jani-pasha/flatmate',
    previewBg: 'from-blue-900 to-indigo-950',
    featured: true,
  },
  {
    id: 'proj-3',
    title: 'ExpenseTrack — AI Financial Analytics & Budgeting',
    description: 'Receipt scanning with automated transaction categorization, monthly spending projections, and interactive financial health visualizations.',
    tags: ['Next.js', 'Tailwind CSS', 'Chart.js', 'Prisma', 'PostgreSQL'],
    level: 'Intermediate',
    stars: 29,
    forks: 7,
    liveUrl: 'https://expensetrack-ai.vercel.app',
    githubUrl: 'https://github.com/jani-pasha/expensetrack',
    previewBg: 'from-teal-900 to-slate-950',
    featured: true,
  },
];

export const INITIAL_TESTS: TestResult[] = [];

// Backwards-compatibility aliases
export const DUMMY_PROFILE = INITIAL_PROFILE;
export const DUMMY_DEV_SKILLS = INITIAL_DEV_SKILLS;
export const DUMMY_PROJECTS = INITIAL_PROJECTS;
export const DUMMY_CONTESTS = INITIAL_TESTS;
export const DUMMY_ACHIEVEMENTS: Achievement[] = [];

export const DUMMY_DSA_STATS: DsaStatistics = {
  solved: {
    easy: 2,
    medium: 0,
    hard: 0,
    total: 2,
  },
  acceptanceRate: '52.0%',
  totalSubmissions: 25,
  globalRank: 142,
  topTopics: [
    { name: 'Arrays & Hashing', percentage: 40, solvedCount: 2, totalCount: 5 },
    { name: 'Two Pointers', percentage: 20, solvedCount: 1, totalCount: 5 },
    { name: 'Stack', percentage: 25, solvedCount: 1, totalCount: 4 },
  ],
  recentSubmissions: [],
};

export const DUMMY_ACTIVITY: ActivityData = {
  contributions: 25,
  longestStreak: 2,
  totalLearningHours: 10,
  currentStreak: 2,
  activeDaysCount: 2,
  heatmapRows: Array.from({ length: 7 }, () => Array(52).fill(false)),
  timeline: [],
};
