/**
 * Gamification, XP ledger, level progression, streak and badge types.
 * Standard contracts shared between @numu/api and @numu/web.
 */

export interface LevelProgressDto {
  current: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpRemaining: number;
  progressPercentage: number;
  isMaxLevel: boolean;
}

export interface StreakSummaryDto {
  current: number;
  longest: number;
  lastActivityDate: string | null;
  activeToday: boolean;
}

export interface BadgeItemDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  earned: boolean;
  awardedAt: string | null;
  progress: number;
  maxProgress: number;
}

export interface GamificationSummaryDto {
  xp: {
    total: number;
  };
  level: LevelProgressDto;
  streak: StreakSummaryDto;
  badgesSummary: {
    totalEarned: number;
    totalAvailable: number;
    recentBadges: BadgeItemDto[];
  };
}

export interface PaginatedBadgesResult {
  items: BadgeItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface XpTransactionItemDto {
  id: string;
  amount: number;
  eventType: string;
  sourceType: string;
  sourceId: string;
  description: string;
  createdAt: string;
}

export interface PaginatedXpHistoryResult {
  items: XpTransactionItemDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface RewardResultDto {
  applied: boolean;
  alreadyRewarded: boolean;
  xpAwarded: number;
  totalXp: number;
  newBadgesAwarded: BadgeItemDto[];
}
