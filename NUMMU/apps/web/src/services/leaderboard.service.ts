/**
 * Leaderboard Service Layer
 * Abstracts global rankings, college leaderboards, tiers, and user competitive status.
 */

import { envConfig } from '@/lib/config/env';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  LEADERBOARD_USERS,
  COLLEGE_RANKINGS,
  CURRENT_USER_LEADERBOARD_STATS,
  type LeaderboardEntry,
  type CollegeRanking,
} from '@/data/leaderboard-data';

export interface LeaderboardService {
  getEntries(params?: { college?: string; search?: string }): Promise<LeaderboardEntry[]>;
  getCollegeRankings(): Promise<CollegeRanking[]>;
  getUserRank(): Promise<typeof CURRENT_USER_LEADERBOARD_STATS>;
}

class MockLeaderboardService implements LeaderboardService {
  async getEntries(params?: { college?: string; search?: string }): Promise<LeaderboardEntry[]> {
    await new Promise((res) => setTimeout(res, 30));
    let list = [...LEADERBOARD_USERS];
    if (params?.college && params.college !== 'all') {
      list = list.filter((u) => u.college.toLowerCase().includes(params.college!.toLowerCase()));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    }
    return list;
  }

  async getCollegeRankings(): Promise<CollegeRanking[]> {
    await new Promise((res) => setTimeout(res, 30));
    return COLLEGE_RANKINGS;
  }

  async getUserRank(): Promise<typeof CURRENT_USER_LEADERBOARD_STATS> {
    await new Promise((res) => setTimeout(res, 30));
    return CURRENT_USER_LEADERBOARD_STATS;
  }
}

class ApiLeaderboardService implements LeaderboardService {
  async getEntries(params?: { college?: string; search?: string }): Promise<LeaderboardEntry[]> {
    return apiClient.get<LeaderboardEntry[]>(ENDPOINTS.LEADERBOARD.GLOBAL, {
      params,
    });
  }

  async getCollegeRankings(): Promise<CollegeRanking[]> {
    return apiClient.get<CollegeRanking[]>(ENDPOINTS.LEADERBOARD.COLLEGES);
  }

  async getUserRank(): Promise<typeof CURRENT_USER_LEADERBOARD_STATS> {
    return apiClient.get<typeof CURRENT_USER_LEADERBOARD_STATS>(ENDPOINTS.LEADERBOARD.USER_RANK);
  }
}

export const leaderboardService: LeaderboardService = envConfig.useMocks
  ? new MockLeaderboardService()
  : new ApiLeaderboardService();
