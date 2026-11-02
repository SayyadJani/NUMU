/**
 * DUMMY DATA — Leaderboard
 * ─────────────────────────────────────────────────────────────────────────────
 * Rich competitive data with profile details, specializations, and rankings.
 */

export type CompetitiveTier = 'Pupil' | 'Specialist' | 'Knight' | 'Guardian' | 'Legend';

export interface LeaderboardEntry {
  id: string;
  rank: number;
  previousRank: number; // delta = previousRank - rank
  name: string;
  username: string;
  avatar: string;
  avatarGradient: string;
  college: string;
  batch: string;
  specialtyTitle: string;
  primaryLang: string;
  dsaSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  projectsBuilt: number;
  contestRating: number;
  tier: CompetitiveTier;
  xp: number;
  streak: number;
  winRate: number; // percentage
  badge?: string;
  isCurrentUser?: boolean;
}

export interface CollegeRanking {
  rank: number;
  college: string;
  studentsCount: number;
  averageScore: number;
  topCoder: string;
  activeBatch: string;
  logoChar: string;
}

export const CURRENT_USER_LEADERBOARD_STATS = {
  globalRank: 142,
  previousGlobalRank: 156,
  collegeRank: 8,
  totalStudents: 12400,
  percentile: 98.8,
  contestRating: 1640,
  tier: 'Knight' as CompetitiveTier,
  xp: 4250,
  dsaSolved: 147,
  easyCount: 82,
  mediumCount: 54,
  hardCount: 11,
  projectsBuilt: 3,
  streak: 12,
  winRate: 88,
  collegeName: 'B.V. Raju Institute of Technology',
  batch: '2026',
  specialtyTitle: 'Fullstack & DP Artisan',
  primaryLang: 'TypeScript / C++',
  ratingHistory: [
    { contest: 'R38', rating: 1420 },
    { contest: 'R39', rating: 1465 },
    { contest: 'R40', rating: 1510 },
    { contest: 'R41', rating: 1584 },
    { contest: 'R42', rating: 1640 },
  ],
};

