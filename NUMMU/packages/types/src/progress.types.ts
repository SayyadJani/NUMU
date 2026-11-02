import type { Difficulty } from './problem.types.js';
import type { SubmissionStatus, SubmissionVerdict } from './submission.types.js';

export interface ProgressDifficultyCount {
  easy: number;
  medium: number;
  hard: number;
}

export interface ProgressDifficultyStats extends ProgressDifficultyCount {
  total: number;
}

export interface ProgressOverviewDto {
  totalProblemsSolved: number;
  difficulty: ProgressDifficultyCount;
  totalAvailable: ProgressDifficultyStats;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: string;
}

export interface TopicProgressItem {
  id: string;
  name: string;
  slug: string;
  order: number;
  totalProblems: number;
  solvedProblems: number;
  remainingProblems: number;
  percentage: number;
}

export interface TopicProgressSummary {
  topics: TopicProgressItem[];
  totalTopics: number;
}

export interface PatternProgressItem {
  id: string;
  name: string;
  slug: string;
  totalProblems: number;
  solvedProblems: number;
  remainingProblems: number;
  percentage: number;
}

export interface PatternProgressSummary {
  patterns: PatternProgressItem[];
  message?: string;
}

export interface SolvedProblemItemDto {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  solvedAt: string;
  primaryTopic: {
    slug: string;
    name: string;
  } | null;
  topics: Array<{
    slug: string;
    name: string;
  }>;
  totalSubmissions: number;
  acceptedSubmissions: number;
}

export interface PaginatedSolvedProblemsResult {
  items: SolvedProblemItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DailyActivityItem {
  date: string; // YYYY-MM-DD
  submissionCount: number;
  uniqueSolvedCount: number;
}

export interface ActivitySummaryDto {
  startDate: string;
  endDate: string;
  totalDays: number;
  activeDays: number;
  totalSubmissions: number;
  totalUniqueSolved: number;
  currentStreak: number;
  longestStreak: number;
  dailyActivity: DailyActivityItem[];
}
