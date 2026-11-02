import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EXECUTION_PROVIDER } from './providers/execution-provider.interface';
import { MockExecutionProvider } from './providers/mock-execution.provider';
import { Role } from '@prisma/client';
import { OutputComparatorService } from './comparators/output-comparator.service';
import { LanguageRegistry } from './registry/language.registry';
import { GamificationService } from '../gamification/gamification.service';

describe('SubmissionsService', () => {
  let service: SubmissionsService;
  let prisma: any;
  let gamificationService: { awardSolveReward: jest.Mock };

  const mockProblem = {
    id: 'prob-1',
    slug: 'two-sum',
    title: 'Two Sum',
    examples: [
      { id: 'ex-1', input: 'nums = [2,7,11,15], target = 9', output: '[0, 1]', order: 1 },
    ],
    testCases: [
      { id: 'tc-1', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]', isHidden: false },
      { id: 'tc-2', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]', isHidden: true },
    ],
  };

  const mockSubmission = {
    id: 'sub-1',
    problemId: 'prob-1',
    userId: 'user-student-1',
    language: 'python',
    code: 'class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]',
    status: 'COMPLETED',
    verdict: 'ACCEPTED',
    runtimeMs: 35,
    memoryKb: 14200,
    testsPassed: 2,
    totalTests: 2,
    compileError: null,
    stdout: '[0, 1]\n',
    stderr: null,
    createdAt: new Date('2026-10-16T12:00:00.000Z'),
    updatedAt: new Date('2026-10-16T12:00:01.000Z'),
    problem: { slug: 'two-sum', title: 'Two Sum' },
  };

  beforeEach(async () => {
    prisma = {
      problem: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.slug === 'two-sum') return Promise.resolve(mockProblem);
          return Promise.resolve(null);
        }),
        update: jest.fn().mockResolvedValue(mockProblem),
      },
      submission: {
        create: jest.fn().mockResolvedValue({
          id: 'sub-1',
          problemId: 'prob-1',
          userId: 'user-student-1',
          language: 'python',
          code: 'pass',
          status: 'QUEUED',
          verdict: 'PENDING',
          totalTests: 2,
          testsPassed: 0,
        }),
        update: jest.fn().mockResolvedValue(mockSubmission),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'sub-1') return Promise.resolve(mockSubmission);
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockResolvedValue([mockSubmission]),
        count: jest.fn().mockResolvedValue(1),
      },
    };

    gamificationService = {
      awardSolveReward: jest.fn().mockResolvedValue({
        applied: true,
        alreadyRewarded: false,
        xpAwarded: 10,
        totalXp: 10,
        newBadgesAwarded: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmissionsService,
        OutputComparatorService,
        LanguageRegistry,
        { provide: PrismaService, useValue: prisma },
        { provide: EXECUTION_PROVIDER, useClass: MockExecutionProvider },
        { provide: GamificationService, useValue: gamificationService },
      ],
    }).compile();

    service = module.get<SubmissionsService>(SubmissionsService);
  });

  describe('runCode', () => {
    it('should run code against sample case and return COMPLETED with output comparison', async () => {
      const res = await service.runCode('user-student-1', {
        problemSlug: 'two-sum',
        language: 'python',
        code: 'class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]',
      });

      expect(res.status).toBe('COMPLETED');
      expect(res.verdict).toBe('ACCEPTED');
      expect(res.isMatch).toBe(true);
      expect(res.userOutput).toBe('[0, 1]');
    });

    it('should throw NotFoundException if problem does not exist', async () => {
      await expect(
        service.runCode('user-student-1', {
          problemSlug: 'non-existent',
          language: 'python',
          code: 'print(1)',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return COMPILATION_ERROR when code contains syntax error trigger', async () => {
      const res = await service.runCode('user-student-1', {
        problemSlug: 'two-sum',
        language: 'python',
        code: 'SYNTAX_ERROR def foo():',
      });

      expect(res.status).toBe('COMPLETED');
      expect(res.verdict).toBe('COMPILATION_ERROR');
      expect(res.compileError).toBeTruthy();
    });
  });

  describe('submit', () => {
    it('should persist submission in QUEUED, transition to PROCESSING, and complete with ACCEPTED', async () => {
      const res = await service.submit('user-student-1', {
        problemSlug: 'two-sum',
        language: 'python',
        code: 'class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]',
      });

      expect(prisma.submission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            problemId: 'prob-1',
            userId: 'user-student-1',
            status: 'QUEUED',
            verdict: 'PENDING',
          }),
        }),
      );
      expect(res.status).toBe('COMPLETED');
      expect(res.verdict).toBe('ACCEPTED');
      expect(res.problemSlug).toBe('two-sum');
      expect(gamificationService.awardSolveReward).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-student-1',
          problemId: 'prob-1',
          submissionId: 'sub-1',
        }),
      );
    });

    it('should calculate COMPILATION_ERROR verdict when code has syntax errors', async () => {
      prisma.submission.update.mockResolvedValueOnce({ status: 'PROCESSING' }).mockResolvedValueOnce({
        ...mockSubmission,
        verdict: 'COMPILATION_ERROR',
        compileError: 'SyntaxError',
      });

      const res = await service.submit('user-student-1', {
        problemSlug: 'two-sum',
        language: 'python',
        code: 'SYNTAX_ERROR',
      });

      expect(res.verdict).toBe('COMPILATION_ERROR');
    });

    it('should throw NotFoundException if submitting to unknown problem', async () => {
      await expect(
        service.submit('user-student-1', {
          problemSlug: 'unknown',
          language: 'python',
          code: 'pass',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById (Ownership Security)', () => {
    it('should allow author to retrieve own submission', async () => {
      const user = { id: 'user-student-1', role: Role.STUDENT } as any;
      const res = await service.findById('sub-1', user);
      expect(res.id).toBe('sub-1');
    });

    it('should allow platform admin to retrieve any submission', async () => {
      const admin = { id: 'admin-user', role: Role.PLATFORM_ADMIN } as any;
      const res = await service.findById('sub-1', admin);
      expect(res.id).toBe('sub-1');
    });

    it('should throw ForbiddenException if another student attempts to view submission', async () => {
      const otherStudent = { id: 'different-student', role: Role.STUDENT } as any;
      await expect(service.findById('sub-1', otherStudent)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if submission does not exist', async () => {
      const user = { id: 'user-student-1', role: Role.STUDENT } as any;
      await expect(service.findById('non-existent-sub', user)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated submissions for user', async () => {
      const user = { id: 'user-student-1', role: Role.STUDENT } as any;
      const res = await service.findAll(user, { page: 1, limit: 10 });
      expect(res.items.length).toBe(1);
      expect(res.total).toBe(1);
      expect(res.page).toBe(1);
    });
  });
});
