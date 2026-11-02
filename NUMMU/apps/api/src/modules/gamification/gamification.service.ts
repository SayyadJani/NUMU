import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { Difficulty, SubmissionVerdict, ContentStatus, Prisma } from '@prisma/client';
import {
  GAMIFICATION_POLICY,
  LEVEL_THRESHOLDS,
  INITIAL_BADGES,
  type LevelThreshold,
} from './gamification.constants';
import type {
  GamificationSummaryDto,
  LevelProgressDto,
  StreakSummaryDto,
  BadgeItemDto,
  PaginatedBadgesResult,
  XpTransactionItemDto,
  PaginatedXpHistoryResult,
  RewardResultDto,
} from '@numu/types';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Injectable()
export class GamificationService implements OnModuleInit {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * Initializes standard badge definitions on startup if not already present.
   */
  async onModuleInit(): Promise<void> {
    try {
      for (const badge of INITIAL_BADGES) {
        await this.prisma.badgeDefinition.upsert({
          where: { slug: badge.slug },
          update: {
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            rarity: badge.rarity,
            criteriaType: badge.criteriaType,
            criteriaThreshold: badge.criteriaThreshold,
            isActive: true,
          },
          create: {
            slug: badge.slug,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            rarity: badge.rarity,
            criteriaType: badge.criteriaType,
            criteriaThreshold: badge.criteriaThreshold,
            isActive: true,
          },
        });
      }
      this.logger.log('Gamification badge definitions verified and synchronized.');
    } catch (error) {
      this.logger.warn(`Could not seed initial badge definitions: ${(error as Error).message}`);
    }
  }

  /**
   * Pure deterministic level calculation based on accumulated XP.
   */
  calculateLevel(totalXp: number): LevelProgressDto {
    const xp = Math.max(0, Math.floor(totalXp || 0));
    const thresholds = LEVEL_THRESHOLDS;
    const maxThreshold = thresholds[thresholds.length - 1]!;

    // Find highest threshold where xp >= xpRequired
    let currentThresholdIndex = 0;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (xp >= thresholds[i]!.xpRequired) {
        currentThresholdIndex = i;
        break;
      }
    }

    const currentThreshold = thresholds[currentThresholdIndex]!;
    const isMaxLevel = currentThresholdIndex >= thresholds.length - 1;

    if (isMaxLevel) {
      return {
        current: maxThreshold.level,
        currentLevelXp: maxThreshold.xpRequired,
        nextLevelXp: maxThreshold.xpRequired,
        xpIntoLevel: xp - maxThreshold.xpRequired,
        xpRemaining: 0,
        progressPercentage: 100,
        isMaxLevel: true,
      };
    }

    const nextThreshold = thresholds[currentThresholdIndex + 1]!;
    const levelSpan = nextThreshold.xpRequired - currentThreshold.xpRequired;
    const xpIntoLevel = xp - currentThreshold.xpRequired;
    const xpRemaining = Math.max(0, nextThreshold.xpRequired - xp);
    const progressPercentage = Math.min(
      100,
      Math.max(0, Math.floor((xpIntoLevel / levelSpan) * 100)),
    );

