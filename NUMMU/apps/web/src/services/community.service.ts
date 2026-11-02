/**
 * Community Service Layer
 * Abstracts peer discussions, questions, study circles, and upvotes.
 */

import { envConfig } from '@/lib/config/env';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    college: string;
    badge?: string;
  };
  title: string;
  content: string;
  tags: string[];
  category: 'dsa' | 'development' | 'interview' | 'general';
  upvotes: number;
  repliesCount: number;
  createdAt: string;
  isUpvoted?: boolean;
}

const DUMMY_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      name: 'Aditya Sharma',
      username: 'aditya_s',
      avatar: 'A',
      college: 'IIT Delhi',
      badge: 'Guardian',
    },
    title: 'How I approached DP on Trees for Google interviews',
    content: 'Dynamic Programming on Trees is one of the most frequently asked patterns in Tier-1 technical interviews. Here is the step-by-step intuition: 1) Identify state at each node, 2) Decide post-order traversal versus pre-order...',
    tags: ['DSA', 'Dynamic Programming', 'Interview Prep', 'Google'],
    category: 'dsa',
    upvotes: 84,
    repliesCount: 19,
    createdAt: '2 hours ago',
    isUpvoted: false,
  },
  {
    id: 'post-2',
    author: {
      name: 'Priya Sundar',
      username: 'priya_code',
      avatar: 'P',
      college: 'BITS Pilani',
      badge: 'Knight',
    },
    title: 'Architecting Next.js 15 App Router with NestJS Clean Architecture',
    content: 'When scaling fullstack applications, separating the API client layer from Server Components while preserving streaming SSR gives the best UX. In this thread I break down our monorepo architecture...',
    tags: ['Next.js', 'NestJS', 'Architecture', 'TypeScript'],
    category: 'development',
    upvotes: 62,
    repliesCount: 14,
    createdAt: '5 hours ago',
    isUpvoted: true,
  },
  {
    id: 'post-3',
    author: {
      name: 'Rohit Verma',
      username: 'rohit_v',
      avatar: 'R',
      college: 'NIT Trichy',
      badge: 'Specialist',
    },
    title: 'Weekly Study Circle: System Design Case Studies (Sundays 7 PM)',
    content: 'We are organizing peer mock interviews and discussing distributed caching, rate limiters, and message queues. Join the Discord voice channel this Sunday!',
    tags: ['Study Circle', 'System Design', 'Mock Interview'],
    category: 'interview',
    upvotes: 45,
    repliesCount: 28,
    createdAt: '1 day ago',
    isUpvoted: false,
  },
];

export interface CommunityService {
  getPosts(category?: string): Promise<CommunityPost[]>;
  toggleUpvote(postId: string): Promise<CommunityPost[]>;
  createPost(post: Omit<CommunityPost, 'id' | 'upvotes' | 'repliesCount' | 'createdAt'>): Promise<CommunityPost>;
}

class MockCommunityService implements CommunityService {
  private posts = [...DUMMY_COMMUNITY_POSTS];

  async getPosts(category?: string): Promise<CommunityPost[]> {
    await new Promise((res) => setTimeout(res, 30));
    if (category && category !== 'all') {
      return this.posts.filter((p) => p.category === category);
    }
    return this.posts;
  }

  async toggleUpvote(postId: string): Promise<CommunityPost[]> {
    this.posts = this.posts.map((p) => {
      if (p.id === postId) {
        const nextUpvoted = !p.isUpvoted;
        return {
          ...p,
          isUpvoted: nextUpvoted,
          upvotes: nextUpvoted ? p.upvotes + 1 : p.upvotes - 1,
        };
      }
      return p;
    });
    return this.posts;
  }

  async createPost(post: Omit<CommunityPost, 'id' | 'upvotes' | 'repliesCount' | 'createdAt'>): Promise<CommunityPost> {
    const created: CommunityPost = {
      ...post,
      id: `post-${Date.now()}`,
      upvotes: 1,
      repliesCount: 0,
      createdAt: 'Just now',
      isUpvoted: true,
    };
    this.posts = [created, ...this.posts];
    return created;
  }
}

class ApiCommunityService implements CommunityService {
  async getPosts(category?: string): Promise<CommunityPost[]> {
    return apiClient.get<CommunityPost[]>(ENDPOINTS.COMMUNITY.POSTS, {
      params: { category },
    });
  }

  async toggleUpvote(postId: string): Promise<CommunityPost[]> {
    return apiClient.post<CommunityPost[]>(ENDPOINTS.COMMUNITY.UPVOTE(postId));
  }

  async createPost(post: Omit<CommunityPost, 'id' | 'upvotes' | 'repliesCount' | 'createdAt'>): Promise<CommunityPost> {
    return apiClient.post<CommunityPost>(ENDPOINTS.COMMUNITY.POSTS, post);
  }
}

export const communityService: CommunityService = envConfig.useMocks
  ? new MockCommunityService()
  : new ApiCommunityService();
