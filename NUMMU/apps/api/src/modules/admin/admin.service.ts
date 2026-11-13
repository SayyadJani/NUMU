import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ContentStatus,
  Difficulty,
  ExecutionMode,
  OrganizationRole,
  Role,
  SubmissionStatus,
  SubmissionVerdict,
  TestAttemptStatus,
  type Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProblemsService } from '../problems/problems.service';
import { AdminScopeService } from './admin-scope.service';
import { type AuthenticatedUser } from '../auth/decorators/current-user.decorator';

const SUPPORTED_LANGUAGES = new Set([
  'python',
  'cpp',
  'java',
  'javascript',
  'typescript',
  'go',
  'rust',
  'csharp',
]);

export interface BulkProblemRecordInput {
  title?: string;
  slug?: string;
  difficulty?: string;
  status?: string;
  description?: string;
  constraints?: string[];
  hints?: string[];
  editorial?: string;
  boilerplate?: Record<string, string>;
  topicSlugs?: string[];
  primaryTopicSlug?: string;
  executionMode?: string;
  examples?: { input?: string; output?: string; explanation?: string; order?: number }[];
  testCases?: {
    input?: string;
    expectedOutput?: string;
    isHidden?: boolean;
    timeLimitMs?: number;
    memoryLimitKb?: number;
  }[];
}

