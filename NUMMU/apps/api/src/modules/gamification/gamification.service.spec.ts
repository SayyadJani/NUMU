import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { Difficulty, Prisma } from '@prisma/client';
import { GAMIFICATION_POLICY } from './gamification.constants';

describe('GamificationService', () => {
  let service: GamificationService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let progressService: Record<string, jest.Mock>;

  beforeEach(async () => {
    prisma = {
      xpTransaction: {
        create: jest.fn(),
        aggregate: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      badgeDefinition: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      userBadge: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      submission: {
        findMany: jest.fn(),
      },
      problem: {
        findMany: jest.fn(),
      },
    };

    progressService = {
      getActivitySummary: jest.fn(),
      getTopicProgress: jest.fn().mockResolvedValue({ topics: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: ProgressService, useValue: progressService },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  describe('Level Progression Logic', () => {
    it('should correctly calculate Level 1 for 0 XP', () => {
      const res = service.calculateLevel(0);
      expect(res.current).toBe(1);
      expect(res.currentLevelXp).toBe(0);
      expect(res.nextLevelXp).toBe(100);
      expect(res.xpIntoLevel).toBe(0);
      expect(res.xpRemaining).toBe(100);
      expect(res.progressPercentage).toBe(0);
      expect(res.isMaxLevel).toBe(false);
    });

    it('should handle negative XP safely by clamping to 0', () => {
      const res = service.calculateLevel(-50);
      expect(res.current).toBe(1);
      expect(res.progressPercentage).toBe(0);
    });

    it('should calculate Level 1 at 99 XP (one below threshold)', () => {
      const res = service.calculateLevel(99);
      expect(res.current).toBe(1);
      expect(res.currentLevelXp).toBe(0);
      expect(res.nextLevelXp).toBe(100);
      expect(res.xpIntoLevel).toBe(99);
      expect(res.xpRemaining).toBe(1);
      expect(res.progressPercentage).toBe(99);
      expect(res.isMaxLevel).toBe(false);
    });

    it('should calculate Level 2 at exactly 100 XP (exact threshold)', () => {
      const res = service.calculateLevel(100);
      expect(res.current).toBe(2);
      expect(res.currentLevelXp).toBe(100);
      expect(res.nextLevelXp).toBe(250);
      expect(res.xpIntoLevel).toBe(0);
      expect(res.xpRemaining).toBe(150);
      expect(res.progressPercentage).toBe(0);
      expect(res.isMaxLevel).toBe(false);
    });

    it('should calculate Level 2 at 101 XP (one above threshold)', () => {
      const res = service.calculateLevel(101);
      expect(res.current).toBe(2);
      expect(res.currentLevelXp).toBe(100);
      expect(res.nextLevelXp).toBe(250);
      expect(res.xpIntoLevel).toBe(1);
      expect(res.xpRemaining).toBe(149);
      expect(res.progressPercentage).toBe(0); // 1 / 150 = 0%
    });

    it('should calculate intermediate progress accurately (Level 4: 450-700 XP)', () => {
      // Span is 700 - 450 = 250 XP. At 575 XP, into level is 125 XP = exactly 50%
      const res = service.calculateLevel(575);
      expect(res.current).toBe(4);
      expect(res.currentLevelXp).toBe(450);
      expect(res.nextLevelXp).toBe(700);
      expect(res.xpIntoLevel).toBe(125);
      expect(res.xpRemaining).toBe(125);
      expect(res.progressPercentage).toBe(50);
      expect(res.isMaxLevel).toBe(false);
    });

    it('should handle Max Level (Level 10 at 3200+ XP) without division by zero', () => {
      const res = service.calculateLevel(3500);
      expect(res.current).toBe(10);
      expect(res.currentLevelXp).toBe(3200);
      expect(res.nextLevelXp).toBe(3200);
      expect(res.xpIntoLevel).toBe(300);
      expect(res.xpRemaining).toBe(0);
      expect(res.progressPercentage).toBe(100);
      expect(res.isMaxLevel).toBe(true);
    });
  });

  describe('awardSolveReward', () => {
    it('should award 10 XP for Easy, 20 XP for Medium, 30 XP for Hard problem solves', async () => {
      prisma.xpTransaction.create.mockResolvedValue({ id: 'tx-1', amount: 10 });
      prisma.badgeDefinition.findMany.mockResolvedValue([]);
      prisma.userBadge.findMany.mockResolvedValue([]);
      prisma.xpTransaction.aggregate.mockResolvedValue({ _sum: { amount: 10 } });

      const easyRes = await service.awardSolveReward({
        userId: 'u1',
        problemId: 'p-easy',
        difficulty: Difficulty.EASY,
        submissionId: 's1',
      });

      expect(easyRes.applied).toBe(true);
      expect(easyRes.alreadyRewarded).toBe(false);
      expect(easyRes.xpAwarded).toBe(GAMIFICATION_POLICY.SOLVE_XP[Difficulty.EASY]);

      // Medium
      prisma.xpTransaction.create.mockResolvedValue({ id: 'tx-2', amount: 20 });
      prisma.xpTransaction.aggregate.mockResolvedValue({ _sum: { amount: 30 } });
      const medRes = await service.awardSolveReward({
        userId: 'u1',
        problemId: 'p-med',
        difficulty: Difficulty.MEDIUM,
        submissionId: 's2',
      });
      expect(medRes.xpAwarded).toBe(20);

      // Hard
      prisma.xpTransaction.create.mockResolvedValue({ id: 'tx-3', amount: 30 });
      prisma.xpTransaction.aggregate.mockResolvedValue({ _sum: { amount: 60 } });
      const hardRes = await service.awardSolveReward({
        userId: 'u1',
        problemId: 'p-hard',
        difficulty: Difficulty.HARD,
        submissionId: 's3',
      });
      expect(hardRes.xpAwarded).toBe(30);
    });

    it('should enforce idempotency and ignore duplicate rewards when P2002 conflict occurs', async () => {
      const p2002Error = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation on xp_transactions',
        { code: 'P2002', clientVersion: '6.19.3' },
      );
      prisma.xpTransaction.create.mockRejectedValue(p2002Error);
      prisma.xpTransaction.aggregate.mockResolvedValue({ _sum: { amount: 20 } });

      const res = await service.awardSolveReward({
        userId: 'u1',
        problemId: 'p-dup',
        difficulty: Difficulty.MEDIUM,
        submissionId: 's-dup',
      });

      expect(res.applied).toBe(false);
      expect(res.alreadyRewarded).toBe(true);
      expect(res.xpAwarded).toBe(0);
      expect(res.totalXp).toBe(20);
      expect(res.newBadgesAwarded).toEqual([]);
    });

    it('should rethrow genuine unexpected database errors', async () => {
      prisma.xpTransaction.create.mockRejectedValue(new Error('Database connection lost'));

      await expect(
        service.awardSolveReward({
          userId: 'u1',
          problemId: 'p-err',
          difficulty: Difficulty.EASY,
          submissionId: 's-err',
        }),
      ).rejects.toThrow('Database connection lost');
    });
  });

  describe('Badge Criteria Evaluation', () => {
    it('should award PROBLEMS_SOLVED badge when threshold is reached', async () => {
      prisma.badgeDefinition.findMany.mockResolvedValue([
        {
          id: 'b-first',
          slug: 'first-solve',
          name: 'First Problem',
          description: 'First solved problem',
          icon: '🛡️',
          category: 'Milestone',
          rarity: 'Common',
          criteriaType: 'PROBLEMS_SOLVED',
          criteriaThreshold: 1,
          isActive: true,
        },
      ]);
      prisma.userBadge.findMany.mockResolvedValue([]); // not yet earned
      prisma.submission.findMany.mockResolvedValue([{ problemId: 'p1' }]); // 1 distinct solved
      progressService.getActivitySummary.mockResolvedValue({ currentStreak: 1, longestStreak: 1 });

      prisma.userBadge.create.mockResolvedValue({
        id: 'ub-1',
        userId: 'u1',
        badgeId: 'b-first',
        awardedAt: new Date('2026-10-19T10:00:00Z'),
        badge: {
          id: 'b-first',
          slug: 'first-solve',
          name: 'First Problem',
          description: 'First solved problem',
          icon: '🛡️',
          category: 'Milestone',
          rarity: 'Common',
        },
      });

      const awarded = await service.evaluateAndAwardBadges('u1');

      expect(awarded.length).toBe(1);
      expect(awarded[0]!.slug).toBe('first-solve');
      expect(awarded[0]!.earned).toBe(true);
    });

    it('should not award badge if threshold is not reached', async () => {
      prisma.badgeDefinition.findMany.mockResolvedValue([
        {
          id: 'b-10',
          slug: 'problem-solver',
          name: '10 Problems Solver',
          criteriaType: 'PROBLEMS_SOLVED',
          criteriaThreshold: 10,
          isActive: true,
        },
      ]);
      prisma.userBadge.findMany.mockResolvedValue([]);
      prisma.submission.findMany.mockResolvedValue([{ problemId: 'p1' }]); // only 1 solved
      progressService.getActivitySummary.mockResolvedValue({ currentStreak: 1, longestStreak: 1 });

      const awarded = await service.evaluateAndAwardBadges('u1');
      expect(awarded.length).toBe(0);
      expect(prisma.userBadge.create).not.toHaveBeenCalled();
    });

    it('should award STREAK_DAYS badge when user streak meets criteria', async () => {
      prisma.badgeDefinition.findMany.mockResolvedValue([
        {
          id: 'b-streak',
          slug: 'streak-warrior',
          name: '7-Day Streak Warrior',
          criteriaType: 'STREAK_DAYS',
          criteriaThreshold: 7,
          isActive: true,
        },
      ]);
      prisma.userBadge.findMany.mockResolvedValue([]);
      prisma.submission.findMany.mockResolvedValue([]);
      progressService.getActivitySummary.mockResolvedValue({ currentStreak: 7, longestStreak: 7 });

      prisma.userBadge.create.mockResolvedValue({
        id: 'ub-2',
        userId: 'u1',
        badgeId: 'b-streak',
        awardedAt: new Date('2026-10-19T10:00:00Z'),
        badge: {
          id: 'b-streak',
          slug: 'streak-warrior',
          name: '7-Day Streak Warrior',
          description: '7 day streak',
          icon: '🔥',
          category: 'Streak',
          rarity: 'Rare',
        },
      });

      const awarded = await service.evaluateAndAwardBadges('u1');
      expect(awarded.length).toBe(1);
      expect(awarded[0]!.slug).toBe('streak-warrior');
    });

    it('should award TOPICS_COVERED badge when topics threshold is reached', async () => {
      prisma.badgeDefinition.findMany.mockResolvedValue([
        {
          id: 'b-topics',
          slug: 'dsa-explorer',
          name: 'DSA Explorer',
          criteriaType: 'TOPICS_COVERED',
          criteriaThreshold: 3,
          isActive: true,
        },
      ]);
      prisma.userBadge.findMany.mockResolvedValue([]);
      prisma.submission.findMany.mockResolvedValue([]);
      progressService.getTopicProgress.mockResolvedValue({
        topics: [
          { solvedProblems: 1 },
          { solvedProblems: 2 },
          { solvedProblems: 1 },
        ],
      });
      progressService.getActivitySummary.mockResolvedValue({ currentStreak: 1, longestStreak: 1 });

      prisma.userBadge.create.mockResolvedValue({
        id: 'ub-3',
        userId: 'u1',
        badgeId: 'b-topics',
        awardedAt: new Date('2026-10-19T10:00:00Z'),
        badge: {
          id: 'b-topics',
          slug: 'dsa-explorer',
          name: 'DSA Explorer',
          description: '3 topics',
          icon: '🌟',
          category: 'Topic',
          rarity: 'Rare',
        },
      });

      const awarded = await service.evaluateAndAwardBadges('u1');
      expect(awarded.length).toBe(1);
      expect(awarded[0]!.slug).toBe('dsa-explorer');
    });
  });

  describe('getSummary', () => {
    it('should aggregate total XP, level, streak, and recent badges accurately', async () => {
      prisma.xpTransaction.aggregate.mockResolvedValue({ _sum: { amount: 450 } });
      progressService.getActivitySummary.mockResolvedValue({
        currentStreak: 5,
        longestStreak: 12,
        dailyActivity: [
          { date: '2026-10-18', submissionCount: 2, uniqueSolvedCount: 1 },
          { date: '2026-10-19', submissionCount: 1, uniqueSolvedCount: 1 },
        ],
      });
      prisma.userBadge.findMany.mockResolvedValue([
        {
          awardedAt: new Date('2026-10-19T10:00:00Z'),
          badge: {
            id: 'b1',
            slug: 'first-solve',
            name: 'First Problem',
            description: 'First solved problem',
            icon: '🛡️',
            category: 'Milestone',
            rarity: 'Common',
            criteriaThreshold: 1,
          },
        },
      ]);
      prisma.badgeDefinition.count.mockResolvedValue(6);

      const summary = await service.getSummary('u1', 0);

      expect(summary.xp.total).toBe(450);
      expect(summary.level.current).toBe(4);
      expect(summary.level.currentLevelXp).toBe(450);
      expect(summary.level.nextLevelXp).toBe(700);
      expect(summary.streak.current).toBe(5);
      expect(summary.streak.longest).toBe(12);
      expect(summary.streak.activeToday).toBe(true);
      expect(summary.streak.lastActivityDate).toBe('2026-10-19');
      expect(summary.badgesSummary.totalEarned).toBe(1);
      expect(summary.badgesSummary.totalAvailable).toBe(6);
      expect(summary.badgesSummary.recentBadges.length).toBe(1);
    });
  });
});
