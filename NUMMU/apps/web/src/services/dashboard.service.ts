/**
 * Dashboard Service Layer
 * Abstracts dashboard overview, metrics, tasks, and recommendations.
 */

import { envConfig } from '@/lib/config/env';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  DUMMY_USER_PROFILE,
  DUMMY_STATS,
  DUMMY_HEATMAP_DAYS,
  INITIAL_TASKS,
  DUMMY_GOALS,
  DUMMY_RECOMMENDED_PROBLEMS,
  DUMMY_ACTIVITIES,
  DUMMY_CONTINUE_MODULE,
  type DashboardTask,
  type DashboardProblem,
  type ActivityDay,
} from '@/data/dashboard-mock';

export interface DashboardOverview {
  user: typeof DUMMY_USER_PROFILE;
  stats: typeof DUMMY_STATS;
  activityDays: ActivityDay[];
  tasks: DashboardTask[];
  goals: typeof DUMMY_GOALS;
  recommendedProblems: DashboardProblem[];
  recentActivities: typeof DUMMY_ACTIVITIES;
  continueModule: typeof DUMMY_CONTINUE_MODULE;
}

export interface DashboardService {
  getOverview(): Promise<DashboardOverview>;
  toggleTask(taskId: string): Promise<DashboardTask[]>;
  toggleBookmark(problemId: string): Promise<DashboardProblem[]>;
}

class MockDashboardService implements DashboardService {
  private tasks = [...INITIAL_TASKS];
  private problems = [...DUMMY_RECOMMENDED_PROBLEMS];

  async getOverview(): Promise<DashboardOverview> {
    await new Promise((res) => setTimeout(res, 30));
    return {
      user: DUMMY_USER_PROFILE,
      stats: DUMMY_STATS,
      activityDays: DUMMY_HEATMAP_DAYS,
      tasks: this.tasks,
      goals: DUMMY_GOALS,
      recommendedProblems: this.problems,
      recentActivities: DUMMY_ACTIVITIES,
      continueModule: DUMMY_CONTINUE_MODULE,
    };
  }

  async toggleTask(taskId: string): Promise<DashboardTask[]> {
    this.tasks = this.tasks.map((t) =>
      t.id === taskId ? { ...t, done: !t.done } : t
    );
    return this.tasks;
  }

  async toggleBookmark(problemId: string): Promise<DashboardProblem[]> {
    this.problems = this.problems.map((p) =>
      p.id === problemId ? { ...p, isBookmarked: !p.isBookmarked } : p
    );
    return this.problems;
  }
}

class ApiDashboardService implements DashboardService {
  async getOverview(): Promise<DashboardOverview> {
    return apiClient.get<DashboardOverview>(ENDPOINTS.DASHBOARD.OVERVIEW);
  }

  async toggleTask(taskId: string): Promise<DashboardTask[]> {
    return apiClient.post<DashboardTask[]>(`${ENDPOINTS.DASHBOARD.TASKS}/${taskId}/toggle`);
  }

  async toggleBookmark(problemId: string): Promise<DashboardProblem[]> {
    return apiClient.post<DashboardProblem[]>(ENDPOINTS.DSA.BOOKMARK(problemId));
  }
}

export const dashboardService: DashboardService = envConfig.useMocks
  ? new MockDashboardService()
  : new ApiDashboardService();
