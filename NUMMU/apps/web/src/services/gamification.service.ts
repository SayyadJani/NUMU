import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  GamificationSummaryDto,
  PaginatedBadgesResult,
  PaginatedXpHistoryResult,
} from '@numu/types';

export interface PaginationFilter {
  page?: number;
  limit?: number;
}

export const gamificationService = {
  /**
   * Fetch authenticated user's gamification summary (XP, Level progress, Streaks, Recent Badges).
   */
  async getSummary(tzOffsetMinutes?: number): Promise<GamificationSummaryDto> {
    const params: Record<string, number | undefined> = {};
    if (tzOffsetMinutes !== undefined) {
      params['tzOffsetMinutes'] = tzOffsetMinutes;
    } else {
      // Browser timezone offset in minutes from UTC
      params['tzOffsetMinutes'] = new Date().getTimezoneOffset();
    }
    return apiClient.get<GamificationSummaryDto>(ENDPOINTS.GAMIFICATION.SUMMARY, { params });
  },

  /**
   * Fetch user's earned badges.
   */
  async getBadges(query?: PaginationFilter): Promise<PaginatedBadgesResult> {
    const params: Record<string, number | undefined> = {};
    if (query?.page) params['page'] = query.page;
    if (query?.limit) params['limit'] = query.limit;
    return apiClient.get<PaginatedBadgesResult>(ENDPOINTS.GAMIFICATION.BADGES, { params });
  },

  /**
   * Fetch all active badge definitions with earned status and progress.
   */
  async getAvailableBadges(query?: PaginationFilter): Promise<PaginatedBadgesResult> {
    const params: Record<string, number | undefined> = {};
    if (query?.page) params['page'] = query.page;
    if (query?.limit) params['limit'] = query.limit;
    return apiClient.get<PaginatedBadgesResult>(ENDPOINTS.GAMIFICATION.AVAILABLE_BADGES, { params });
  },

  /**
   * Fetch user's XP transaction ledger history.
   */
  async getXpHistory(query?: PaginationFilter): Promise<PaginatedXpHistoryResult> {
    const params: Record<string, number | undefined> = {};
    if (query?.page) params['page'] = query.page;
    if (query?.limit) params['limit'] = query.limit;
    return apiClient.get<PaginatedXpHistoryResult>(ENDPOINTS.GAMIFICATION.XP_HISTORY, { params });
  },
};