    return {
      current: currentThreshold.level,
      currentLevelXp: currentThreshold.xpRequired,
      nextLevelXp: nextThreshold.xpRequired,
      xpIntoLevel,
      xpRemaining,
      progressPercentage,
      isMaxLevel: false,
    };
  }

  /**
   * Calculates total XP aggregated from the authoritative XP transaction ledger.
   */
  async getTotalXp(userId: string): Promise<number> {
    const aggregate = await this.prisma.xpTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    });
    return aggregate._sum.amount ?? 0;
  }

  /**
   * Awards problem-solve XP to an authenticated user upon successful accepted submission.
   * Database-enforced idempotency prevents duplicate rewards for the same user and problem.
   */
  async awardSolveReward(params: {
    userId: string;
    problemId: string;
    difficulty: Difficulty;
    submissionId: string;
  }): Promise<RewardResultDto> {
    const { userId, problemId, difficulty, submissionId } = params;
    const xpAmount = GAMIFICATION_POLICY.SOLVE_XP[difficulty] ?? 10;
    const idempotencyKey = `solve:${userId}:${problemId}`;

    let transactionCreated = false;
    try {
      await this.prisma.xpTransaction.create({
        data: {
          userId,
          amount: xpAmount,
          eventType: 'PROBLEM_SOLVED',
          sourceType: 'PROBLEM',
          sourceId: problemId,
          idempotencyKey,
          policyVersion: GAMIFICATION_POLICY.VERSION,
        },
      });
      transactionCreated = true;
      this.logger.log(
        `Awarded ${xpAmount} XP to user ${userId} for solving problem ${problemId} (sub: ${submissionId})`,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // Unique constraint violation (either idempotencyKey or [userId, sourceType, sourceId, eventType])
        this.logger.debug(
          `Solve XP already awarded to user ${userId} for problem ${problemId}. Skipping duplicate.`,
        );
        const totalXp = await this.getTotalXp(userId);
        return {
          applied: false,
          alreadyRewarded: true,
          xpAwarded: 0,
          totalXp,
          newBadgesAwarded: [],
        };
      }
      this.logger.error(`Failed to create XP transaction: ${(error as Error).message}`);
      throw error;
    }

    // Trigger dependent badge eligibility checks
    let newBadgesAwarded: BadgeItemDto[] = [];
    if (transactionCreated) {
      newBadgesAwarded = await this.evaluateAndAwardBadges(userId);
    }

    const totalXp = await this.getTotalXp(userId);

    return {
      applied: true,
      alreadyRewarded: false,
      xpAwarded: xpAmount,
      totalXp,
      newBadgesAwarded,
    };
  }

  /**
   * Evaluates active badges against authoritative user state and safely awards any new badges.
   */
  async evaluateAndAwardBadges(userId: string): Promise<BadgeItemDto[]> {
    const activeBadges = await this.prisma.badgeDefinition.findMany({
      where: { isActive: true },
    });

    if (activeBadges.length === 0) return [];

    const existingAwards = await this.prisma.userBadge.findMany({
      where: { userId },
      select: { badgeId: true },
    });
    const awardedBadgeIds = new Set(existingAwards.map((a) => a.badgeId));

    // Gather current metrics for criteria evaluation
    const [solvedProblemsCount, distinctTopicsCount, activitySummary] = await Promise.all([
      // 1. Unique published problems solved
      this.prisma.submission.findMany({
        where: {
          userId,
          verdict: SubmissionVerdict.ACCEPTED,
          problem: { status: ContentStatus.PUBLISHED },
        },
        select: { problemId: true },
        distinct: ['problemId'],
      }).then((res) => res.length),

      // 2. Distinct topics with >= 1 solved problem
      this.progressService
        .getTopicProgress(userId)
        .then((tp) => tp.topics.filter((t) => t.solvedProblems > 0).length),

      // 3. User's streak summary
      this.progressService.getActivitySummary(userId, { tzOffsetMinutes: 0 }),
    ]);

    const maxStreak = Math.max(activitySummary.currentStreak, activitySummary.longestStreak);
    const newlyAwarded: BadgeItemDto[] = [];

    for (const badge of activeBadges) {
      if (awardedBadgeIds.has(badge.id)) continue;

      let currentMetric = 0;
      switch (badge.criteriaType) {
        case 'PROBLEMS_SOLVED':
          currentMetric = solvedProblemsCount;
          break;
        case 'TOPICS_COVERED':
          currentMetric = distinctTopicsCount;
          break;
        case 'STREAK_DAYS':
          currentMetric = maxStreak;
          break;
        default:
          this.logger.warn(`Unknown badge criteria type: ${badge.criteriaType}`);
          continue;
      }

      if (currentMetric >= badge.criteriaThreshold) {
        try {
          const userBadge = await this.prisma.userBadge.create({
            data: {
              userId,
              badgeId: badge.id,
            },
            include: { badge: true },
          });

          newlyAwarded.push({
            id: userBadge.badge.id,
            slug: userBadge.badge.slug,
            name: userBadge.badge.name,
            description: userBadge.badge.description,
            icon: userBadge.badge.icon,
            category: userBadge.badge.category,
            rarity: userBadge.badge.rarity,
            earned: true,
            awardedAt: userBadge.awardedAt.toISOString(),
            progress: badge.criteriaThreshold,
            maxProgress: badge.criteriaThreshold,
          });

          this.logger.log(`Awarded badge "${badge.name}" (${badge.slug}) to user ${userId}`);
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            // Already awarded concurrently
            continue;
          }
          this.logger.error(`Error awarding badge ${badge.slug}: ${(error as Error).message}`);
        }
      }
    }

    return newlyAwarded;
  }

  /**
   * Retrieves overall gamification summary: total XP, level progression, streak, and recent badges.
   */
  async getSummary(userId: string, tzOffsetMinutes = 0): Promise<GamificationSummaryDto> {
    const [totalXp, activitySummary, earnedBadges, totalAvailableBadges] = await Promise.all([
      this.getTotalXp(userId),
      this.progressService.getActivitySummary(userId, { tzOffsetMinutes }),
      this.prisma.userBadge.findMany({
        where: { userId },
        orderBy: { awardedAt: 'desc' },
        take: 4,
        include: { badge: true },
      }),
      this.prisma.badgeDefinition.count({ where: { isActive: true } }),
    ]);

    const level = this.calculateLevel(totalXp);

    // Calculate activeToday and lastActivityDate from activity summary
    let activeToday = false;
    let lastActivityDate: string | null = null;

    const daily = activitySummary.dailyActivity;
    if (daily && daily.length > 0) {
      const today = daily[daily.length - 1]!;
      activeToday = today.submissionCount > 0 || today.uniqueSolvedCount > 0;

      for (let i = daily.length - 1; i >= 0; i--) {
        const item = daily[i]!;
        if (item.submissionCount > 0 || item.uniqueSolvedCount > 0) {
          lastActivityDate = item.date;
          break;
        }
      }
    }

    const streak: StreakSummaryDto = {
      current: activitySummary.currentStreak,
      longest: activitySummary.longestStreak,
      lastActivityDate,
      activeToday,
    };

    const recentBadges: BadgeItemDto[] = earnedBadges.map((ub) => ({
      id: ub.badge.id,
      slug: ub.badge.slug,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      category: ub.badge.category,
      rarity: ub.badge.rarity,
      earned: true,
      awardedAt: ub.awardedAt.toISOString(),
      progress: ub.badge.criteriaThreshold,
      maxProgress: ub.badge.criteriaThreshold,
    }));

    return {
      xp: { total: totalXp },
      level,
      streak,
      badgesSummary: {
        totalEarned: earnedBadges.length,
        totalAvailable: totalAvailableBadges,
        recentBadges,
      },
    };
  }

  /**
   * Retrieves paginated list of badges earned by the authenticated user.
   */
  async getBadges(userId: string, query: PaginationQueryDto): Promise<PaginatedBadgesResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [userBadges, total] = await Promise.all([
      this.prisma.userBadge.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { awardedAt: 'desc' },
        include: { badge: true },
      }),
      this.prisma.userBadge.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: userBadges.map((ub) => ({
        id: ub.badge.id,
        slug: ub.badge.slug,
        name: ub.badge.name,
        description: ub.badge.description,
        icon: ub.badge.icon,
        category: ub.badge.category,
        rarity: ub.badge.rarity,
        earned: true,
        awardedAt: ub.awardedAt.toISOString(),
        progress: ub.badge.criteriaThreshold,
        maxProgress: ub.badge.criteriaThreshold,
      })),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Retrieves active badge definitions with the authenticated user's earned status and progress.
   */
  async getAvailableBadges(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedBadgesResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [badges, total, userBadges, solvedCount, topicsCount, activitySummary] = await Promise.all([
      this.prisma.badgeDefinition.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.badgeDefinition.count({ where: { isActive: true } }),
      this.prisma.userBadge.findMany({
        where: { userId },
        select: { badgeId: true, awardedAt: true },
      }),
      this.prisma.submission.findMany({
        where: {
          userId,
          verdict: SubmissionVerdict.ACCEPTED,
          problem: { status: ContentStatus.PUBLISHED },
        },
        select: { problemId: true },
        distinct: ['problemId'],
      }).then((res) => res.length),
      this.progressService
        .getTopicProgress(userId)
        .then((tp) => tp.topics.filter((t) => t.solvedProblems > 0).length),
      this.progressService.getActivitySummary(userId, { tzOffsetMinutes: 0 }),
    ]);

    const earnedMap = new Map<string, string>();
    for (const ub of userBadges) {
      earnedMap.set(ub.badgeId, ub.awardedAt.toISOString());
    }

    const maxStreak = Math.max(activitySummary.currentStreak, activitySummary.longestStreak);

    const items: BadgeItemDto[] = badges.map((b) => {
      const awardedAt = earnedMap.get(b.id) ?? null;
      const earned = awardedAt !== null;

      let metric = 0;
      switch (b.criteriaType) {
        case 'PROBLEMS_SOLVED':
          metric = solvedCount;
          break;
        case 'TOPICS_COVERED':
          metric = topicsCount;
          break;
        case 'STREAK_DAYS':
          metric = maxStreak;
          break;
        default:
          metric = 0;
      }

      const progress = earned ? b.criteriaThreshold : Math.min(metric, b.criteriaThreshold);

      return {
        id: b.id,
        slug: b.slug,
        name: b.name,
        description: b.description,
        icon: b.icon,
        category: b.category,
        rarity: b.rarity,
        earned,
        awardedAt,
        progress,
        maxProgress: b.criteriaThreshold,
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Retrieves paginated XP transaction ledger history for the authenticated user.
   */
  async getXpHistory(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedXpHistoryResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.xpTransaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.xpTransaction.count({ where: { userId } }),
    ]);

    // Pre-fetch problem titles for friendly descriptions
    const problemIds = transactions
      .filter((t) => t.sourceType === 'PROBLEM')
      .map((t) => t.sourceId);

    const problems = await this.prisma.problem.findMany({
      where: { id: { in: problemIds } },
      select: { id: true, title: true, difficulty: true },
    });
    const problemMap = new Map<string, { title: string; difficulty: string }>();
    for (const p of problems) {
      problemMap.set(p.id, { title: p.title, difficulty: p.difficulty });
    }

    const items: XpTransactionItemDto[] = transactions.map((t) => {
      let description = 'XP Reward';
      if (t.sourceType === 'PROBLEM') {
        const prob = problemMap.get(t.sourceId);
        if (prob) {
          description = `Solved "${prob.title}" (${prob.difficulty})`;
        } else {
          description = 'Solved DSA Problem';
        }
      }

      return {
        id: t.id,
        amount: t.amount,
        eventType: t.eventType,
        sourceType: t.sourceType,
        sourceId: t.sourceId,
        description,
        createdAt: t.createdAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }
}
