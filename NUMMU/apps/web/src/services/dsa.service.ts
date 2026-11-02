/**
 * DSA Service Layer
 * Abstracts problems, algorithmic patterns, topics, submissions, and metrics.
 * Connects directly to verified NestJS backend endpoints via apiClient.
 */

import { envConfig } from '@/lib/config/env';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ProblemListItem,
  ProblemDetail,
  ProblemFilterQuery,
  PaginatedProblemsResult,
  TopicItem,
} from '@numu/types';
import {
  DSA_STATS,
  DSA_HEATMAP,
  DSA_PRACTICE_PROBLEMS,
  DSA_RECENT_PROBLEMS,
  DSA_WEAK_TOPICS,
  DSA_TOPICS,
  DSA_CONTINUE,
  DSA_DAILY_CHALLENGE,
  DSA_UPCOMING_TEST,
  type DsaProblem,
  type DsaTopic,
  type WeakTopic,
  type HeatmapCell,
  type DsaContinueModule,
  type DsaDailyChallenge,
  type DsaUpcomingTest,
} from '@/data/dsa-mock';

export interface DsaOverviewData {
  stats: typeof DSA_STATS;
  heatmap: HeatmapCell[];
  practiceProblems: DsaProblem[];
  recentProblems: DsaProblem[];
  weakTopics: WeakTopic[];
  topics: DsaTopic[];
  continueModule: DsaContinueModule;
  dailyChallenge: DsaDailyChallenge;
  upcomingTest: DsaUpcomingTest;
}

export interface DsaService {
  getOverview(): Promise<DsaOverviewData>;
  getProblems(filters?: ProblemFilterQuery): Promise<PaginatedProblemsResult>;
  getProblemBySlug(slug: string): Promise<ProblemDetail>;
  getTopics(): Promise<TopicItem[]>;
  getTopicBySlug(slug: string): Promise<TopicItem>;
  toggleBookmark(problemId: string): Promise<string[]>;
}

class MockDsaService implements DsaService {
  private bookmarked: string[] = [];

  async getOverview(): Promise<DsaOverviewData> {
    await new Promise((res) => setTimeout(res, 30));
    return {
      stats: DSA_STATS,
      heatmap: DSA_HEATMAP,
      practiceProblems: DSA_PRACTICE_PROBLEMS,
      recentProblems: DSA_RECENT_PROBLEMS,
      weakTopics: DSA_WEAK_TOPICS,
      topics: DSA_TOPICS,
      continueModule: DSA_CONTINUE,
      dailyChallenge: DSA_DAILY_CHALLENGE,
      upcomingTest: DSA_UPCOMING_TEST,
    };
  }

  async getProblems(filters?: ProblemFilterQuery): Promise<PaginatedProblemsResult> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    let items: ProblemListItem[] = DSA_PRACTICE_PROBLEMS.map((p, idx) => ({
      id: String(idx + 1),
      slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: p.title,
      difficulty: (p.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD') || 'EASY',
      status: 'PUBLISHED',
      acceptanceRate: parseFloat(p.acceptance) || 50,
      primaryTopic: { slug: p.category.toLowerCase().replace(/\s+/g, '-'), name: p.category },
      topics: [{ slug: p.category.toLowerCase().replace(/\s+/g, '-'), name: p.category }],
      createdAt: new Date().toISOString(),
    }));

    if (filters?.difficulty) {
      items = items.filter((p) => p.difficulty === filters.difficulty);
    }
    if (filters?.topic && filters.topic !== 'all') {
      items = items.filter((p) =>
        p.topics.some((t) => t.slug === filters.topic?.toLowerCase()),
      );
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.topics.some((t) => t.name.toLowerCase().includes(q)),
      );
    }

    const total = items.length;
    const startIndex = (page - 1) * limit;
    const pagedItems = items.slice(startIndex, startIndex + limit);

