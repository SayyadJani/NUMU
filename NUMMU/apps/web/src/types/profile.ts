// ─── Profile Types ────────────────────────────────────────────────────────────

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'website' | 'twitter';
  label: string;
  url: string;
}

export interface UserProfile {
  username: string;
  displayName: string;
  isVerified: boolean;
  avatarUrl: string | null;
  college: string;
  department: string;
  batch: string;
  bio: string;
  tags: string[];
  socials: SocialLink[];
  stats: ProfileStats;
  quote: string;
  location?: string | undefined;
  joinedDate?: string | undefined;
  followersCount?: number | undefined;
  followingCount?: number | undefined;
}

export interface ProfileStats {
  problemsSolved: number;
  projectsCompleted: number;
  contestRating: number;
  testsCompleted: number;
  totalTestsConducted?: number | undefined;
  testsAttended?: number | undefined;
  testsMissed?: number | undefined;
  dayStreak: number;
  globalRank?: number | undefined;
  acceptanceRate?: string | undefined;
  easySolved?: number | undefined;
  mediumSolved?: number | undefined;
  hardSolved?: number | undefined;
  maxStreak?: number | undefined;
}

export interface DsaDifficulty {
  easy: number;
  medium: number;
  hard: number;
  total: number;
}

export interface DsaTopic {
  name: string;
  percentage: number;
  solvedCount?: number;
  totalCount?: number;
}

export interface DsaSubmission {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
  runtime: string;
  memory: string;
  language: string;
  timeAgo: string;
}

export interface DsaStatistics {
  solved: DsaDifficulty;
  topTopics: DsaTopic[];
  acceptanceRate: string;
  totalSubmissions: number;
  globalRank: number;
  recentSubmissions: DsaSubmission[];
}

export interface DevSkill {
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'Cloud & Tools';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  color: string;
  pct: number;
}

export interface ActivityTimelineEvent {
  id: string;
  type: 'problem' | 'project' | 'contest' | 'achievement' | 'streak';
  title: string;
  detail: string;
  timestamp: string;
  tag?: string;
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  solvedCount?: number;
  isCurrentYear?: boolean;
  isFuture?: boolean;
}

export interface ActivityData {
  contributions: number;
  longestStreak: number;
  totalLearningHours: number;
  currentStreak: number;
  activeDaysCount?: number;
  heatmapRows: boolean[][];
  heatmapDays?: HeatmapDay[][];
  timeline: ActivityTimelineEvent[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  category?: 'Milestone' | 'Contest' | 'Streak' | 'Community' | undefined;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary' | undefined;
  progress?: number | undefined;
  maxProgress?: number | undefined;
  unlockedAt?: string | undefined;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  stars: number;
  forks: number;
  liveUrl: string;
  githubUrl?: string | undefined;
  previewBg: string;
  featured?: boolean | undefined;
}

export interface TestResult {
  id: string;
  testName: string;
  contestName: string;
  type: 'Weekly' | 'Daily';
  rank?: number | null | undefined;
  score: number;
  ratingChange: number;
  date: string;
  timeSpent?: string | undefined;
  status: 'ATTENDED' | 'MISSED' | 'Completed' | 'Upcoming';
  totalParticipants?: number | undefined;
  accuracy?: number | undefined;
  topic?: string | undefined;
}

export type ContestResult = TestResult;

export type ProfileTab =
  | 'Overview'
  | 'DSA'
  | 'Development'
  | 'Projects'
  | 'Tests'
  | 'Activity';

