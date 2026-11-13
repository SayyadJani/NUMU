import { apiClient } from '@/lib/api/api-client';

export interface DailyChallengeResponse {
  id?: string;
  date?: string;
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    acceptanceRate?: number;
    topics?: { topic: { id: string; name: string; slug: string } }[];
  };
  xpBonus: number;
  instructions?: string;
  isSolved: boolean;
}

export interface CuratedPracticeItem {
  id: string;
  orderIndex: number;
  isPinned: boolean;
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    acceptanceRate?: number;
    topics?: { topic: { id: string; name: string; slug: string } }[];
  };
  isSolved: boolean;
}

export class PracticeService {
  async getDailyChallenge(): Promise<DailyChallengeResponse | null> {
    try {
      return await apiClient.get<DailyChallengeResponse>('/practice/dsa/daily-challenge');
    } catch {
      return null;
    }
  }

  async getCuratedPractice(): Promise<CuratedPracticeItem[]> {
    try {
      const data = await apiClient.get<CuratedPracticeItem[]>('/practice/dsa/curated');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async getDevelopmentTracks(): Promise<any[]> {
    try {
      const data = await apiClient.get<any[]>('/practice/development/tracks');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async getSystemDesignTopics(): Promise<any[]> {
    try {
      const data = await apiClient.get<any[]>('/practice/system-design/topics');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async getCoreSubjects(): Promise<any[]> {
    try {
      const data = await apiClient.get<any[]>('/practice/core/subjects');
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }
}

export const practiceService = new PracticeService();