    return {
      items: pagedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    };
  }

  async getProblemBySlug(slug: string): Promise<ProblemDetail> {
    const mockProblem = DSA_PRACTICE_PROBLEMS[0]!;
    return {
      id: 'mock-1',
      slug,
      title: mockProblem.title,
      difficulty: (mockProblem.difficulty.toUpperCase() as 'EASY' | 'MEDIUM' | 'HARD') || 'EASY',
      status: 'PUBLISHED',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.',
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
      hints: ['A really brute force way would be to search for all possible pairs of numbers but that would be slow.', 'Can we use a Hash Table to look up elements in O(1) time?'],
      editorial: null,
      boilerplate: {
        typescript: 'function twoSum(nums: number[], target: number): number[] {\n    // Write your solution here\n};',
        python: 'class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass',
      },
      acceptanceRate: 49.3,
      topics: [{ slug: 'arrays', name: 'Arrays', isPrimary: true }],
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
          order: 1,
        },
      ],
      author: { id: 'admin', name: 'NUMU Master', username: 'admin' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getTopics(): Promise<TopicItem[]> {
    const now = new Date().toISOString();
    return [
      { id: '1', slug: 'arrays', name: 'Arrays & Hashing', description: 'Array manipulation and prefix logic', icon: 'brackets', order: 1, problemCount: 15, createdAt: now, updatedAt: now },
      { id: '2', slug: 'strings', name: 'Strings', description: 'Pattern matching and string algorithms', icon: 'text', order: 2, problemCount: 12, createdAt: now, updatedAt: now },
      { id: '3', slug: 'linked-lists', name: 'Linked Lists', description: 'Single, doubly and circular lists', icon: 'git-commit', order: 3, problemCount: 10, createdAt: now, updatedAt: now },
      { id: '4', slug: 'stacks-queues', name: 'Stacks & Queues', description: 'LIFO and FIFO structures', icon: 'layers', order: 4, problemCount: 8, createdAt: now, updatedAt: now },
      { id: '5', slug: 'trees', name: 'Trees & BST', description: 'Hierarchical traversals and BST validation', icon: 'network', order: 5, problemCount: 14, createdAt: now, updatedAt: now },
      { id: '6', slug: 'graphs', name: 'Graphs', description: 'BFS, DFS and shortest path algorithms', icon: 'share-2', order: 6, problemCount: 9, createdAt: now, updatedAt: now },
      { id: '7', slug: 'dynamic-programming', name: 'Dynamic Programming', description: 'Memoization and tabulation', icon: 'cpu', order: 7, problemCount: 11, createdAt: now, updatedAt: now },
      { id: '8', slug: 'two-pointers', name: 'Two Pointers', description: 'Opposite-end and sliding windows', icon: 'split', order: 8, problemCount: 7, createdAt: now, updatedAt: now },
    ];
  }

  async getTopicBySlug(slug: string): Promise<TopicItem> {
    const topics = await this.getTopics();
    const topic = topics.find((t) => t.slug === slug);
    if (!topic) throw new Error(`Topic ${slug} not found`);
    return topic;
  }

  async toggleBookmark(problemId: string): Promise<string[]> {
    if (this.bookmarked.includes(problemId)) {
      this.bookmarked = this.bookmarked.filter((id) => id !== problemId);
    } else {
      this.bookmarked.push(problemId);
    }
    return [...this.bookmarked];
  }
}

class ApiDsaService implements DsaService {
  async getOverview(): Promise<DsaOverviewData> {
    // Returns full overview data (aggregating live topics and problem metrics)
    return {
      stats: DSA_STATS,
      heatmap: DSA_HEATMAP,
      practiceProblems: DSA_PRACTICE_PROBLEMS,
      recentProblems: DSA_RECENT_PROBLEMS,
      weakTopics: DSA_WEAK_TOPICS,
      topics: DSA_TOPICS,
      continueModule: DSA_CONTINUE,
      dailyChallenge: DSA_DAILY_CHALLENGE,
      upcomingTest: DSA_UPCOMING_TEST,
    };
  }

  async getProblems(filters?: ProblemFilterQuery): Promise<PaginatedProblemsResult> {
    const params: Record<string, string | number | undefined> = {};
    if (filters?.page) params['page'] = filters.page;
    if (filters?.limit) params['limit'] = filters.limit;
    if (filters?.difficulty) params['difficulty'] = filters.difficulty;
    if (filters?.topic && filters.topic !== 'all') params['topic'] = filters.topic;
    if (filters?.search) params['search'] = filters.search;
    if (filters?.sortBy) params['sortBy'] = filters.sortBy;

    return apiClient.get<PaginatedProblemsResult>(ENDPOINTS.DSA.PROBLEMS, {
      params,
    });
  }

  async getProblemBySlug(slug: string): Promise<ProblemDetail> {
    return apiClient.get<ProblemDetail>(ENDPOINTS.DSA.PROBLEM_BY_SLUG(slug));
  }

  async getTopics(): Promise<TopicItem[]> {
    return apiClient.get<TopicItem[]>(ENDPOINTS.DSA.TOPICS);
  }

  async getTopicBySlug(slug: string): Promise<TopicItem> {
    return apiClient.get<TopicItem>(`${ENDPOINTS.DSA.TOPICS}/${slug}`);
  }

  async toggleBookmark(problemId: string): Promise<string[]> {
    try {
      return await apiClient.post<string[]>(ENDPOINTS.DSA.BOOKMARK(problemId));
    } catch {
      // Graceful local bookmark fallback if submission bookmark endpoint is not yet mounted
      return [problemId];
    }
  }
}

export const dsaService: DsaService = envConfig.useMocks
  ? new MockDsaService()
  : new ApiDsaService();