export interface BulkValidationItemResult {
  index: number;
  title: string;
  slug: string;
  difficulty: string;
  valid: boolean;
  isDuplicateInDb: boolean;
  isDuplicateInBatch: boolean;
  missingTopics: string[];
  errors: string[];
  warnings: string[];
  examplesCount: number;
  testCasesCount: number;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly problemsService: ProblemsService,
    private readonly scope: AdminScopeService,
  ) {}

  // ───────────────────────────────────────────────────────────────────────────
  // 1. Topics & Curriculum Distribution
  // ───────────────────────────────────────────────────────────────────────────

  async getTopicsWithCurriculumStats() {
    const [topics, submissionsByTopic] = await Promise.all([
      this.prisma.topic.findMany({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: {
          problems: {
            include: {
              problem: {
                select: {
                  id: true,
                  difficulty: true,
                  status: true,
                  acceptanceRate: true,
                  _count: { select: { submissions: true, testCases: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.submission.groupBy({
        by: ['problemId', 'verdict'],
        _count: { _all: true },
      }),
    ]);

    const subMap = new Map<string, { total: number; accepted: number }>();
    for (const row of submissionsByTopic) {
      const curr = subMap.get(row.problemId) || { total: 0, accepted: 0 };
      curr.total += row._count._all;
      if (row.verdict === SubmissionVerdict.ACCEPTED) {
        curr.accepted += row._count._all;
      }
      subMap.set(row.problemId, curr);
    }

    return topics.map((t) => {
      const activeProblems = t.problems
        .map((pt) => pt.problem)
        .filter((p) => p.status !== ContentStatus.ARCHIVED);

      const easyCount = activeProblems.filter((p) => p.difficulty === Difficulty.EASY).length;
      const mediumCount = activeProblems.filter((p) => p.difficulty === Difficulty.MEDIUM).length;
      const hardCount = activeProblems.filter((p) => p.difficulty === Difficulty.HARD).length;
      const publishedCount = activeProblems.filter(
        (p) => p.status === ContentStatus.PUBLISHED,
      ).length;
      const draftCount = activeProblems.filter((p) => p.status === ContentStatus.DRAFT).length;

      let totalSubmissions = 0;
      let acceptedSubmissions = 0;
      for (const p of activeProblems) {
        const s = subMap.get(p.id);
        if (s) {
          totalSubmissions += s.total;
          acceptedSubmissions += s.accepted;
        }
      }

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description,
        icon: t.icon,
        order: t.order,
        problemCount: activeProblems.length,
        publishedCount,
        draftCount,
        difficultyDistribution: {
          EASY: easyCount,
          MEDIUM: mediumCount,
          HARD: hardCount,
        },
        totalSubmissions,
        acceptedSubmissions,
        accuracyRate:
          totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
      };
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. Bulk Problem Upload: Validation Preview & Safe Import
  // ───────────────────────────────────────────────────────────────────────────

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async validateBulkProblems(records: BulkProblemRecordInput[]) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new BadRequestException('No problem records found in payload');
    }
    if (records.length > 200) {
      throw new BadRequestException('Bulk import is limited to 200 problems per batch');
    }

    const [existingProblems, existingTopics] = await Promise.all([
      this.prisma.problem.findMany({
        select: { slug: true, title: true },
      }),
      this.prisma.topic.findMany({
        select: { slug: true, name: true },
      }),
    ]);

    const dbSlugs = new Set(existingProblems.map((p) => p.slug.toLowerCase()));
    const dbTitles = new Set(existingProblems.map((p) => p.title.trim().toLowerCase()));
    const knownTopicSlugs = new Set(existingTopics.map((t) => t.slug.toLowerCase()));

    const seenSlugsInBatch = new Set<string>();
    const seenTitlesInBatch = new Set<string>();

    const results: BulkValidationItemResult[] = records.map((raw, idx) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      const title = typeof raw.title === 'string' ? raw.title.trim() : '';
      const slug =
        typeof raw.slug === 'string' && raw.slug.trim()
          ? this.slugify(raw.slug)
          : this.slugify(title);
      const difficulty =
        typeof raw.difficulty === 'string' ? raw.difficulty.trim().toUpperCase() : 'EASY';
      const description = typeof raw.description === 'string' ? raw.description.trim() : '';

      if (!title || title.length < 3) {
        errors.push('Missing or invalid problem title (min 3 chars)');
      }
      if (!slug) {
        errors.push('Could not derive a valid URL slug');
      }
      if (!['EASY', 'MEDIUM', 'HARD'].includes(difficulty)) {
        errors.push(`Invalid difficulty "${raw.difficulty}". Must be EASY, MEDIUM, or HARD`);
      }
      if (!description || description.length < 10) {
        errors.push('Missing or too short problem description (min 10 chars)');
      }

      const isDuplicateInDb =
        (slug !== '' && dbSlugs.has(slug)) ||
        (title !== '' && dbTitles.has(title.toLowerCase()));
      const isDuplicateInBatch =
        (slug !== '' && seenSlugsInBatch.has(slug)) ||
        (title !== '' && seenTitlesInBatch.has(title.toLowerCase()));

      if (slug) seenSlugsInBatch.add(slug);
      if (title) seenTitlesInBatch.add(title.toLowerCase());

      if (isDuplicateInDb) {
        warnings.push('Problem with this slug or title already exists in the database');
      }
      if (isDuplicateInBatch) {
        errors.push('Duplicate slug or title repeated within this upload file');
      }

      const topicSlugs = Array.isArray(raw.topicSlugs)
        ? raw.topicSlugs.map((s) => String(s).trim().toLowerCase()).filter(Boolean)
        : [];
      if (topicSlugs.length === 0) {
        errors.push('At least one topic slug is required in topicSlugs');
      }
      const missingTopics = topicSlugs.filter((ts) => !knownTopicSlugs.has(ts));
      if (missingTopics.length > 0) {
        warnings.push(
          `Unrecognized topic slugs (${missingTopics.join(', ')}) — can be auto-created on import`,
        );
      }

      // Validate boilerplate languages if provided
      if (raw.boilerplate && typeof raw.boilerplate === 'object') {
        const unsupported = Object.keys(raw.boilerplate).filter(
          (lang) => !SUPPORTED_LANGUAGES.has(lang.toLowerCase()),
        );
        if (unsupported.length > 0) {
          warnings.push(`Unsupported boilerplate languages ignored: ${unsupported.join(', ')}`);
        }
      }

      // Validate examples
      const examples = Array.isArray(raw.examples) ? raw.examples : [];
      examples.forEach((ex, exIdx) => {
        if (typeof ex?.input !== 'string' || typeof ex?.output !== 'string') {
          errors.push(`Example #${exIdx + 1} is missing input or output string`);
        }
      });

      // Validate test cases
      const testCases = Array.isArray(raw.testCases) ? raw.testCases : [];
      if (testCases.length === 0 && examples.length === 0) {
        warnings.push('No judge testCases or examples provided');
      }
      testCases.forEach((tc, tcIdx) => {
        if (typeof tc?.input !== 'string' || typeof tc?.expectedOutput !== 'string') {
          errors.push(`Test case #${tcIdx + 1} is missing input or expectedOutput`);
        }
      });

      const valid = errors.length === 0 && !isDuplicateInDb && !isDuplicateInBatch;

      return {
        index: idx,
        title: title || `Row #${idx + 1}`,
        slug: slug || `row-${idx + 1}`,
        difficulty,
        valid,
        isDuplicateInDb,
        isDuplicateInBatch,
        missingTopics,
        errors,
        warnings,
        examplesCount: examples.length,
        testCasesCount: testCases.length,
      };
    });

    return {
      totalRecords: results.length,
      validCount: results.filter((r) => r.valid).length,
      duplicateCount: results.filter((r) => r.isDuplicateInDb || r.isDuplicateInBatch).length,
      errorCount: results.filter((r) => r.errors.length > 0).length,
      items: results,
    };
  }

  async importBulkProblems(
    authorId: string,
    records: BulkProblemRecordInput[],
    options?: { autoCreateMissingTopics?: boolean; skipDuplicates?: boolean },
  ) {
    const autoCreateTopics = options?.autoCreateMissingTopics ?? true;
    const skipDuplicates = options?.skipDuplicates ?? true;

    const validation = await this.validateBulkProblems(records);

    // Auto-create missing topics if enabled
    if (autoCreateTopics) {
      const allMissing = new Set<string>();
      validation.items.forEach((item) => {
        item.missingTopics.forEach((t) => allMissing.add(t));
      });

      for (const topicSlug of allMissing) {
        const cleanSlug = this.slugify(topicSlug);
        if (!cleanSlug) continue;
        const displayName = cleanSlug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        await this.prisma.topic.upsert({
          where: { slug: cleanSlug },
          update: {},
          create: {
            slug: cleanSlug,
            name: displayName,
            description: `Auto-created topic for ${displayName}`,
          },
        });
      }
    }

    const imported: { index: number; id: string; slug: string; title: string }[] = [];
    const skipped: { index: number; title: string; reason: string }[] = [];
    const failed: { index: number; title: string; error: string }[] = [];

    for (let i = 0; i < records.length; i++) {
      const raw = records[i]!;
      const check = validation.items[i]!;

      if (check.isDuplicateInDb || check.isDuplicateInBatch) {
        if (skipDuplicates) {
          skipped.push({
            index: i,
            title: check.title,
            reason: check.isDuplicateInDb
              ? 'Already exists in database (never overwritten silently)'
              : 'Duplicate within batch',
          });
          continue;
        }
      }

      if (check.errors.length > 0) {
        failed.push({
          index: i,
          title: check.title,
          error: check.errors.join('; '),
        });
        continue;
      }

      try {
        const cleanBoilerplate: Record<string, string> = {};
        if (raw.boilerplate && typeof raw.boilerplate === 'object') {
          for (const [k, v] of Object.entries(raw.boilerplate)) {
            if (SUPPORTED_LANGUAGES.has(k.toLowerCase()) && typeof v === 'string') {
              cleanBoilerplate[k.toLowerCase()] = v;
            }
          }
        }

        const topicSlugs = (raw.topicSlugs || [])
          .map((s) => this.slugify(String(s)))
          .filter(Boolean);

        const examples = Array.isArray(raw.examples)
          ? raw.examples.map((ex, idx) => ({
              input: String(ex.input ?? ''),
              output: String(ex.output ?? ''),
              explanation: ex.explanation ? String(ex.explanation) : undefined,
              order: ex.order ?? idx + 1,
            }))
          : [];

        const testCases = Array.isArray(raw.testCases)
          ? raw.testCases.map((tc, idx) => ({
              input: String(tc.input ?? ''),
              expectedOutput: String(tc.expectedOutput ?? ''),
              isHidden: tc.isHidden ?? idx >= 2,
              orderIndex: idx,
              timeLimitMs: tc.timeLimitMs ?? 2000,
              memoryLimitKb: tc.memoryLimitKb ?? 262144,
            }))
          : examples.map((ex, idx) => ({
              input: ex.input,
              expectedOutput: ex.output,
              isHidden: false,
              orderIndex: idx,
              timeLimitMs: 2000,
              memoryLimitKb: 262144,
            }));

        const created = await this.problemsService.create(authorId, {
          title: check.title,
          slug: check.slug,
          difficulty: check.difficulty as Difficulty,
          status:
            raw.status && ['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(raw.status.toUpperCase())
              ? (raw.status.toUpperCase() as ContentStatus)
              : ContentStatus.PUBLISHED,
          description: String(raw.description || '').trim(),
          constraints: Array.isArray(raw.constraints) ? raw.constraints.map(String) : [],
          hints: Array.isArray(raw.hints) ? raw.hints.map(String) : [],
          editorial: raw.editorial ? String(raw.editorial) : undefined,
          boilerplate: cleanBoilerplate,
          topicSlugs,
          primaryTopicSlug: raw.primaryTopicSlug
            ? this.slugify(raw.primaryTopicSlug)
            : topicSlugs[0],
          executionMode:
            raw.executionMode === 'STDIN_STDOUT'
              ? ExecutionMode.STDIN_STDOUT
              : ExecutionMode.FUNCTION,
          examples,
          testCases,
        });

        imported.push({
          index: i,
          id: created.id,
          slug: created.slug,
          title: created.title,
        });
      } catch (err: any) {
        failed.push({
          index: i,
          title: check.title,
          error: err?.message || 'Database error during import',
        });
      }
    }

    return {
      totalProcessed: records.length,
      importedCount: imported.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      imported,
      skipped,
      failed,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. Submissions & Judge0 Evaluation Management
  // ───────────────────────────────────────────────────────────────────────────

  async listAdminSubmissions(
    requester: AuthenticatedUser,
    query: {
      page?: number;
      limit?: number;
      search?: string;
      verdict?: string;
      status?: string;
      language?: string;
      problemId?: string;
      userId?: string;
    },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
    const skip = (page - 1) * limit;

    const scopedUserIds = await this.scope.getScopedUserIds(requester);
    const where: Prisma.SubmissionWhereInput = {};

    if (scopedUserIds !== null) {
      where.userId = { in: scopedUserIds };
    }
    if (query.userId) {
      if (scopedUserIds !== null && !scopedUserIds.includes(query.userId)) {
        return {
          items: [],
          pagination: { page, limit, total: 0, totalPages: 1 },
          summary: { total: 0, accepted: 0, failed: 0, pending: 0 },
        };
      }
      where.userId = query.userId;
    }
    if (query.problemId) {
      where.problemId = query.problemId;
    }
    if (query.verdict && Object.values(SubmissionVerdict).includes(query.verdict as SubmissionVerdict)) {
      where.verdict = query.verdict as SubmissionVerdict;
    }
    if (query.status && Object.values(SubmissionStatus).includes(query.status as SubmissionStatus)) {
      where.status = query.status as SubmissionStatus;
    }
    if (query.language && query.language.trim()) {
      where.language = { equals: query.language.trim(), mode: 'insensitive' };
    }
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { username: { contains: q, mode: 'insensitive' } } },
        { problem: { title: { contains: q, mode: 'insensitive' } } },
        { problem: { slug: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total, accepted, pending] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          language: true,
          status: true,
          verdict: true,
          runtimeMs: true,
          memoryKb: true,
          testsPassed: true,
          totalTests: true,
          compileError: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              profile: { select: { college: true } },
            },
          },
          problem: {
            select: {
              id: true,
              title: true,
              slug: true,
              difficulty: true,
            },
          },
        },
      }),
      this.prisma.submission.count({ where }),
      this.prisma.submission.count({
        where: { ...where, verdict: SubmissionVerdict.ACCEPTED },
      }),
      this.prisma.submission.count({
        where: {
          ...where,
          status: { in: [SubmissionStatus.QUEUED, SubmissionStatus.PROCESSING] },
        },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        total,
        accepted,
        failed: Math.max(0, total - accepted - pending),
        pending,
      },
    };
  }

  async getAdminSubmissionById(requester: AuthenticatedUser, id: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            profile: { select: { college: true, gradYear: true } },
          },
        },
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            executionMode: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission "${id}" not found`);
    }

    await this.scope.assertCanAccessUser(requester, submission.userId);
    return submission;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. Batches (Organizations) Management & Batch-Wise Analytics
  // ───────────────────────────────────────────────────────────────────────────

  async listBatches(requester: AuthenticatedUser) {
    const managedOrgIds = await this.scope.getManagedOrgIds(requester);
    const where: Prisma.OrganizationWhereInput =
      managedOrgIds !== null ? { id: { in: managedOrgIds } } : {};

    const orgs = await this.prisma.organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                _count: {
                  select: {
                    submissions: true,
                    testAttempts: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return orgs.map((org) => {
      const students = org.members.filter(
        (m) => m.role === OrganizationRole.MEMBER && m.user.role === Role.STUDENT,
      );
      const trainers = org.members.filter(
        (m) => m.role !== OrganizationRole.MEMBER,
      );
      const activeStudents = students.filter((s) => s.user.isActive).length;
      const participatingStudents = students.filter(
        (s) => s.user._count.submissions > 0 || s.user._count.testAttempts > 0,
      ).length;
      const totalSubmissions = students.reduce((acc, s) => acc + s.user._count.submissions, 0);
      const totalTestAttempts = students.reduce((acc, s) => acc + s.user._count.testAttempts, 0);

      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        logoUrl: org.logoUrl,
        createdAt: org.createdAt,
        studentCount: students.length,
        activeStudentCount: activeStudents,
        trainerCount: trainers.length,
        participationRate:
          students.length > 0 ? Math.round((participatingStudents / students.length) * 100) : 0,
        totalSubmissions,
        totalTestAttempts,
        trainers: trainers.map((t) => ({
          userId: t.user.id,
          name: t.user.name || t.user.username || t.user.email,
          email: t.user.email,
          orgRole: t.role,
        })),
      };
    });
  }

  async createBatch(
    requester: AuthenticatedUser,
    dto: { name: string; slug?: string; description?: string },
  ) {
    if (!dto.name || dto.name.trim().length < 2) {
      throw new BadRequestException('Batch name must be at least 2 characters');
    }
    const slug = dto.slug?.trim() ? this.slugify(dto.slug) : this.slugify(dto.name);
    const existing = await this.prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Batch with slug "${slug}" already exists`);
    }

    return this.prisma.organization.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        members: {
          create: {
            userId: requester.id,
            role: OrganizationRole.OWNER,
          },
        },
      },
    });
  }

  async updateBatch(
    requester: AuthenticatedUser,
    batchId: string,
    dto: { name?: string; description?: string },
  ) {
    await this.scope.assertCanManageOrg(requester, batchId);
    const org = await this.prisma.organization.findUnique({ where: { id: batchId } });
    if (!org) throw new NotFoundException('Batch not found');

    return this.prisma.organization.update({
      where: { id: batchId },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description.trim() || null }),
      },
    });
  }

  async deleteBatch(requester: AuthenticatedUser, batchId: string) {
    await this.scope.assertCanManageOrg(requester, batchId);
    const org = await this.prisma.organization.findUnique({ where: { id: batchId } });
    if (!org) throw new NotFoundException('Batch not found');
    await this.prisma.organization.delete({ where: { id: batchId } });
    return { message: `Batch "${org.name}" deleted` };
  }

  async assignBatchMembers(
    requester: AuthenticatedUser,
    batchId: string,
    payload: { userIds: string[]; role?: OrganizationRole },
  ) {
    await this.scope.assertCanManageOrg(requester, batchId);
    const org = await this.prisma.organization.findUnique({ where: { id: batchId } });
    if (!org) throw new NotFoundException('Batch not found');

    const role = payload.role || OrganizationRole.MEMBER;
    const userIds = Array.from(new Set(payload.userIds || [])).filter(Boolean);
    if (userIds.length === 0) {
      throw new BadRequestException('Provide at least one userId');
    }

    let assignedCount = 0;
    for (const userId of userIds) {
      await this.prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: batchId,
            userId,
          },
        },
        update: { role },
        create: {
          organizationId: batchId,
          userId,
          role,
        },
      });
      assignedCount++;
    }

    return {
      message: `Assigned ${assignedCount} member(s) to "${org.name}"`,
      assignedCount,
    };
  }

  async removeBatchMember(requester: AuthenticatedUser, batchId: string, userId: string) {
    await this.scope.assertCanManageOrg(requester, batchId);
    await this.prisma.organizationMember.deleteMany({
      where: { organizationId: batchId, userId },
    });
    return { message: 'Member removed from batch' };
  }

  async getBatchAnalytics(requester: AuthenticatedUser, batchId: string) {
    await this.scope.assertCanManageOrg(requester, batchId);

    const org = await this.prisma.organization.findUnique({
      where: { id: batchId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                profile: { select: { college: true, gradYear: true } },
              },
            },
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Batch not found');
    }

    const studentMembers = org.members.filter(
      (m) => m.role === OrganizationRole.MEMBER && m.user.role === Role.STUDENT,
    );
    const studentIds = studentMembers.map((m) => m.user.id);

    const [submissions, attempts] = await Promise.all([
      this.prisma.submission.findMany({
        where: { userId: { in: studentIds } },
        select: {
          userId: true,
          problemId: true,
          verdict: true,
          createdAt: true,
          problem: {
            select: {
              difficulty: true,
              topics: {
                include: { topic: { select: { slug: true, name: true } } },
              },
            },
          },
        },
      }),
      this.prisma.testAttempt.findMany({
        where: { userId: { in: studentIds } },
        select: {
          userId: true,
          testId: true,
          status: true,
          score: true,
          percentage: true,
          passed: true,
          autoSubmitted: true,
          tabSwitchCount: true,
          startedAt: true,
          submittedAt: true,
          test: { select: { title: true, totalMarks: true } },
        },
      }),
    ]);

    // Topic-wise batch performance
    const topicStatsMap = new Map<
      string,
      { name: string; slug: string; totalSubmissions: number; acceptedSubmissions: number }
    >();

    for (const sub of submissions) {
      for (const pt of sub.problem.topics) {
        const entry = topicStatsMap.get(pt.topic.slug) || {
          name: pt.topic.name,
          slug: pt.topic.slug,
          totalSubmissions: 0,
          acceptedSubmissions: 0,
        };
        entry.totalSubmissions += 1;
        if (sub.verdict === SubmissionVerdict.ACCEPTED) {
          entry.acceptedSubmissions += 1;
        }
        topicStatsMap.set(pt.topic.slug, entry);
      }
    }

    const topicPerformance = Array.from(topicStatsMap.values()).map((t) => ({
      ...t,
      accuracy:
        t.totalSubmissions > 0
          ? Math.round((t.acceptedSubmissions / t.totalSubmissions) * 100)
          : 0,
    }));

    // Per-student comparison & attention flags
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const studentComparisons = studentMembers.map((m) => {
      const uSubs = submissions.filter((s) => s.userId === m.user.id);
      const uAccepted = uSubs.filter((s) => s.verdict === SubmissionVerdict.ACCEPTED);
      const uniqueSolved = new Set(uAccepted.map((s) => s.problemId)).size;
      const uniqueAttempted = new Set(uSubs.map((s) => s.problemId)).size;
      const accuracy =
        uSubs.length > 0 ? Math.round((uAccepted.length / uSubs.length) * 100) : 0;

      const uAttempts = attempts.filter((a) => a.userId === m.user.id);
      const submittedAttempts = uAttempts.filter(
        (a) => a.status === TestAttemptStatus.SUBMITTED,
      );
      const avgTestPercentage =
        submittedAttempts.length > 0
          ? Math.round(
              submittedAttempts.reduce((acc, a) => acc + a.percentage, 0) /
                submittedAttempts.length,
            )
          : null;
      const autoSubmits = uAttempts.filter((a) => a.autoSubmitted).length;

      const lastActivityTs = Math.max(
        ...uSubs.map((s) => new Date(s.createdAt).getTime()),
        ...uAttempts.map((a) => new Date(a.startedAt).getTime()),
        0,
      );

      const attentionReasons: string[] = [];
      if (!m.user.isActive) attentionReasons.push('Account suspended');
      if (uSubs.length === 0 && uAttempts.length === 0) {
        attentionReasons.push('No coding or test activity yet');
      } else if (lastActivityTs > 0 && lastActivityTs < sevenDaysAgo) {
        attentionReasons.push('Inactive for > 7 days');
      }
      if (uSubs.length >= 3 && accuracy < 40) {
        attentionReasons.push(`Low submission accuracy (${accuracy}%)`);
      }
      if (avgTestPercentage !== null && avgTestPercentage < 50) {
        attentionReasons.push(`Low assessment average (${avgTestPercentage}%)`);
      }
      if (autoSubmits > 0) {
        attentionReasons.push(`${autoSubmits} proctoring auto-submit(s)`);
      }

      return {
        userId: m.user.id,
        name: m.user.name || m.user.username || 'Student',
        username: m.user.username,
        email: m.user.email,
        isActive: m.user.isActive,
        college: m.user.profile?.college || null,
        gradYear: m.user.profile?.gradYear || null,
        problemsAttempted: uniqueAttempted,
        problemsSolved: uniqueSolved,
        totalSubmissions: uSubs.length,
        submissionAccuracy: accuracy,
        testsAttempted: uAttempts.length,
        avgTestPercentage,
        autoSubmits,
        lastActiveAt: lastActivityTs > 0 ? new Date(lastActivityTs).toISOString() : null,
        needsAttention: attentionReasons.length > 0,
        attentionReasons,
      };
    });

    const submittedAll = attempts.filter((a) => a.status === TestAttemptStatus.SUBMITTED);
    const batchAvgTestScore =
      submittedAll.length > 0
        ? Math.round(
            submittedAll.reduce((acc, a) => acc + a.percentage, 0) / submittedAll.length,
          )
        : 0;

    return {
      batch: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        description: org.description,
        createdAt: org.createdAt,
      },
      summary: {
        totalStudents: studentMembers.length,
        activeStudents: studentMembers.filter((m) => m.user.isActive).length,
        participatingStudents: studentComparisons.filter(
          (s) => s.totalSubmissions > 0 || s.testsAttempted > 0,
        ).length,
        totalSubmissions: submissions.length,
        totalTestsTaken: attempts.length,
        batchAvgTestScore,
        studentsNeedingAttentionCount: studentComparisons.filter((s) => s.needsAttention)
          .length,
      },
      members: org.members.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        username: m.user.username,
        email: m.user.email,
        userRole: m.user.role,
        batchRole: m.role,
        isActive: m.user.isActive,
        joinedAt: m.createdAt,
      })),
      studentComparisons,
      studentsRequiringAttention: studentComparisons.filter((s) => s.needsAttention),
      topicPerformance,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. Comprehensive Student-Wise Analytics
  // ───────────────────────────────────────────────────────────────────────────

  async getStudentAnalytics(requester: AuthenticatedUser, studentId: string) {
    await this.scope.assertCanAccessUser(requester, studentId);

    const [user, totalPublishedProblems, submissions, testAttempts, xpTotal] =
      await Promise.all([
        this.prisma.user.findUnique({
          where: { id: studentId },
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            role: true,
            isActive: true,
            isEmailVerified: true,
            createdAt: true,
            profile: true,
            organizationMembers: {
              include: {
                organization: { select: { id: true, name: true, slug: true } },
              },
            },
            userBadges: {
              include: { badge: true },
              orderBy: { awardedAt: 'desc' },
            },
          },
        }),
        this.prisma.problem.count({ where: { status: ContentStatus.PUBLISHED } }),
        this.prisma.submission.findMany({
          where: { userId: studentId },
          orderBy: { createdAt: 'desc' },
          include: {
            problem: {
              select: {
                id: true,
                title: true,
                slug: true,
                difficulty: true,
                topics: {
                  include: { topic: { select: { id: true, name: true, slug: true } } },
                },
              },
            },
          },
        }),
        this.prisma.testAttempt.findMany({
          where: { userId: studentId },
          orderBy: { startedAt: 'asc' },
          include: {
            test: {
              select: {
                id: true,
                title: true,
                slug: true,
                totalMarks: true,
                passPercentage: true,
                durationMinutes: true,
              },
            },
          },
        }),
        this.prisma.xpTransaction.aggregate({
          where: { userId: studentId },
          _sum: { amount: true },
        }),
      ]);

    if (!user) {
      throw new NotFoundException(`Student "${studentId}" not found`);
    }

    // Distinguish unique problems attempted vs unique problems solved
    const attemptedProblemIds = new Set<string>();
    const solvedProblemIds = new Set<string>();
    const difficultySolved: Record<Difficulty, Set<string>> = {
      EASY: new Set(),
      MEDIUM: new Set(),
      HARD: new Set(),
    };
    const difficultyAttempted: Record<Difficulty, Set<string>> = {
      EASY: new Set(),
      MEDIUM: new Set(),
      HARD: new Set(),
    };
    const languageUsage: Record<string, { submissions: number; accepted: number }> = {};
    const topicPerfMap = new Map<
      string,
      {
        name: string;
        slug: string;
        attemptedIds: Set<string>;
        solvedIds: Set<string>;
        submissions: number;
        accepted: number;
      }
    >();
    const problemFailuresMap = new Map<
      string,
      { problemId: string; title: string; slug: string; difficulty: Difficulty; failures: number; solved: boolean }
    >();

    let runtimeSum = 0;
    let runtimeCount = 0;

    for (const sub of submissions) {
      attemptedProblemIds.add(sub.problemId);
      difficultyAttempted[sub.problem.difficulty].add(sub.problemId);

      const isAccepted = sub.verdict === SubmissionVerdict.ACCEPTED;
      if (isAccepted) {
        solvedProblemIds.add(sub.problemId);
        difficultySolved[sub.problem.difficulty].add(sub.problemId);
        if (typeof sub.runtimeMs === 'number') {
          runtimeSum += sub.runtimeMs;
          runtimeCount++;
        }
      }

      const lang = sub.language.toLowerCase();
      const langEntry = languageUsage[lang] || { submissions: 0, accepted: 0 };
      langEntry.submissions++;
      if (isAccepted) langEntry.accepted++;
      languageUsage[lang] = langEntry;

      // Track problem failure count
      const failItem = problemFailuresMap.get(sub.problemId) || {
        problemId: sub.problemId,
        title: sub.problem.title,
        slug: sub.problem.slug,
        difficulty: sub.problem.difficulty,
        failures: 0,
        solved: false,
      };
      if (isAccepted) {
        failItem.solved = true;
      } else {
        failItem.failures++;
      }
      problemFailuresMap.set(sub.problemId, failItem);

      for (const pt of sub.problem.topics) {
        const tEntry = topicPerfMap.get(pt.topic.slug) || {
          name: pt.topic.name,
          slug: pt.topic.slug,
          attemptedIds: new Set<string>(),
          solvedIds: new Set<string>(),
          submissions: 0,
          accepted: 0,
        };
        tEntry.attemptedIds.add(sub.problemId);
        if (isAccepted) tEntry.solvedIds.add(sub.problemId);
        tEntry.submissions++;
        if (isAccepted) tEntry.accepted++;
        topicPerfMap.set(pt.topic.slug, tEntry);
      }
    }

    const topicBreakdown = Array.from(topicPerfMap.values()).map((t) => {
      const accuracy =
        t.submissions > 0 ? Math.round((t.accepted / t.submissions) * 100) : 0;
      return {
        name: t.name,
        slug: t.slug,
        problemsAttempted: t.attemptedIds.size,
        problemsSolved: t.solvedIds.size,
        submissions: t.submissions,
        accepted: t.accepted,
        accuracy,
      };
    });

    const strongTopics = topicBreakdown
      .filter((t) => t.submissions >= 1 && t.accuracy >= 70)
      .sort((a, b) => b.accuracy - a.accuracy);
    const weakTopics = topicBreakdown
      .filter((t) => t.submissions >= 1 && t.accuracy < 50)
      .sort((a, b) => a.accuracy - b.accuracy);

    const frequentlyFailedProblems = Array.from(problemFailuresMap.values())
      .filter((p) => p.failures >= 2)
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 8);

    // Assessment history & trend
    const completedTests = testAttempts.filter(
      (a) => a.status === TestAttemptStatus.SUBMITTED,
    );
    const avgAssessmentPercentage =
      completedTests.length > 0
        ? Math.round(
            completedTests.reduce((acc, a) => acc + a.percentage, 0) / completedTests.length,
          )
        : null;

    let performanceTrend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'INSUFFICIENT_DATA' =
      'INSUFFICIENT_DATA';
    if (completedTests.length >= 2) {
      const firstScore = completedTests[0]!.percentage;
      const lastScore = completedTests[completedTests.length - 1]!.percentage;
      if (lastScore - firstScore >= 5) performanceTrend = 'IMPROVING';
      else if (firstScore - lastScore >= 5) performanceTrend = 'DECLINING';
      else performanceTrend = 'STABLE';
    }

    const acceptedSubmissionsCount = submissions.filter(
      (s) => s.verdict === SubmissionVerdict.ACCEPTED,
    ).length;

    return {
      student: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        profile: user.profile,
        totalXp: xpTotal._sum.amount ?? 0,
        batches: user.organizationMembers.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          role: m.role,
        })),
        badges: user.userBadges.map((ub) => ({
          slug: ub.badge.slug,
          name: ub.badge.name,
          category: ub.badge.category,
          awardedAt: ub.awardedAt,
        })),
      },
      learningProgress: {
        uniqueProblemsAttempted: attemptedProblemIds.size,
        uniqueProblemsSolved: solvedProblemIds.size,
        totalPublishedProblems,
        completionPercentage:
          totalPublishedProblems > 0
            ? Math.round((solvedProblemIds.size / totalPublishedProblems) * 100)
            : 0,
        totalSubmissions: submissions.length,
        acceptedSubmissions: acceptedSubmissionsCount,
        submissionSuccessRate:
          submissions.length > 0
            ? Math.round((acceptedSubmissionsCount / submissions.length) * 100)
            : 0,
        averageRuntimeMs: runtimeCount > 0 ? Math.round(runtimeSum / runtimeCount) : null,
        difficultyBreakdown: {
          EASY: {
            attempted: difficultyAttempted.EASY.size,
            solved: difficultySolved.EASY.size,
          },
          MEDIUM: {
            attempted: difficultyAttempted.MEDIUM.size,
            solved: difficultySolved.MEDIUM.size,
          },
          HARD: {
            attempted: difficultyAttempted.HARD.size,
            solved: difficultySolved.HARD.size,
          },
        },
        languageUsage,
      },
      topicBreakdown,
      assessmentPerformance: {
        totalAttempts: testAttempts.length,
        completedAttempts: completedTests.length,
        passedAttempts: completedTests.filter((a) => a.passed).length,
        autoSubmittedCount: testAttempts.filter((a) => a.autoSubmitted).length,
        averagePercentage: avgAssessmentPercentage,
        performanceTrend,
        attempts: testAttempts
          .slice()
          .reverse()
          .map((a) => ({
            id: a.id,
            testId: a.test.id,
            testTitle: a.test.title,
            testSlug: a.test.slug,
            status: a.status,
            score: a.score,
            totalMarks: a.test.totalMarks,
            percentage: a.percentage,
            passed: a.passed,
            tabSwitchCount: a.tabSwitchCount,
            fullscreenExitCount: a.fullscreenExitCount,
            autoSubmitted: a.autoSubmitted,
            terminationReason: a.terminationReason,
            startedAt: a.startedAt,
            submittedAt: a.submittedAt,
            durationTakenMinutes:
              a.submittedAt && a.startedAt
                ? Math.max(
                    1,
                    Math.round(
                      (new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) /
                        60000,
                    ),
                  )
                : null,
          })),
      },
      insights: {
        strongTopics,
        weakTopics,
        frequentlyFailedProblems,
        performanceTrend,
      },
      recentSubmissions: submissions.slice(0, 25).map((s) => ({
        id: s.id,
        problemId: s.problem.id,
        problemTitle: s.problem.title,
        problemSlug: s.problem.slug,
        difficulty: s.problem.difficulty,
        language: s.language,
        status: s.status,
        verdict: s.verdict,
        runtimeMs: s.runtimeMs,
        memoryKb: s.memoryKb,
        testsPassed: s.testsPassed,
        totalTests: s.totalTests,
        createdAt: s.createdAt,
      })),
    };
  }
}
