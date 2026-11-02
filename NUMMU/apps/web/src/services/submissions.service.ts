/**
 * Submissions Service for NUMU Web Application
 * Connects directly to verified NestJS backend /submissions endpoints via apiClient.
 */

import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  SubmitCodeInput,
  RunCodeInput,
  RunResult,
  SubmissionDetail,
  PaginatedSubmissionsResult,
  SubmissionQuery,
} from '@numu/types';

export const submissionsService = {
  /**
   * Run code against sample or custom test cases.
   */
  async runCode(payload: RunCodeInput): Promise<RunResult> {
    return apiClient.post<RunResult>(ENDPOINTS.SUBMISSIONS.RUN, payload, { timeoutMs: 60000 });
  },

  /**
   * Submit code for full evaluation against hidden test cases.
   */
  async submitCode(payload: SubmitCodeInput): Promise<SubmissionDetail> {
    return apiClient.post<SubmissionDetail>(ENDPOINTS.SUBMISSIONS.SUBMIT, payload, { timeoutMs: 60000 });
  },

  /**
   * Retrieve submission by ID with execution verdict and statistics.
   */
  async getSubmissionById(id: string): Promise<SubmissionDetail> {
    return apiClient.get<SubmissionDetail>(ENDPOINTS.SUBMISSIONS.BY_ID(id));
  },

  /**
   * Retrieve submission history for the authenticated user.
   */
  async getSubmissions(query?: SubmissionQuery): Promise<PaginatedSubmissionsResult> {
    const params: Record<string, string | number | undefined> = {};
    if (query?.page) params['page'] = query.page;
    if (query?.limit) params['limit'] = query.limit;
    if (query?.problemSlug) params['problemSlug'] = query.problemSlug;
    if (query?.verdict) params['verdict'] = query.verdict;

    return apiClient.get<PaginatedSubmissionsResult>(ENDPOINTS.SUBMISSIONS.LIST, { params });
  },
};
