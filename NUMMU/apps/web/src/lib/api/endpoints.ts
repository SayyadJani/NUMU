/**
 * Central Catalog of Backend API Endpoints (NestJS Target)
 * All frontend API calls reference these constants to guarantee consistency.
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    STATS: '/dashboard/stats',
    DAILY_CHALLENGE: '/dashboard/daily-challenge',
    TASKS: '/dashboard/tasks',
    ACTIVITY: '/dashboard/activity',
  },
  DSA: {
    TOPICS: '/topics',
    PROBLEMS: '/problems',
    PROBLEM_BY_SLUG: (slug: string) => `/problems/${slug}`,
    PROBLEM_BY_ID: (id: string) => `/problems/${id}`,
    PATTERNS: '/dsa/patterns',
    SUBMIT: '/submissions',
    RUN: '/submissions/run',
    BOOKMARK: (id: string) => `/dsa/problems/${id}/bookmark`,
  },
  SUBMISSIONS: {
    RUN: '/submissions/run',
    SUBMIT: '/submissions',
    BY_ID: (id: string) => `/submissions/${id}`,
    LIST: '/submissions',
  },
  PROGRESS: {
    OVERVIEW: '/progress/overview',
    BY_TOPIC: '/progress/by-topic',
    BY_PATTERN: '/progress/by-pattern',
    SOLVED_PROBLEMS: '/progress/solved-problems',
    SUBMISSION_HISTORY: '/progress/submission-history',
    ACTIVITY: '/progress/activity',
  },
  GAMIFICATION: {
    SUMMARY: '/gamification/summary',
    BADGES: '/gamification/badges',
    AVAILABLE_BADGES: '/gamification/badges/available',
    XP_HISTORY: '/gamification/xp-history',
  },
  DEVELOPMENT: {
    TRACKS: '/development/tracks',
    TRACK_BY_ID: (id: string) => `/development/tracks/${id}`,
    MODULES: '/development/modules',
    PROJECTS: '/development/projects',
    ROADMAP: '/development/roadmap',
  },
  TESTS: {
    LIST: '/tests',
    BY_ID: (id: string) => `/tests/${id}`,
    SUBMIT: (id: string) => `/tests/${id}/submit`,
    RESULTS: (id: string) => `/tests/${id}/results`,
  },
  LEADERBOARD: {
    GLOBAL: '/leaderboard/global',
    COLLEGES: '/leaderboard/colleges',
    USER_RANK: '/leaderboard/me',
  },
  PROFILE: {
    GET_USER: (username: string) => `/profile/${username}`,
    UPDATE: '/profile/me',
    FOLLOW: (username: string) => `/profile/${username}/follow`,
    PROJECTS: (username: string) => `/profile/${username}/projects`,
    ACHIEVEMENTS: (username: string) => `/profile/${username}/achievements`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },
  COMMUNITY: {
    POSTS: '/community/posts',
    POST_BY_ID: (id: string) => `/community/posts/${id}`,
    UPVOTE: (id: string) => `/community/posts/${id}/upvote`,
  },
  BOOKMARKS: {
    LIST: '/bookmarks',
    REMOVE: (id: string) => `/bookmarks/${id}`,
  },
  NOTES: {
    LIST: '/notes',
    BY_ID: (id: string) => `/notes/${id}`,
    CREATE: '/notes',
    UPDATE: (id: string) => `/notes/${id}`,
    DELETE: (id: string) => `/notes/${id}`,
    TOGGLE_PIN: (id: string) => `/notes/${id}/pin`,
  },
} as const;
