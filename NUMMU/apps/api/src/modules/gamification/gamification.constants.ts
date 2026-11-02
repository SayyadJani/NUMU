import { Difficulty } from '@prisma/client';

export const GAMIFICATION_POLICY = {
  VERSION: '1.0',
  SOLVE_XP: {
    [Difficulty.EASY]: 10,
    [Difficulty.MEDIUM]: 20,
    [Difficulty.HARD]: 30,
  },
  DAILY_ACTIVITY_BONUS: 0,
  BADGE_AWARD_BONUS: 0,
} as const;

export interface LevelThreshold {
  level: number;
  xpRequired: number;
}

/**
 * Deterministic milestone-based progression curve.
 * Monotonically increasing, positive XP requirements.
 */
export const LEVEL_THRESHOLDS: readonly LevelThreshold[] = [
  { level: 1, xpRequired: 0 },
  { level: 2, xpRequired: 100 },
  { level: 3, xpRequired: 250 },
  { level: 4, xpRequired: 450 },
  { level: 5, xpRequired: 700 },
  { level: 6, xpRequired: 1000 },
  { level: 7, xpRequired: 1400 },
  { level: 8, xpRequired: 1900 },
  { level: 9, xpRequired: 2500 },
  { level: 10, xpRequired: 3200 },
] as const;

export interface InitialBadgeSeed {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: 'Milestone' | 'Streak' | 'Topic';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  criteriaType: 'PROBLEMS_SOLVED' | 'TOPICS_COVERED' | 'STREAK_DAYS';
  criteriaThreshold: number;
}

export const INITIAL_BADGES: readonly InitialBadgeSeed[] = [
  {
    slug: 'first-solve',
    name: 'First Problem',
    description: 'Submitted and accepted your very first problem solution.',
    icon: '🛡️',
    category: 'Milestone',
    rarity: 'Common',
    criteriaType: 'PROBLEMS_SOLVED',
    criteriaThreshold: 1,
  },
  {
    slug: 'problem-solver',
    name: '10 Problems Solver',
    description: 'Successfully cracked 10 competitive DSA problems.',
    icon: '💯',
    category: 'Milestone',
    rarity: 'Rare',
    criteriaType: 'PROBLEMS_SOLVED',
    criteriaThreshold: 10,
  },
  {
    slug: 'dedicated-coder',
    name: 'Dedicated Coder',
    description: 'Reach a milestone of 25 solved problems.',
    icon: '🏆',
    category: 'Milestone',
    rarity: 'Epic',
    criteriaType: 'PROBLEMS_SOLVED',
    criteriaThreshold: 25,
  },
  {
    slug: 'streak-warrior',
    name: '7-Day Streak Warrior',
    description: 'Practice consistently every single day for a week.',
    icon: '🔥',
    category: 'Streak',
    rarity: 'Rare',
    criteriaType: 'STREAK_DAYS',
    criteriaThreshold: 7,
  },
  {
    slug: 'centurion-streak',
    name: 'Centurion Streak (30 Days)',
    description: 'Solve problems consecutively for 30 days in a row.',
    icon: '⚡',
    category: 'Streak',
    rarity: 'Legendary',
    criteriaType: 'STREAK_DAYS',
    criteriaThreshold: 30,
  },
  {
    slug: 'dsa-explorer',
    name: 'DSA Explorer',
    description: 'Solve problems across at least 3 distinct DSA topics.',
    icon: '🌟',
    category: 'Topic',
    rarity: 'Rare',
    criteriaType: 'TOPICS_COVERED',
    criteriaThreshold: 3,
  },
] as const;
