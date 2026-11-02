import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsService } from './problems.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Role, ContentStatus, Difficulty } from '@prisma/client';

describe('ProblemsService Unit Tests', () => {
  let service: ProblemsService;
  let prisma: {
    problem: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    topic: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    problemTopic: {
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
    problemExample: {
      create: jest.Mock;
      deleteMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      problem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      topic: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      problemTopic: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      problemExample: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ProblemsService>(ProblemsService);
  });

  describe('findAll catalog queries', () => {
    it('should enforce status: PUBLISHED when caller is unauthenticated or student', async () => {
      prisma.problem.count.mockResolvedValue(1);
      prisma.problem.findMany.mockResolvedValue([
        {
          id: 'p1',
          slug: 'two-sum',
          title: 'Two Sum',
          difficulty: Difficulty.EASY,
          status: ContentStatus.PUBLISHED,
          acceptanceRate: 52.3,
          createdAt: new Date(),
          topics: [{ isPrimary: true, topic: { slug: 'arrays', name: 'Arrays' } }],
        },
      ]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(prisma.problem.count).toHaveBeenCalledWith({
        where: expect.objectContaining({ status: ContentStatus.PUBLISHED }),
      });
      expect(prisma.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: expect.objectContaining({ status: ContentStatus.PUBLISHED }),
        }),
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.slug).toBe('two-sum');
      expect(result.items[0]?.primaryTopic?.slug).toBe('arrays');
    });

    it('should allow viewing drafts when caller is TRAINER', async () => {
      prisma.problem.count.mockResolvedValue(2);
      prisma.problem.findMany.mockResolvedValue([]);

      const trainerUser = {
        id: 'u-trainer',
        email: 'trainer@numu.io',
        username: 'trainer',
        name: 'Trainer User',
        role: Role.TRAINER,
        isActive: true,
        isEmailVerified: true,
      };

      await service.findAll({ page: 1, limit: 10 }, trainerUser);

      expect(prisma.problem.count).toHaveBeenCalledWith({
        where: expect.objectContaining({ status: { not: ContentStatus.ARCHIVED } }),
      });
    });

    it('should filter by difficulty and topic correctly', async () => {
      prisma.problem.count.mockResolvedValue(0);
      prisma.problem.findMany.mockResolvedValue([]);

      await service.findAll({ difficulty: Difficulty.HARD, topic: 'graphs' });

      expect(prisma.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            difficulty: Difficulty.HARD,
            topics: {
              some: {
                topic: {
                  slug: 'graphs',
                },
              },
            },
          }),
        }),
      );
    });
  });

  describe('findBySlug problem detail', () => {
    it('should throw NotFoundException if problem is DRAFT and user is not privileged', async () => {
      prisma.problem.findUnique.mockResolvedValue({
        id: 'p-draft',
        slug: 'internal-draft',
        status: ContentStatus.DRAFT,
      });

      await expect(service.findBySlug('internal-draft')).rejects.toThrow(NotFoundException);
    });

    it('should return complete problem detail if user is TRAINER', async () => {
      const mockProblem = {
        id: 'p-draft',
        slug: 'internal-draft',
        title: 'Internal Draft Problem',
        difficulty: Difficulty.MEDIUM,
        status: ContentStatus.DRAFT,
        description: 'Draft statement',
        constraints: ['N <= 100'],
        hints: ['Hint 1'],
        editorial: null,
        boilerplate: { python: 'pass' },
        acceptanceRate: 0,
        topics: [{ isPrimary: true, topic: { id: 't1', slug: 'dp', name: 'Dynamic Programming' } }],
        examples: [{ id: 'ex1', input: '1', output: '2', explanation: null, order: 1 }],
        author: { id: 'u1', name: 'Author', username: 'author' },
        solutions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.problem.findUnique.mockResolvedValue(mockProblem);

      const trainerUser = {
        id: 'u-trainer',
        email: 'trainer@numu.io',
        username: 'trainer',
        name: 'Trainer User',
        role: Role.TRAINER,
        isActive: true,
        isEmailVerified: true,
      };

      const result = await service.findBySlug('internal-draft', trainerUser);
      expect(result.title).toBe('Internal Draft Problem');
      expect(result.examples).toHaveLength(1);
      expect(result.solutions).toEqual([]);
    });
  });

  describe('create problem', () => {
    it('should reject with ConflictException if slug already exists', async () => {
      prisma.problem.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.create('trainer-id', {
          title: 'Two Sum',
          slug: 'two-sum',
          difficulty: Difficulty.EASY,
          description: 'Desc',
          topicSlugs: ['arrays'],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update problem authorization', () => {
    it('should reject non-author trainer with ForbiddenException', async () => {
      prisma.problem.findUnique.mockResolvedValue({
        id: 'p1',
        authorId: 'original-author-id',
        slug: 'p1',
      });

      const otherTrainer = {
        id: 'different-trainer',
        email: 'other@numu.io',
        username: 'othertrainer',
        name: 'Other Trainer',
        role: Role.TRAINER,
        isActive: true,
        isEmailVerified: true,
      };

      await expect(
        service.update('p1', otherTrainer, { title: 'New Title' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should permit PLATFORM_ADMIN even if not the author', async () => {
      prisma.problem.findUnique
        .mockResolvedValueOnce({ id: 'p1', authorId: 'original-author', slug: 'p1', topics: [] })
        .mockResolvedValueOnce({
          id: 'p1',
          slug: 'p1',
          title: 'Admin Edited',
          difficulty: Difficulty.EASY,
          status: ContentStatus.PUBLISHED,
          description: 'Desc',
          constraints: [],
          hints: [],
          editorial: null,
          boilerplate: {},
          acceptanceRate: 0,
          topics: [],
          examples: [],
          author: { id: 'u1', name: 'Author', username: 'author' },
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      prisma.problem.update.mockResolvedValue({ id: 'p1', slug: 'p1' });

      const adminUser = {
        id: 'admin-id',
        email: 'admin@numu.io',
        username: 'sysadmin',
        name: 'System Admin',
        role: Role.PLATFORM_ADMIN,
        isActive: true,
        isEmailVerified: true,
      };

      const result = await service.update('p1', adminUser, { title: 'Admin Edited' });
      expect(result.title).toBe('Admin Edited');
    });
  });
});