export const LEADERBOARD_USERS: LeaderboardEntry[] = [
  {
    id: 'u-1',
    rank: 1,
    previousRank: 1,
    name: 'Aarav Sharma',
    username: 'aarav_sharma',
    avatar: 'A',
    avatarGradient: 'from-amber-400 via-orange-500 to-amber-600',
    college: 'IIT Bombay',
    batch: '2025',
    specialtyTitle: 'Graph & Flow Grandmaster',
    primaryLang: 'C++',
    dsaSolved: 482,
    easyCount: 120,
    mediumCount: 240,
    hardCount: 122,
    projectsBuilt: 9,
    contestRating: 2140,
    tier: 'Legend',
    xp: 18450,
    streak: 64,
    winRate: 96,
    badge: '👑',
  },
  {
    id: 'u-2',
    rank: 2,
    previousRank: 3,
    name: 'Sneha Reddy',
    username: 'sneha_codes',
    avatar: 'S',
    avatarGradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    college: 'NIT Trichy',
    batch: '2025',
    specialtyTitle: 'Dynamic Programming Ace',
    primaryLang: 'Python / C++',
    dsaSolved: 446,
    easyCount: 110,
    mediumCount: 236,
    hardCount: 100,
    projectsBuilt: 8,
    contestRating: 1980,
    tier: 'Legend',
    xp: 16920,
    streak: 48,
    winRate: 94,
    badge: '⚡',
  },
  {
    id: 'u-3',
    rank: 3,
    previousRank: 2,
    name: 'Rohan Mehta',
    username: 'rohan_dev',
    avatar: 'R',
    avatarGradient: 'from-amber-500 via-rose-500 to-red-600',
    college: 'BITS Pilani',
    batch: '2026',
    specialtyTitle: 'Segment Tree & Maths Virtuoso',
    primaryLang: 'C++',
    dsaSolved: 418,
    easyCount: 104,
    mediumCount: 220,
    hardCount: 94,
    projectsBuilt: 7,
    contestRating: 1925,
    tier: 'Guardian',
    xp: 15400,
    streak: 35,
    winRate: 91,
    badge: '🔥',
  },
  {
    id: 'u-4',
    rank: 4,
    previousRank: 6,
    name: 'Ananya Iyer',
    username: 'ananya_algo',
    avatar: 'A',
    avatarGradient: 'from-emerald-400 to-teal-600',
    college: 'IIIT Hyderabad',
    batch: '2026',
    specialtyTitle: 'Trie & String Specialist',
    primaryLang: 'Java',
    dsaSolved: 395,
    easyCount: 95,
    mediumCount: 215,
    hardCount: 85,
    projectsBuilt: 6,
    contestRating: 1874,
    tier: 'Guardian',
    xp: 14120,
    streak: 29,
    winRate: 89,
  },
  {
    id: 'u-5',
    rank: 5,
    previousRank: 4,
    name: 'Vikram Joshi',
    username: 'vikram_j',
    avatar: 'V',
    avatarGradient: 'from-blue-500 to-indigo-700',
    college: 'IIT Delhi',
    batch: '2025',
    specialtyTitle: 'System Design & Concurrency',
    primaryLang: 'Rust / Go',
    dsaSolved: 382,
    easyCount: 90,
    mediumCount: 210,
    hardCount: 82,
    projectsBuilt: 7,
    contestRating: 1820,
    tier: 'Guardian',
    xp: 13650,
    streak: 22,
    winRate: 88,
  },
  {
    id: 'u-6',
    rank: 6,
    previousRank: 8,
    name: 'Pooja Nair',
    username: 'pooja_n',
    avatar: 'P',
    avatarGradient: 'from-pink-500 to-rose-600',
    college: 'VIT Vellore',
    batch: '2026',
    specialtyTitle: 'Greedy & Game Theory',
    primaryLang: 'Python',
    dsaSolved: 358,
    easyCount: 85,
    mediumCount: 195,
    hardCount: 78,
    projectsBuilt: 6,
    contestRating: 1785,
    tier: 'Guardian',
    xp: 12890,
    streak: 41,
    winRate: 87,
  },
  {
    id: 'u-7',
    rank: 7,
    previousRank: 5,
    name: 'Karthik Rao',
    username: 'karthik_rao',
    avatar: 'K',
    avatarGradient: 'from-teal-400 to-emerald-700',
    college: 'BVRIT',
    batch: '2025',
    specialtyTitle: 'Binary Search & Sliders',
    primaryLang: 'C++',
    dsaSolved: 342,
    easyCount: 80,
    mediumCount: 190,
    hardCount: 72,
    projectsBuilt: 5,
    contestRating: 1750,
    tier: 'Guardian',
    xp: 12240,
    streak: 18,
    winRate: 86,
  },
  {
    id: 'u-8',
    rank: 8,
    previousRank: 7,
    name: 'Tanvi Deshmukh',
    username: 'tanvi_d',
    avatar: 'T',
    avatarGradient: 'from-violet-500 to-purple-700',
    college: 'COEP Pune',
    batch: '2026',
    specialtyTitle: 'Bit Manipulation Expert',
    primaryLang: 'Java',
    dsaSolved: 326,
    easyCount: 78,
    mediumCount: 180,
    hardCount: 68,
    projectsBuilt: 6,
    contestRating: 1720,
    tier: 'Guardian',
    xp: 11800,
    streak: 30,
    winRate: 85,
  },
  {
    id: 'u-9',
    rank: 9,
    previousRank: 12,
    name: 'Devendra Patel',
    username: 'dev_patel',
    avatar: 'D',
    avatarGradient: 'from-orange-400 to-amber-600',
    college: 'DTU Delhi',
    batch: '2025',
    specialtyTitle: 'Two Pointers & Intervals',
    primaryLang: 'C++',
    dsaSolved: 315,
    easyCount: 75,
    mediumCount: 175,
    hardCount: 65,
    projectsBuilt: 5,
    contestRating: 1690,
    tier: 'Knight',
    xp: 11200,
    streak: 26,
    winRate: 84,
  },
  {
    id: 'u-10',
    rank: 10,
    previousRank: 9,
    name: 'Meera Sen',
    username: 'meera_sen',
    avatar: 'M',
    avatarGradient: 'from-cyan-500 to-blue-700',
    college: 'Jadavpur University',
    batch: '2026',
    specialtyTitle: 'Recursion & Backtracking',
    primaryLang: 'Python',
    dsaSolved: 304,
    easyCount: 72,
    mediumCount: 170,
    hardCount: 62,
    projectsBuilt: 4,
    contestRating: 1665,
    tier: 'Knight',
    xp: 10750,
    streak: 15,
    winRate: 83,
  },
  {
    id: 'u-curr',
    rank: 142,
    previousRank: 156,
    name: 'Jani Pasha',
    username: 'jani_pasha',
    avatar: 'J',
    avatarGradient: 'from-emerald-400 via-teal-500 to-emerald-700',
    college: 'BVRIT',
    batch: '2026',
    specialtyTitle: 'Fullstack & DP Artisan',
    primaryLang: 'TypeScript / C++',
    dsaSolved: 147,
    easyCount: 82,
    mediumCount: 54,
    hardCount: 11,
    projectsBuilt: 3,
    contestRating: 1640,
    tier: 'Knight',
    xp: 4250,
    streak: 12,
    winRate: 88,
    isCurrentUser: true,
  },
];

