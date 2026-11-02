/**
 * Bookmarks Service Layer
 * Abstracts saved problems, project roadmaps, and saved articles.
 */

import { envConfig } from '@/lib/config/env';
import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export interface BookmarkItem {
  id: string;
  type: 'problem' | 'project' | 'pattern' | 'note';
  title: string;
  subtitle: string;
  tag: string;
  tagColor?: string;
  href: string;
  savedAt: string;
}

const DUMMY_BOOKMARKS: BookmarkItem[] = [
  {
    id: 'bm-1',
    type: 'problem',
    title: 'Container With Most Water',
    subtitle: 'Two Pointers technique for area maximization',
    tag: 'Medium',
    tagColor: 'bg-amber-50 text-amber-700',
    href: '/dashboard/dsa/problems',
    savedAt: 'Yesterday',
  },
  {
    id: 'bm-2',
    type: 'pattern',
    title: 'Sliding Window — Maximum Subarray Sum',
    subtitle: 'Fixed and variable size window pattern guide',
    tag: 'Pattern Guide',
    tagColor: 'bg-emerald-50 text-emerald-700',
    href: '/dashboard/dsa/patterns',
    savedAt: '3 days ago',
  },
  {
    id: 'bm-3',
    type: 'project',
    title: 'Distributed Rate Limiter in Node.js & Redis',
    subtitle: 'Sliding window log algorithm with token bucket fallback',
    tag: 'Fullstack Capstone',
    tagColor: 'bg-blue-50 text-blue-700',
    href: '/dashboard/development',
    savedAt: 'Sep 12',
  },
  {
    id: 'bm-4',
    type: 'problem',
    title: 'Course Schedule (Topological Sort / Kahn Algorithm)',
    subtitle: 'Detecting cycles and dependencies in directed graphs',
    tag: 'Medium',
    tagColor: 'bg-amber-50 text-amber-700',
    href: '/dashboard/dsa/problems',
    savedAt: 'Sep 08',
  },
];

export interface BookmarksService {
  getBookmarks(type?: string): Promise<BookmarkItem[]>;
  removeBookmark(id: string): Promise<BookmarkItem[]>;
}

class MockBookmarksService implements BookmarksService {
  private bookmarks = [...DUMMY_BOOKMARKS];

  async getBookmarks(type?: string): Promise<BookmarkItem[]> {
    await new Promise((res) => setTimeout(res, 30));
    if (type && type !== 'all') {
      return this.bookmarks.filter((b) => b.type === type);
    }
    return this.bookmarks;
  }

  async removeBookmark(id: string): Promise<BookmarkItem[]> {
    this.bookmarks = this.bookmarks.filter((b) => b.id !== id);
    return this.bookmarks;
  }
}

class ApiBookmarksService implements BookmarksService {
  async getBookmarks(type?: string): Promise<BookmarkItem[]> {
    return apiClient.get<BookmarkItem[]>(ENDPOINTS.BOOKMARKS.LIST, {
      params: { type },
    });
  }

  async removeBookmark(id: string): Promise<BookmarkItem[]> {
    return apiClient.delete<BookmarkItem[]>(ENDPOINTS.BOOKMARKS.REMOVE(id));
  }
}

export const bookmarksService: BookmarksService = envConfig.useMocks
  ? new MockBookmarksService()
  : new ApiBookmarksService();
