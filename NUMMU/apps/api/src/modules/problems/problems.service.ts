import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProblemQueryDto } from './dto/problem-query.dto';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { Role, ContentStatus, Prisma } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class ProblemsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to format a string into a URL-safe kebab-case slug.
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Fast, paginated catalog lookup with explicit field projection to avoid loading heavy text columns.
   */
  async findAll(query: ProblemQueryDto, currentUser?: AuthenticatedUser) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const isPrivileged =
      currentUser &&
      (currentUser.role === Role.TRAINER ||
        currentUser.role === Role.PLATFORM_ADMIN ||
        currentUser.role === Role.COLLEGE_ADMIN);

    // Build Prisma where clause
    const where: Prisma.ProblemWhereInput = {};

    // 1. Publication status filter
    if (isPrivileged && query.status) {
      where.status = query.status;
    } else if (isPrivileged) {
      // Privileged callers can see drafts unless explicitly filtered out
      where.status = { not: ContentStatus.ARCHIVED };
    } else {
      // Public / Students can only ever see PUBLISHED content
      where.status = ContentStatus.PUBLISHED;
    }

    // 2. Difficulty filter
    if (query.difficulty) {
      where.difficulty = query.difficulty;
    }

    // 3. Topic slug filter
    if (query.topic && query.topic !== 'all') {
      where.topics = {
        some: {
          topic: {
            slug: query.topic.toLowerCase().trim(),
          },
        },
      };
    }

    // 4. Safe search on title or slug
    if (query.search && query.search.trim().length > 0) {
      const q = query.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q.toLowerCase(), mode: 'insensitive' } },
      ];
    }

    // 5. Deterministic sorting
    let orderBy: Prisma.ProblemOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'difficulty') {
      orderBy = { difficulty: 'asc' };
    } else if (query.sortBy === 'acceptance') {
      orderBy = { acceptanceRate: 'desc' };
    } else if (query.sortBy === 'popularity') {
      orderBy = { acceptanceRate: 'asc' };
    }

    // Execute count and bounded projection in parallel
    const [total, items] = await Promise.all([
      this.prisma.problem.count({ where }),
      this.prisma.problem.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          slug: true,
          title: true,
          difficulty: true,
          status: true,
          acceptanceRate: true,
          createdAt: true,
          _count: {
            select: {
              testCases: true,
              submissions: true,
              examples: true,
            },
          },
          topics: {
            select: {
              isPrimary: true,
              topic: {
                select: {
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Format response matching shared ProblemListItem shape
    const formattedItems = items.map((p) => {
      const primaryTopicObj = p.topics.find((t) => t.isPrimary)?.topic || p.topics[0]?.topic || null;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        difficulty: p.difficulty,
        status: p.status,
        acceptanceRate: p.acceptanceRate,
        primaryTopic: primaryTopicObj
          ? { slug: primaryTopicObj.slug, name: primaryTopicObj.name }
          : null,
        topics: p.topics.map((t) => ({ slug: t.topic.slug, name: t.topic.name })),
        testCasesCount: p._count?.testCases ?? 0,
        submissionsCount: p._count?.submissions ?? 0,
        examplesCount: p._count?.examples ?? 0,
        createdAt: p.createdAt,
      };
    });

    return {
      items: formattedItems,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Retrieves complete problem definition by slug with examples, hints, and boilerplate.
   */
  async findBySlug(slug: string, currentUser?: AuthenticatedUser) {
    const cleanSlug = slug.toLowerCase().trim();
    const problem = await this.prisma.problem.findUnique({
      where: { slug: cleanSlug },
      include: {
        topics: {
          include: {
            topic: {
              select: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
        examples: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            input: true,
            output: true,
            explanation: true,
            order: true,
          },
        },
        testCases: {
          orderBy: { orderIndex: 'asc' },
        },
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        solutions: {
          select: {
            id: true,
            language: true,
            code: true,
            title: true,
            explanation: true,
            timeComplexity: true,
            spaceComplexity: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    // Publication check
    const isPrivileged =
      currentUser &&
      (currentUser.role === Role.TRAINER ||
        currentUser.role === Role.PLATFORM_ADMIN ||
        currentUser.role === Role.COLLEGE_ADMIN);

    if (!problem || (problem.status === ContentStatus.ARCHIVED && !isPrivileged)) {
      throw new NotFoundException(`Problem with slug "${slug}" not found`);
    }

    if (problem.status === ContentStatus.DRAFT && !isPrivileged) {
      // Disclose nothing to unprivileged users to mitigate enumeration
      throw new NotFoundException(`Problem with slug "${slug}" not found`);
    }

    return {
      id: problem.id,
      slug: problem.slug,
      title: problem.title,
      difficulty: problem.difficulty,
      status: problem.status,
      executionMode: problem.executionMode,
      description: problem.description,
      constraints: problem.constraints,
      hints: problem.hints,
      editorial: problem.editorial,
      boilerplate: problem.boilerplate as Record<string, string>,
      solutions: problem.solutions || [],
      acceptanceRate: problem.acceptanceRate,
      topics: (problem.topics || []).map((pt) => ({
        slug: pt.topic?.slug || '',
        name: pt.topic?.name || '',
        isPrimary: pt.isPrimary ?? false,
      })),
      examples: problem.examples || [],
      ...(isPrivileged && { testCases: problem.testCases || [] }),
      author: problem.author || { id: problem.authorId, name: null, username: null },
      createdAt: problem.createdAt,
      updatedAt: problem.updatedAt,
    };
  }

  /**
   * Creates a new problem with topic mappings and examples.
   */
  async create(authorId: string, dto: CreateProblemDto) {
    const slug = (dto.slug || this.generateSlug(dto.title)).toLowerCase().trim();

    const existing = await this.prisma.problem.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Problem with slug "${slug}" already exists`);
    }

    // Verify topics exist
    const topics = await this.prisma.topic.findMany({
      where: {
        slug: { in: dto.topicSlugs.map((s) => s.toLowerCase().trim()) },
      },
    });

    if (topics.length === 0) {
      throw new NotFoundException('At least one valid topic slug must be provided');
    }

    const primarySlug = dto.primaryTopicSlug?.toLowerCase().trim() || topics[0]?.slug;

    await this.prisma.$transaction(async (tx) => {
      const problem = await tx.problem.create({
        data: {
          title: dto.title.trim(),
          slug,
          difficulty: dto.difficulty,
          status: dto.status || ContentStatus.DRAFT,
          description: dto.description.trim(),
          constraints: dto.constraints || [],
          hints: dto.hints || [],
          editorial: dto.editorial?.trim() || null,
          boilerplate: (dto.boilerplate as Prisma.InputJsonValue) || {},
          ...(dto.executionMode && { executionMode: dto.executionMode }),
          authorId,
        },
      });

      // Link topics
      for (const t of topics) {
        await tx.problemTopic.create({
          data: {
            problemId: problem.id,
            topicId: t.id,
            isPrimary: t.slug === primarySlug,
          },
        });
      }

      // Create examples
      if (dto.examples && dto.examples.length > 0) {
        for (let i = 0; i < dto.examples.length; i++) {
          const ex = dto.examples[i]!;
          await tx.problemExample.create({
            data: {
              problemId: problem.id,
              input: ex.input.trim(),
              output: ex.output.trim(),
              explanation: ex.explanation?.trim() || null,
              order: ex.order ?? i + 1,
            },
          });
        }
      }

      // Create judge test cases (sample + hidden)
      if (dto.testCases && dto.testCases.length > 0) {
        for (let i = 0; i < dto.testCases.length; i++) {
          const tc = dto.testCases[i]!;
          await tx.problemTestCase.create({
            data: {
              problemId: problem.id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden ?? true,
              orderIndex: tc.orderIndex ?? i,
              timeLimitMs: tc.timeLimitMs ?? 2000,
              memoryLimitKb: tc.memoryLimitKb ?? 262144,
            },
          });
        }
      }
    });

    return this.findBySlug(slug, {
      id: authorId,
      role: Role.TRAINER,
      email: '',
      username: '',
      name: '',
      isActive: true,
      isEmailVerified: true,
    });
  }

  /**
   * Updates an existing problem.
   */
  async update(id: string, user: AuthenticatedUser, dto: UpdateProblemDto) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: { topics: true },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with ID "${id}" not found`);
    }

    // Authorization: Platform Admin or original Author Trainer
    if (user.role !== Role.PLATFORM_ADMIN && problem.authorId !== user.id) {
      throw new ForbiddenException('You do not have permission to edit this problem');
    }

    if (dto.slug && dto.slug !== problem.slug) {
      const cleanSlug = dto.slug.toLowerCase().trim();
      const conflict = await this.prisma.problem.findUnique({ where: { slug: cleanSlug } });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Problem with slug "${cleanSlug}" already exists`);
      }
    }

    const targetSlug = dto.slug ? dto.slug.toLowerCase().trim() : problem.slug;

    await this.prisma.$transaction(async (tx) => {
      await tx.problem.update({
        where: { id },
        data: {
          ...(dto.title !== undefined && { title: dto.title.trim() }),
          ...(dto.slug !== undefined && { slug: dto.slug.toLowerCase().trim() }),
          ...(dto.difficulty !== undefined && { difficulty: dto.difficulty }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.description !== undefined && { description: dto.description.trim() }),
          ...(dto.constraints !== undefined && { constraints: dto.constraints }),
          ...(dto.hints !== undefined && { hints: dto.hints }),
          ...(dto.editorial !== undefined && { editorial: dto.editorial?.trim() || null }),
          ...(dto.boilerplate !== undefined && {
            boilerplate: dto.boilerplate as Prisma.InputJsonValue,
          }),
        },
      });

      // Update topic mappings if provided
      if (dto.topicSlugs && dto.topicSlugs.length > 0) {
        const topics = await tx.topic.findMany({
          where: { slug: { in: dto.topicSlugs.map((s) => s.toLowerCase().trim()) } },
        });

        const primarySlug = dto.primaryTopicSlug?.toLowerCase().trim() || topics[0]?.slug;

        await tx.problemTopic.deleteMany({ where: { problemId: id } });
        for (const t of topics) {
          await tx.problemTopic.create({
            data: {
              problemId: id,
              topicId: t.id,
              isPrimary: t.slug === primarySlug,
            },
          });
        }
      }

      // Update examples if provided
      if (dto.examples !== undefined) {
        await tx.problemExample.deleteMany({ where: { problemId: id } });
        for (let i = 0; i < dto.examples.length; i++) {
          const ex = dto.examples[i]!;
          await tx.problemExample.create({
            data: {
              problemId: id,
              input: ex.input.trim(),
              output: ex.output.trim(),
              explanation: ex.explanation?.trim() || null,
              order: ex.order ?? i + 1,
            },
          });
        }
      }

      // Update judge test cases if provided
      if (dto.testCases !== undefined) {
        await tx.problemTestCase.deleteMany({ where: { problemId: id } });
        for (let i = 0; i < dto.testCases.length; i++) {
          const tc = dto.testCases[i]!;
          await tx.problemTestCase.create({
            data: {
              problemId: id,
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden ?? true,
              orderIndex: tc.orderIndex ?? i,
              timeLimitMs: tc.timeLimitMs ?? 2000,
              memoryLimitKb: tc.memoryLimitKb ?? 262144,
            },
          });
        }
      }
    });

    return this.findBySlug(targetSlug, user);
  }

  /**
   * Soft-archives a problem.
   */
  async archive(id: string, user: AuthenticatedUser) {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      throw new NotFoundException(`Problem with ID "${id}" not found`);
    }

    if (user.role !== Role.PLATFORM_ADMIN && problem.authorId !== user.id) {
      throw new ForbiddenException('You do not have permission to archive this problem');
    }

    await this.prisma.problem.update({
      where: { id },
      data: { status: ContentStatus.ARCHIVED },
    });

    return { message: `Problem "${problem.title}" has been archived` };
  }
}