export const COLLEGE_RANKINGS: CollegeRanking[] = [
  { rank: 1, college: 'IIT Bombay', logoChar: 'B', studentsCount: 420, averageScore: 1840, topCoder: 'Aarav Sharma', activeBatch: '2025-26' },
  { rank: 2, college: 'BITS Pilani', logoChar: 'P', studentsCount: 680, averageScore: 1785, topCoder: 'Rohan Mehta', activeBatch: '2025-26' },
  { rank: 3, college: 'NIT Trichy', logoChar: 'T', studentsCount: 510, averageScore: 1740, topCoder: 'Sneha Reddy', activeBatch: '2025-26' },
  { rank: 4, college: 'IIIT Hyderabad', logoChar: 'H', studentsCount: 390, averageScore: 1725, topCoder: 'Ananya Iyer', activeBatch: '2025-26' },
  { rank: 5, college: 'VIT Vellore', logoChar: 'V', studentsCount: 1240, averageScore: 1660, topCoder: 'Pooja Nair', activeBatch: '2025-26' },
  { rank: 6, college: 'B.V. Raju Institute of Tech (BVRIT)', logoChar: 'R', studentsCount: 480, averageScore: 1610, topCoder: 'Karthik Rao', activeBatch: '2025-26' },
];

export const TIER_CONFIG: Record<
  CompetitiveTier,
  {
    label: string;
    glow: string;
    color: string;
    bg: string;
    border: string;
    gradient: string;
    minRating: number;
  }
> = {
  Legend: {
    label: 'Legend',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    gradient: 'from-purple-500 to-indigo-500',
    minRating: 1900,
  },
  Guardian: {
    label: 'Guardian',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/40',
    gradient: 'from-rose-500 to-orange-500',
    minRating: 1600,
  },
  Knight: {
    label: 'Knight',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    gradient: 'from-amber-400 to-emerald-500',
    minRating: 1400,
  },
  Specialist: {
    label: 'Specialist',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/40',
    gradient: 'from-sky-400 to-blue-500',
    minRating: 1200,
  },
  Pupil: {
    label: 'Pupil',
    glow: 'shadow-none',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    gradient: 'from-slate-400 to-slate-500',
    minRating: 0,
  },
};
