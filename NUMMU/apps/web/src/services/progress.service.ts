import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ProgressOverviewDto,
  TopicProgressSummary,
  PatternProgressSummary,
  PaginatedSolvedProblemsResult,
  PaginatedSubmissionsResult,
  ActivitySummaryDto,
  Difficulty,
  SubmissionVerdict,
} from '@numu/types';

export interface SolvedProblemsFilter {
  page?: number;
  limit?: number;
  difficulty?: Difficulty;
  topic?: string;
}

export interface SubmissionHistoryFilter {
  page?: number;
  limit?: number;
  problemSlug?: string;
  verdict?: SubmissionVerdict;
}

export interface ActivityFilter {
  startDate?: string;
  endDate?: string;
  tzOffsetMinutes?: number;
}

export const progressService = {
  /**
   * Fetch authenticated user's progress overview and difficulty breakdown.
   */
  async getOverview(): Promise<ProgressOverviewDto> {
    return apiClient.get<ProgressOverviewDto>(ENDPOINTS.PROGRESS.OVERVIEW);
  },

  /**
   * Fetch topic-wise problem completion and mastery percentages.
   */
  async getTopicProgress(): Promise<TopicProgressSummary> {
    return apiClient.get<TopicProgressSummary>(ENDPOINTS.PROGRESS.BY_TOPIC);
  },

  /**
   * Fetch pattern progress (topics represent primary curriculum structure).
   */
  async getPatternProgress(): Promise<PatternProgressSummary> {
    return apiClient.get<PatternProgressSummary>(ENDPOINTS.PROGRESS.BY_PATTERN);
  },

  /**
   * Fetch unique solved problems with difficulty or topic filters and pagination.
   */
  async getSolvedProblems(query?: SolvedProblemsFilter): Promise<PaginatedSolvedProblemsResult> {
    const params: Record<string, string | number | undefined> = {};
    if (query?.page) params['page'] = query.page;
    if (query?.limit) params['limit'] = query.limit;
    if (query?.difficulty) params['difficulty'] = query.difficulty;
    if (query?.topic) params['topic'] = query.topic;
    return apiClient.get<PaginatedSolvedProblemsResult>(ENDPOINTS.PROGRESS.SOLVED_PROBLEMS, {
      params,
    });
  },

  /**
   * Fetch user's paginated submission history.
   */
  async getSubmissionHistory(
    query?: SubmissionHistoryFilter,
  ): Promise<PaginatedSubmissionsResult> {
    const params: Record<string, string | number | undefined> = {};
    if (query?.page) params['page'] = query.page;
    if (query?.limit) params['limit'] = query.limit;
    if (query?.problemSlug) params['problemSlug'] = query.problemSlug;
    if (query?.verdict) params['verdict'] = query.verdict;
    return apiClient.get<PaginatedSubmissionsResult>(ENDPOINTS.PROGRESS.SUBMISSION_HISTORY, {
      params,
    });
  },

  /**
   * Fetch daily activity data in a date range.
   */
  async getActivity(query?: ActivityFilter): Promise<ActivitySummaryDto> {
    const params: Record<string, string | number | undefined> = {};
    if (query?.startDate) params['startDate'] = query.startDate;
    if (query?.endDate) params['endDate'] = query.endDate;
    if (query?.tzOffsetMinutes !== undefined) params['tzOffsetMinutes'] = query.tzOffsetMinutes;
    return apiClient.get<ActivitySummaryDto>(ENDPOINTS.PROGRESS.ACTIVITY, { params });
  },
};
