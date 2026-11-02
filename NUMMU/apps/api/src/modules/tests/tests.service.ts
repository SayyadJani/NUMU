import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmissionsService } from '../submissions/submissions.service';
import { GamificationService } from '../gamification/gamification.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AutosaveAnswerDto } from './dto/autosave-answer.dto';
import { RunTestCodeDto } from './dto/run-test-code.dto';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { ContentStatus, TestAttemptStatus, SubmissionVerdict } from '@prisma/client';

@Injectable()
export class TestsService {
  private readonly logger = new Logger(TestsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly submissionsService: SubmissionsService,
    private readonly gamificationService: GamificationService,
  ) {}

  // ───────────────────────────────────────────────────────────────────────────
  // Student API Methods
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * List all published tests with the student's attempt status if authenticated.
   */
  async listPublishedTests(userId?: string) {
    const tests = await this.prisma.test.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
      },
      include: {
        questions: {
          select: {
            id: true,
            orderIndex: true,
            marks: true,
            problem: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        attempts: userId
          ? {
              where: { userId },
              select: {
                id: true,
                status: true,
                score: true,
                percentage: true,
                passed: true,
                startedAt: true,
                expiresAt: true,
                submittedAt: true,
              },
            }
          : false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return tests.map((t) => {
      const userAttempt = t.attempts && t.attempts.length > 0 ? t.attempts[0] : null;
      let attemptStatus = 'NOT_STARTED';
      if (userAttempt) {
        if (userAttempt.status === TestAttemptStatus.SUBMITTED) {
          attemptStatus = 'COMPLETED';
        } else if (userAttempt.status === TestAttemptStatus.EXPIRED) {
          attemptStatus = 'EXPIRED';
        } else if (new Date() > new Date(userAttempt.expiresAt)) {
          attemptStatus = 'EXPIRED';
        } else {
          attemptStatus = 'IN_PROGRESS';
        }
      }

      return {
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description,
        weekNumber: t.weekNumber,
        durationMinutes: t.durationMinutes,
        passPercentage: t.passPercentage,
        totalMarks: t.totalMarks,
        totalQuestions: t.questions.length,
        status: t.status,
        startTime: t.startTime,
        endTime: t.endTime,
        userAttemptStatus: attemptStatus,
        userScore: userAttempt?.score ?? null,
        userPercentage: userAttempt?.percentage ?? null,
        userPassed: userAttempt?.passed ?? null,
        questions: t.questions.map((q) => ({
          order: q.orderIndex,
          marks: q.marks,
          problemTitle: q.problem.title,
          difficulty: q.problem.difficulty,
        })),
      };
    });
  }

  /**
   * Get single published test details and instructions.
   */
  async getTestBySlug(slug: string, userId?: string) {
    const test = await this.prisma.test.findUnique({
      where: { slug },
      include: {
        questions: {
          include: {
            problem: {
              include: {
                topics: {
                  include: { topic: true },
                },
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        attempts: userId
          ? {
              where: { userId },
              select: {
                id: true,
                status: true,
                score: true,
                percentage: true,
                passed: true,
                startedAt: true,
                expiresAt: true,
                submittedAt: true,
              },
            }
          : false,
      },
    });

    if (!test || test.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException(`Weekly Test "${slug}" not found or not published`);
    }

    const userAttempt = test.attempts && test.attempts.length > 0 ? test.attempts[0] : null;

    // Collect syllabus topics
    const topicsMap = new Map<string, string>();
    test.questions.forEach((q) => {
      q.problem.topics.forEach((pt) => {
        topicsMap.set(pt.topic.slug, pt.topic.name);
      });
    });

    return {
      id: test.id,
      slug: test.slug,
      title: test.title,
      description: test.description,
      weekNumber: test.weekNumber,
      instructions: test.instructions,
      durationMinutes: test.durationMinutes,
      passPercentage: test.passPercentage,
      totalMarks: test.totalMarks,
      totalQuestions: test.questions.length,
      startTime: test.startTime,
      endTime: test.endTime,
      topics: Array.from(topicsMap.entries()).map(([tSlug, name]) => ({ slug: tSlug, name })),
      questions: test.questions.map((q) => ({
        order: q.orderIndex,
        marks: q.marks,
        title: q.problem.title,
        difficulty: q.problem.difficulty,
      })),
      userAttempt: userAttempt
        ? {
            id: userAttempt.id,
            status: userAttempt.status,
            score: userAttempt.score,
            percentage: userAttempt.percentage,
            passed: userAttempt.passed,
            startedAt: userAttempt.startedAt,
            expiresAt: userAttempt.expiresAt,
            submittedAt: userAttempt.submittedAt,
            secondsRemaining: Math.max(
              0,
              Math.floor((new Date(userAttempt.expiresAt).getTime() - Date.now()) / 1000),
            ),
          }
        : null,
    };
  }

  /**
   * Student Starts or Resumes a Test Attempt (Idempotent).
   */
  async startOrResumeAttempt(slug: string, userId: string) {
    const test = await this.prisma.test.findUnique({
      where: { slug },
      include: {
        questions: {
          include: {
            problem: {
              include: {
                examples: { orderBy: { order: 'asc' } },
                topics: { include: { topic: true } },
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test || test.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException(`Weekly Test "${slug}" not found or not available`);
    }

    if (test.startTime && new Date() < new Date(test.startTime)) {
      throw new BadRequestException('This test has not started yet.');
    }

    if (test.endTime && new Date() > new Date(test.endTime)) {
      throw new BadRequestException('This test has concluded and is no longer open for attempts.');
    }

    // 1. Check for existing attempt
    let attempt = await this.prisma.testAttempt.findUnique({
      where: {
        testId_userId: {
          testId: test.id,
          userId,
        },
      },
      include: {
        answers: true,
      },
    });

    const now = new Date();

    // 2. If no attempt, initialize new attempt
    if (!attempt) {
      const expiresAt = new Date(now.getTime() + test.durationMinutes * 60 * 1000);

      attempt = await this.prisma.testAttempt.create({
        data: {
          testId: test.id,
          userId,
          startedAt: now,
          expiresAt,
          status: TestAttemptStatus.IN_PROGRESS,
          currentQuestion: 0,
        },
        include: {
          answers: true,
        },
      });

      // Pre-seed initial answer drafts with question boilerplate code
      const initialAnswersData = test.questions.map((q) => {
        const bp = (q.problem.boilerplate as Record<string, string>) || {};
        const defaultCode = bp['python'] || bp['python3'] || Object.values(bp)[0] || '';
        return {
          attemptId: attempt!.id,
          problemId: q.problem.id,
          code: defaultCode,
          language: 'python',
          status: 'unanswered',
          isMarkedForReview: false,
          isSubmitted: false,
        };
      });

      if (initialAnswersData.length > 0) {
        await this.prisma.testAnswer.createMany({
          data: initialAnswersData,
        });

        attempt = await this.prisma.testAttempt.findUnique({
          where: { id: attempt.id },
          include: { answers: true },
        });
      }
    }

    if (!attempt) {
      throw new BadRequestException('Failed to initialize test attempt.');
    }

    // 3. Check if server authoritative deadline has passed
    const isExpired =
      attempt.status === TestAttemptStatus.IN_PROGRESS &&
      now.getTime() > new Date(attempt.expiresAt).getTime();

    if (isExpired) {
      return this.finalizeAttempt(slug, userId);
    }

    // 4. Calculate exact remaining seconds from authoritative server deadline
    const totalSecondsLeft = Math.max(
      0,
      Math.floor((new Date(attempt.expiresAt).getTime() - now.getTime()) / 1000),
    );

    // Format answers dictionary for quick lookup by question index
    const answersMap: Record<number, any> = {};
    const problemIdToOrder = new Map<string, number>();
    test.questions.forEach((q) => {
      problemIdToOrder.set(q.problemId, q.orderIndex);
    });

    attempt.answers.forEach((ans) => {
      const order = problemIdToOrder.get(ans.problemId);
      if (order !== undefined) {
        answersMap[order] = {
          code: ans.code,
          language: ans.language,
          isMarkedForReview: ans.isMarkedForReview,
          isSubmitted: ans.isSubmitted,
          status: ans.status,
          verdict: ans.verdict,
          testsPassed: ans.testsPassed,
          totalTests: ans.totalTests,
          marksAwarded: ans.marksAwarded,
          timeSpentSeconds: ans.timeSpentSeconds,
        };
      }
    });

    // Format questions array for client (never expose hidden test cases!)
    const formattedQuestions = test.questions.map((q) => {
      return {
        id: q.id,
        number: q.orderIndex,
        problemId: q.problem.id,
        slug: q.problem.slug,
        title: q.problem.title,
        difficulty: q.problem.difficulty,
        marks: q.marks,
        description: q.problem.description,
        constraints: q.problem.constraints,
        hints: q.problem.hints,
        boilerplate: q.problem.boilerplate,
        topics: q.problem.topics.map((t) => t.topic.name),
        examples: q.problem.examples.map((ex) => ({
          input: ex.input,
          output: ex.output,
          explanation: ex.explanation,
        })),
        testCases: q.problem.examples.map((ex) => ({
          input: ex.input,
          expectedOutput: ex.output,
        })),
      };
    });

    return {
      attemptId: attempt.id,
      test: {
        id: test.id,
        slug: test.slug,
        title: test.title,
        durationMinutes: test.durationMinutes,
        passPercentage: test.passPercentage,
        totalMarks: test.totalMarks,
        totalQuestions: test.questions.length,
      },
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      totalSecondsLeft,
      currentQuestion: attempt.currentQuestion,
      status: attempt.status,
      questions: formattedQuestions,
      answers: answersMap,
    };
  }

  /**
   * Autosave student answer buffer (code, language, flags, current question index).
   */
  async autosaveAnswer(slug: string, userId: string, dto: AutosaveAnswerDto) {
    const attempt = await this.getValidActiveAttempt(slug, userId);

    const problem = await this.prisma.problem.findUnique({
      where: { slug: dto.problemSlug },
      select: { id: true },
    });

    if (!problem) {
      throw new NotFoundException(`Problem "${dto.problemSlug}" not found`);
    }

    const updatedAnswer = await this.prisma.testAnswer.upsert({
      where: {
        attemptId_problemId: {
          attemptId: attempt.id,
          problemId: problem.id,
        },
      },
      update: {
        code: dto.code,
        language: dto.language,
        isMarkedForReview: dto.isMarkedForReview ?? false,
        timeSpentSeconds: dto.timeSpentSeconds ?? 0,
        status: dto.isMarkedForReview ? 'marked' : 'unanswered',
      },
      create: {
        attemptId: attempt.id,
        problemId: problem.id,
        code: dto.code,
        language: dto.language,
        isMarkedForReview: dto.isMarkedForReview ?? false,
        timeSpentSeconds: dto.timeSpentSeconds ?? 0,
        status: dto.isMarkedForReview ? 'marked' : 'unanswered',
      },
    });

    if (dto.currentQuestionIndex !== undefined) {
      await this.prisma.testAttempt.update({
        where: { id: attempt.id },
        data: { currentQuestion: dto.currentQuestionIndex },
      });
    }

    return {
      success: true,
      savedAt: new Date().toISOString(),
      answerId: updatedAnswer.id,
    };
  }

  /**
   * Run code against sample test cases via Judge0 CE.
   */
  async runCode(slug: string, userId: string, dto: RunTestCodeDto) {
    await this.getValidActiveAttempt(slug, userId);

    return this.submissionsService.runCode(userId, {
      problemSlug: dto.problemSlug,
      language: dto.language,
      code: dto.code,
      customInput: dto.customInput,
    });
  }

  /**
   * Submit single question answer for evaluation against all test cases.
   */
  async submitQuestion(slug: string, userId: string, dto: SubmitQuestionDto) {
    const attempt = await this.getValidActiveAttempt(slug, userId);

    const submissionResult = await this.submissionsService.submit(userId, {
      problemSlug: dto.problemSlug,
      language: dto.language,
      code: dto.code,
    });

    const assignment = await this.prisma.testQuestionAssignment.findFirst({
      where: {
        testId: attempt.testId,
        problem: { slug: dto.problemSlug },
      },
    });

    const questionMarks = assignment?.marks ?? 20;
    const totalTests = Math.max(1, submissionResult.totalTests || 1);
    const testsPassed = submissionResult.testsPassed || 0;

    const marksAwarded =
      submissionResult.verdict === SubmissionVerdict.ACCEPTED
        ? questionMarks
        : Math.round((testsPassed / totalTests) * questionMarks);

    const problem = await this.prisma.problem.findUnique({
      where: { slug: dto.problemSlug },
      select: { id: true },
    });

    if (problem) {
      await this.prisma.testAnswer.upsert({
        where: {
          attemptId_problemId: {
            attemptId: attempt.id,
            problemId: problem.id,
          },
        },
        update: {
          code: dto.code,
          language: dto.language,
          isSubmitted: true,
          status: 'answered',
          verdict: submissionResult.verdict as SubmissionVerdict,
          testsPassed,
          totalTests,
          marksAwarded,
        },
        create: {
          attemptId: attempt.id,
          problemId: problem.id,
          code: dto.code,
          language: dto.language,
          isSubmitted: true,
          status: 'answered',
          verdict: submissionResult.verdict as SubmissionVerdict,
          testsPassed,
          totalTests,
          marksAwarded,
        },
      });
    }

    return {
      submissionId: submissionResult.id,
      verdict: submissionResult.verdict,
      testsPassed,
      totalTests,
      runtimeMs: submissionResult.runtimeMs,
      memoryKb: submissionResult.memoryKb,
      marksAwarded,
      maxMarks: questionMarks,
      compileError: submissionResult.compileError,
      stdout: submissionResult.stdout,
      stderr: submissionResult.stderr,
    };
  }

  /**
   * Finalize the entire test attempt and compute authoritative score.
   */
  async finalizeAttempt(slug: string, userId: string) {
    const test = await this.prisma.test.findUnique({
      where: { slug },
      include: {
        questions: true,
      },
    });

    if (!test) {
      throw new NotFoundException(`Test "${slug}" not found`);
    }

    const attempt = await this.prisma.testAttempt.findUnique({
      where: {
        testId_userId: {
          testId: test.id,
          userId,
        },
      },
      include: {
        answers: {
          include: {
            problem: { select: { slug: true, title: true } },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('No active test attempt found to finalize.');
    }

    if (attempt.status === TestAttemptStatus.SUBMITTED) {
      return {
        attemptId: attempt.id,
        testId: test.id,
        testSlug: test.slug,
        testTitle: test.title,
        status: attempt.status,
        score: attempt.score,
        totalMarks: test.totalMarks,
        percentage: attempt.percentage,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
        answers: attempt.answers,
      };
    }

    const totalScore = attempt.answers.reduce((acc, ans) => acc + (ans.marksAwarded || 0), 0);
    const percentage = Math.min(100, Math.round((totalScore / Math.max(1, test.totalMarks)) * 100));
    const passed = percentage >= test.passPercentage;

    const finalized = await this.prisma.testAttempt.update({
      where: { id: attempt.id },
      data: {
        status: TestAttemptStatus.SUBMITTED,
        submittedAt: new Date(),
        score: totalScore,
        percentage,
        passed,
      },
      include: {
        answers: {
          include: {
            problem: { select: { slug: true, title: true, difficulty: true } },
          },
        },
      },
    });

    if (passed) {
      try {
        await this.gamificationService.awardSolveReward({
          userId,
          problemId: test.questions[0]?.problemId || '',
          difficulty: 'MEDIUM',
          submissionId: finalized.id,
        });
      } catch (err) {
        this.logger.error(`Error awarding test completion XP: ${(err as Error).message}`);
      }
    }

    return {
      attemptId: finalized.id,
      testId: test.id,
      testSlug: test.slug,
      testTitle: test.title,
      status: finalized.status,
      score: finalized.score,
      totalMarks: test.totalMarks,
      percentage: finalized.percentage,
      passed: finalized.passed,
      submittedAt: finalized.submittedAt,
      answers: finalized.answers,
    };
  }

  /**
   * Get finalized result and submission breakdown for a user.
   */
  async getResult(slug: string, userId: string) {
    const test = await this.prisma.test.findUnique({
      where: { slug },
      include: {
        questions: {
          include: {
            problem: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test "${slug}" not found`);
    }

    const attempt = await this.prisma.testAttempt.findUnique({
      where: {
        testId_userId: {
          testId: test.id,
          userId,
        },
      },
      include: {
        answers: {
          include: {
            problem: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('You have not attempted this test yet.');
    }

    const startTime = new Date(attempt.startedAt).getTime();
    const endTime = attempt.submittedAt ? new Date(attempt.submittedAt).getTime() : Date.now();
    const totalMinutesSpent = Math.max(1, Math.round((endTime - startTime) / 60000));

    const answersByProblemId = new Map(attempt.answers.map((a) => [a.problemId, a]));

    const questionResults = test.questions.map((q) => {
      const ans = answersByProblemId.get(q.problemId);
      return {
        number: q.orderIndex,
        title: q.problem.title,
        slug: q.problem.slug,
        difficulty: q.problem.difficulty,
        maxMarks: q.marks,
        marksAwarded: ans?.marksAwarded ?? 0,
        status: ans?.isSubmitted ? 'SUBMITTED' : ans ? 'ATTEMPTED' : 'UNATTEMPTED',
        verdict: ans?.verdict ?? null,
        testsPassed: ans?.testsPassed ?? 0,
        totalTests: ans?.totalTests ?? 0,
        code: ans?.code ?? null,
        language: ans?.language ?? 'python',
        timeSpentSeconds: ans?.timeSpentSeconds ?? 0,
      };
    });

    const correctCount = questionResults.filter((q) => q.verdict === 'ACCEPTED').length;
    const partialCount = questionResults.filter((q) => q.marksAwarded > 0 && q.verdict !== 'ACCEPTED').length;
    const incorrectCount = questionResults.filter((q) => q.status === 'SUBMITTED' && q.marksAwarded === 0).length;
    const unattemptedCount = questionResults.filter((q) => q.status === 'UNATTEMPTED').length;

    return {
      attemptId: attempt.id,
      test: {
        id: test.id,
        slug: test.slug,
        title: test.title,
        weekNumber: test.weekNumber,
        durationMinutes: test.durationMinutes,
        passPercentage: test.passPercentage,
        totalMarks: test.totalMarks,
      },
      status: attempt.status,
      score: attempt.score,
      totalMarks: test.totalMarks,
      percentage: attempt.percentage,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      totalMinutesSpent,
      stats: {
        totalQuestions: test.questions.length,
        correctCount,
        partialCount,
        incorrectCount,
        unattemptedCount,
      },
      questions: questionResults,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Admin API Methods
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Admin Creates a Weekly Test with Question Assignments.
   */
  async createTest(adminId: string, dto: CreateTestDto) {
    const slug =
      dto.slug?.trim() ||
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '') ||
      `weekly-test-${Date.now()}`;

    const existing = await this.prisma.test.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Test with slug "${slug}" already exists`);
    }

    const test = await this.prisma.test.create({
      data: {
        slug,
        title: dto.title,
        description: dto.description,
        weekNumber: dto.weekNumber,
        instructions: dto.instructions,
        durationMinutes: dto.durationMinutes ?? 90,
        passPercentage: dto.passPercentage ?? 60,
        totalMarks: dto.totalMarks ?? 100,
        status: dto.status ?? ContentStatus.DRAFT,
        startTime: dto.startTime ? new Date(dto.startTime) : null,
        endTime: dto.endTime ? new Date(dto.endTime) : null,
        authorId: adminId,
      },
    });

    if (dto.problemSlugs && dto.problemSlugs.length > 0) {
      const problems = await this.prisma.problem.findMany({
        where: { slug: { in: dto.problemSlugs } },
      });

      const marksPerQuestion = Math.max(1, Math.floor(test.totalMarks / problems.length));

      for (let i = 0; i < problems.length; i++) {
        const prob = problems[i]!;
        await this.prisma.testQuestionAssignment.create({
          data: {
            testId: test.id,
            problemId: prob.id,
            orderIndex: i + 1,
            marks: marksPerQuestion,
          },
        });
      }
    }

    return this.getAdminTestById(test.id);
  }

  /**
   * Admin Updates a Test.
   */
  async updateTest(testId: string, dto: UpdateTestDto) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: { attempts: true },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID "${testId}" not found`);
    }

    if (test.attempts.length > 0 && dto.problemSlugs) {
      throw new BadRequestException(
        'Cannot modify question assignments for a test that students have already started.',
      );
    }

    const updated = await this.prisma.test.update({
      where: { id: testId },
      data: {
        title: dto.title ?? undefined,
        description: dto.description ?? undefined,
        weekNumber: dto.weekNumber ?? undefined,
        instructions: dto.instructions ?? undefined,
        durationMinutes: dto.durationMinutes ?? undefined,
        passPercentage: dto.passPercentage ?? undefined,
        totalMarks: dto.totalMarks ?? undefined,
        status: dto.status ?? undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      },
    });

    return this.getAdminTestById(updated.id);
  }

  /**
   * Admin view test by ID with attempts count and assigned questions.
   */
  async getAdminTestById(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        questions: {
          include: {
            problem: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                executionMode: true,
              },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        attempts: {
          select: {
            id: true,
            status: true,
            score: true,
            passed: true,
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID "${testId}" not found`);
    }

    return {
      ...test,
      totalAttempts: test.attempts.length,
      completedAttempts: test.attempts.filter((a) => a.status === TestAttemptStatus.SUBMITTED).length,
      averageScore:
        test.attempts.length > 0
          ? Math.round(
              test.attempts.reduce((acc, a) => acc + a.score, 0) / test.attempts.length,
            )
          : 0,
    };
  }

  /**
   * Admin view all student attempts for a test.
   */
  async getTestAttempts(testId: string) {
    const attempts = await this.prisma.testAttempt.findMany({
      where: { testId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    });

    return attempts.map((a) => ({
      id: a.id,
      user: a.user,
      status: a.status,
      score: a.score,
      percentage: a.percentage,
      passed: a.passed,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
    }));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Helper Methods
  // ───────────────────────────────────────────────────────────────────────────

  private async getValidActiveAttempt(slug: string, userId: string) {
    const test = await this.prisma.test.findUnique({
      where: { slug },
      select: { id: true, durationMinutes: true },
    });

    if (!test) {
      throw new NotFoundException(`Test "${slug}" not found`);
    }

    const attempt = await this.prisma.testAttempt.findUnique({
      where: {
        testId_userId: {
          testId: test.id,
          userId,
        },
      },
    });

    if (!attempt) {
      throw new BadRequestException('You have not started an attempt for this test.');
    }

    if (attempt.status === TestAttemptStatus.SUBMITTED) {
      throw new BadRequestException('This test has already been submitted and finalized.');
    }

    const deadlineWithGrace = new Date(attempt.expiresAt.getTime() + 30000);
    if (Date.now() > deadlineWithGrace.getTime()) {
      await this.prisma.testAttempt.update({
        where: { id: attempt.id },
        data: { status: TestAttemptStatus.EXPIRED },
      });
      throw new BadRequestException('The time allocated for this test has expired.');
    }

    return attempt;
  }
}
