import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Difficulty, SubmissionVerdict } from '@prisma/client';

describe('ProgressService', () => {
  let service: ProgressService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prisma = {
      problem: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      submission: {
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      topic: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
  });

  describe('getOverview', () => {
    it('should return zeros for a user with no submissions', async () => {
      prisma.problem.findMany.mockResolvedValue([
        { id: 'p1', difficulty: Difficulty.EASY },
        { id: 'p2', difficulty: Difficulty.MEDIUM },
        { id: 'p3', difficulty: Difficulty.HARD },
      ]);
      prisma.submission.findMany.mockResolvedValue([]);
      prisma.submission.count.mockResolvedValue(0);

      const res = await service.getOverview('user-empty');

      expect(res.totalProblemsSolved).toBe(0);
      expect(res.difficulty).toEqual({ easy: 0, medium: 0, hard: 0 });
      expect(res.totalAvailable).toEqual({ easy: 1, medium: 1, hard: 1, total: 3 });
      expect(res.totalSubmissions).toBe(0);
      expect(res.acceptedSubmissions).toBe(0);
      expect(res.acceptanceRate).toBe('0.0%');
    });

    it('should count one accepted submission correctly', async () => {
      prisma.problem.findMany.mockResolvedValue([
        { id: 'p1', difficulty: Difficulty.EASY },
      ]);
      prisma.submission.findMany.mockResolvedValue([
        { problemId: 'p1', problem: { difficulty: Difficulty.EASY } },
      ]);
      prisma.submission.count
        .mockResolvedValueOnce(1) // total
        .mockResolvedValueOnce(1); // accepted

      const res = await service.getOverview('user-1');

      expect(res.totalProblemsSolved).toBe(1);
      expect(res.difficulty.easy).toBe(1);
      expect(res.difficulty.medium).toBe(0);
      expect(res.difficulty.hard).toBe(0);
      expect(res.totalSubmissions).toBe(1);
      expect(res.acceptedSubmissions).toBe(1);
      expect(res.acceptanceRate).toBe('100.0%');
    });

    it('should count multiple accepted submissions for the same problem as 1 unique solved problem', async () => {
      prisma.problem.findMany.mockResolvedValue([
        { id: 'p1', difficulty: Difficulty.MEDIUM },
      ]);
      // Distinct by problemId returns 1 record even if multiple accepted submissions exist
      prisma.submission.findMany.mockResolvedValue([
        { problemId: 'p1', problem: { difficulty: Difficulty.MEDIUM } },
      ]);
      prisma.submission.count
        .mockResolvedValueOnce(5) // totalSubmissions
        .mockResolvedValueOnce(5); // acceptedSubmissions

      const res = await service.getOverview('user-repeat');

      expect(res.totalProblemsSolved).toBe(1);
      expect(res.difficulty.medium).toBe(1);
      expect(res.totalSubmissions).toBe(5);
      expect(res.acceptedSubmissions).toBe(5);
      expect(res.acceptanceRate).toBe('100.0%');
    });

    it('should handle accepted and failed attempts for the same problem without counting failures', async () => {
      prisma.problem.findMany.mockResolvedValue([
        { id: 'p1', difficulty: Difficulty.HARD },
      ]);
      prisma.submission.findMany.mockResolvedValue([
        { problemId: 'p1', problem: { difficulty: Difficulty.HARD } },
      ]);
      prisma.submission.count
        .mockResolvedValueOnce(4) // 3 wrong answers + 1 accepted = 4 total
        .mockResolvedValueOnce(1); // 1 accepted

      const res = await service.getOverview('user-mixed');

      expect(res.totalProblemsSolved).toBe(1);
      expect(res.difficulty.hard).toBe(1);
      expect(res.totalSubmissions).toBe(4);
      expect(res.acceptedSubmissions).toBe(1);
      expect(res.acceptanceRate).toBe('25.0%');
    });

    it('should reconcile difficulty totals with overall unique solved problems', async () => {
      prisma.problem.findMany.mockResolvedValue([
        { id: 'p1', difficulty: Difficulty.EASY },
        { id: 'p2', difficulty: Difficulty.MEDIUM },
        { id: 'p3', difficulty: Difficulty.HARD },
      ]);
      prisma.submission.findMany.mockResolvedValue([
        { problemId: 'p1', problem: { difficulty: Difficulty.EASY } },
        { problemId: 'p2', problem: { difficulty: Difficulty.MEDIUM } },
        { problemId: 'p3', problem: { difficulty: Difficulty.HARD } },
      ]);
      prisma.submission.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(6);

      const res = await service.getOverview('user-multi');

      expect(res.totalProblemsSolved).toBe(3);
      expect(res.difficulty.easy + res.difficulty.medium + res.difficulty.hard).toBe(
        res.totalProblemsSolved,
      );
    });
  });

  describe('getTopicProgress', () => {
    it('should calculate topic completion and mastery percentage accurately', async () => {
      prisma.topic.findMany.mockResolvedValue([
        {
          id: 'top-1',
          name: 'Arrays',
          slug: 'arrays',
          order: 1,
          problems: [{ problemId: 'p1' }, { problemId: 'p2' }],
        },
        {
          id: 'top-2',
          name: 'Graphs',
          slug: 'graphs',
          order: 2,
          problems: [{ problemId: 'p3' }],
        },
      ]);

      prisma.submission.findMany.mockResolvedValue([
        { problemId: 'p1' }, // solved p1 (in Arrays)
      ]);

      const res = await service.getTopicProgress('user-1');

      expect(res.totalTopics).toBe(2);
      expect(res.topics[0]?.slug).toBe('arrays');
      expect(res.topics[0]?.totalProblems).toBe(2);
      expect(res.topics[0]?.solvedProblems).toBe(1);
      expect(res.topics[0]?.remainingProblems).toBe(1);
      expect(res.topics[0]?.percentage).toBe(50);

      expect(res.topics[1]?.slug).toBe('graphs');
      expect(res.topics[1]?.totalProblems).toBe(1);
      expect(res.topics[1]?.solvedProblems).toBe(0);
      expect(res.topics[1]?.remainingProblems).toBe(1);
      expect(res.topics[1]?.percentage).toBe(0);
    });

    it('should safely handle an empty topic with 0 problems without division by zero', async () => {
      prisma.topic.findMany.mockResolvedValue([
        {
          id: 'top-empty',
          name: 'Advanced DP',
          slug: 'advanced-dp',
          order: 3,
          problems: [],
        },
      ]);
      prisma.submission.findMany.mockResolvedValue([]);

      const res = await service.getTopicProgress('user-1');

      expect(res.topics[0]?.totalProblems).toBe(0);
      expect(res.topics[0]?.solvedProblems).toBe(0);
      expect(res.topics[0]?.remainingProblems).toBe(0);
      expect(res.topics[0]?.percentage).toBe(0);
    });

    it('should correctly handle a problem associated with multiple topics without double-counting globally', async () => {
      prisma.topic.findMany.mockResolvedValue([
        {
          id: 'top-1',
          name: 'Two Pointers',
          slug: 'two-pointers',
          order: 1,
          problems: [{ problemId: 'p-multi' }],
        },
        {
          id: 'top-2',
          name: 'Arrays',
          slug: 'arrays',
          order: 2,
          problems: [{ problemId: 'p-multi' }],
        },
      ]);

      prisma.submission.findMany.mockResolvedValue([
        { problemId: 'p-multi' },
      ]);

      const res = await service.getTopicProgress('user-1');

      expect(res.topics[0]?.solvedProblems).toBe(1);
      expect(res.topics[0]?.percentage).toBe(100);
      expect(res.topics[1]?.solvedProblems).toBe(1);
      expect(res.topics[1]?.percentage).toBe(100);
    });
  });

  describe('getSolvedProblems', () => {
    it('should return empty items when user has not solved any problems', async () => {
      prisma.submission.findMany.mockResolvedValue([]);

      const res = await service.getSolvedProblems('user-none', { page: 1, limit: 10 });

      expect(res.items).toEqual([]);
      expect(res.total).toBe(0);
      expect(res.totalPages).toBe(1);
      expect(res.hasNextPage).toBe(false);
    });

    it('should return paginated solved problems with submission counts', async () => {
      prisma.submission.findMany.mockResolvedValue([
        { problemId: 'prob-1', createdAt: new Date('2026-10-18T10:00:00Z') },
      ]);

      prisma.problem.findMany.mockResolvedValue([
        {
          id: 'prob-1',
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: Difficulty.EASY,
          topics: [
            { isPrimary: true, topic: { slug: 'arrays', name: 'Arrays' } },
          ],
        },
      ]);

      prisma.submission.groupBy.mockResolvedValue([
        { problemId: 'prob-1', verdict: SubmissionVerdict.ACCEPTED, _count: { id: 2 } },
        { problemId: 'prob-1', verdict: SubmissionVerdict.WRONG_ANSWER, _count: { id: 1 } },
      ]);

      const res = await service.getSolvedProblems('user-1', { page: 1, limit: 10 });

      expect(res.total).toBe(1);
      expect(res.items.length).toBe(1);
      expect(res.items[0]?.slug).toBe('two-sum');
      expect(res.items[0]?.difficulty).toBe('EASY');
      expect(res.items[0]?.totalSubmissions).toBe(3);
      expect(res.items[0]?.acceptedSubmissions).toBe(2);
      expect(res.items[0]?.primaryTopic?.slug).toBe('arrays');
    });
  });

  describe('getActivitySummary', () => {
    it('should reject date ranges exceeding 365 days', async () => {
      await expect(
        service.getActivitySummary('user-1', {
          startDate: '2024-01-01',
          endDate: '2025-06-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject startDate after endDate', async () => {
      await expect(
        service.getActivitySummary('user-1', {
          startDate: '2026-10-20',
          endDate: '2026-10-15',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should attribute newly solved problems strictly to their FIRST accepted date', async () => {
      // Submissions on 2026-10-17 and 2026-10-18
      prisma.submission.findMany.mockResolvedValue([
        { id: 'sub-1', createdAt: new Date('2026-10-17T12:00:00Z') },
        { id: 'sub-2', createdAt: new Date('2026-10-18T12:00:00Z') },
      ]);

      // Problem p1 was first accepted on 2026-10-17
      prisma.submission.groupBy.mockResolvedValue([
        {
          problemId: 'p1',
          _min: { createdAt: new Date('2026-10-17T12:00:00Z') },
        },
      ]);

      const res = await service.getActivitySummary('user-1', {
        startDate: '2026-10-17',
        endDate: '2026-10-18',
        tzOffsetMinutes: 0,
      });

      const day1 = res.dailyActivity.find((d) => d.date === '2026-10-17');
      const day2 = res.dailyActivity.find((d) => d.date === '2026-10-18');

      expect(day1?.submissionCount).toBe(1);
      expect(day1?.uniqueSolvedCount).toBe(1); // newly solved on day 1

      expect(day2?.submissionCount).toBe(1);
      expect(day2?.uniqueSolvedCount).toBe(0); // NOT counted as newly solved again on day 2!
      expect(res.totalUniqueSolved).toBe(1);
    });
  });
});
