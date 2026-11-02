/**
 * Development Service Layer
 * Abstracts tech tracks, modules, guided projects, git commits, and skills.
 */

import { envConfig } from '@/lib/config/env';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import {
  DEV_STATS,
  DEV_PROJECTS,
  DEV_TRACKS,
  DEV_MODULES,
  DEV_COMMITS,
  DEV_SKILLS,
  DEV_MILESTONES,
  DEV_TOPICS,
  DEV_HEATMAP,
  type DevProject,
  type TechTrack,
  type DevModule,
  type DevMilestone,
  type DevCommit,
  type TechSkill,
} from '@/data/development-mock';

export interface DevelopmentOverviewData {
  stats: typeof DEV_STATS;
  projects: DevProject[];
  tracks: TechTrack[];
  modules: DevModule[];
  commits: DevCommit[];
  skills: TechSkill[];
  milestones: DevMilestone[];
  topics: typeof DEV_TOPICS;
  heatmap: typeof DEV_HEATMAP;
}

export interface DevelopmentService {
  getOverview(): Promise<DevelopmentOverviewData>;
  createProject(project: Omit<DevProject, 'id'>): Promise<DevProject>;
  toggleMilestone(id: string): Promise<DevMilestone[]>;
}

class MockDevelopmentService implements DevelopmentService {
  private projects = [...DEV_PROJECTS];
  private milestones = [...DEV_MILESTONES];

  async getOverview(): Promise<DevelopmentOverviewData> {
    await new Promise((res) => setTimeout(res, 30));
    return {
      stats: DEV_STATS,
      projects: this.projects,
      tracks: DEV_TRACKS,
      modules: DEV_MODULES,
      commits: DEV_COMMITS,
      skills: DEV_SKILLS,
      milestones: this.milestones,
      topics: DEV_TOPICS,
      heatmap: DEV_HEATMAP,
    };
  }

  async createProject(project: Omit<DevProject, 'id'>): Promise<DevProject> {
    const created: DevProject = {
      ...project,
      id: `proj-${Date.now()}`,
    };
    this.projects = [created, ...this.projects];
    return created;
  }

  async toggleMilestone(id: string): Promise<DevMilestone[]> {
    this.milestones = this.milestones.map((m) =>
      m.id === id ? { ...m, done: !m.done } : m
    );
    return this.milestones;
  }
}

class ApiDevelopmentService implements DevelopmentService {
  async getOverview(): Promise<DevelopmentOverviewData> {
    return apiClient.get<DevelopmentOverviewData>(ENDPOINTS.DEVELOPMENT.TRACKS);
  }

  async createProject(project: Omit<DevProject, 'id'>): Promise<DevProject> {
    return apiClient.post<DevProject>(ENDPOINTS.DEVELOPMENT.PROJECTS, project);
  }

  async toggleMilestone(id: string): Promise<DevMilestone[]> {
    return apiClient.post<DevMilestone[]>(`${ENDPOINTS.DEVELOPMENT.ROADMAP}/${id}/toggle`);
  }
}

export const developmentService: DevelopmentService = envConfig.useMocks
  ? new MockDevelopmentService()
  : new ApiDevelopmentService();
