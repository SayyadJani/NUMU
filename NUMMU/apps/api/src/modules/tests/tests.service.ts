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
import { CreateTestDto, TestQuestionItemDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { AutosaveAnswerDto } from './dto/autosave-answer.dto';
import { RunTestCodeDto } from './dto/run-test-code.dto';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { ReportViolationDto, FinalizeAttemptDto } from './dto/report-violation.dto';
import { ContentStatus, TestAttemptStatus, SubmissionVerdict, TestViolationType, Role } from '@prisma/client';

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
    const test = await this.prisma.test.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
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

    if (!test) {
      throw new NotFoundException(`Weekly Test "${slug}" not found`);
    }

    const requestingUser = userId
      ? await this.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true },
        })
      : null;
    const isStaff =
      requestingUser?.role === Role.PLATFORM_ADMIN || requestingUser?.role === Role.TRAINER;

    if (test.status !== ContentStatus.PUBLISHED && !isStaff) {
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
    const test = await this.prisma.test.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
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

    if (!test) {
      throw new NotFoundException(`Weekly Test "${slug}" not found`);
    }

    const requestingUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isStaff =
      requestingUser?.role === Role.PLATFORM_ADMIN || requestingUser?.role === Role.TRAINER;

    if (test.status !== ContentStatus.PUBLISHED && !isStaff) {
      throw new NotFoundException(`Weekly Test "${slug}" not found or not available`);
    }

    if (!isStaff) {
      if (test.startTime && new Date() < new Date(test.startTime)) {
        throw new BadRequestException('This test has not started yet.');
      }

      if (test.endTime && new Date() > new Date(test.endTime)) {
        throw new BadRequestException('This test has concluded and is no longer open for attempts.');
      }
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

    // If staff (Trainer / Platform Admin) has a submitted or expired attempt,
    // automatically reset it so they can conduct repeated live test-runs without barrier
    if (
      attempt &&
      isStaff &&
      (attempt.status === TestAttemptStatus.SUBMITTED || now.getTime() > new Date(attempt.expiresAt).getTime())
    ) {
      await this.prisma.testAnswer.deleteMany({ where: { attemptId: attempt.id } });
      await this.prisma.testViolation.deleteMany({ where: { attemptId: attempt.id } });

      const newExpiresAt = new Date(now.getTime() + test.durationMinutes * 60 * 1000);
      attempt = await this.prisma.testAttempt.update({
        where: { id: attempt.id },
        data: {
          status: TestAttemptStatus.IN_PROGRESS,
          startedAt: now,
          expiresAt: newExpiresAt,
          submittedAt: null,
          score: 0,
          percentage: 0,
          passed: false,
          currentQuestion: 0,
          tabSwitchCount: 0,
          fullscreenExitCount: 0,
          autoSubmitted: false,
          terminationReason: null,
        },
        include: {
          answers: true,
        },
      });

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

    // 3. Check if server authoritative deadline has passed
    const isExpired =
      attempt.status === TestAttemptStatus.IN_PROGRESS &&
      now.getTime() > new Date(attempt.expiresAt).getTime();

    if (isExpired) {
      const finalized = await this.finalizeAttempt(slug, userId);
      return {
        ...finalized,
        totalSecondsLeft: 0,
        questions: formattedQuestions,
      };
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
        maxTabSwitches: test.maxTabSwitches ?? 3,
        requireFullscreen: test.requireFullscreen ?? true,
        disableCopyPaste: test.disableCopyPaste ?? true,
      },
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      totalSecondsLeft,
      currentQuestion: attempt.currentQuestion,
      status: attempt.status,
      tabSwitchCount: attempt.tabSwitchCount ?? 0,
      fullscreenExitCount: attempt.fullscreenExitCount ?? 0,
      autoSubmitted: attempt.autoSubmitted ?? false,
      terminationReason: attempt.terminationReason ?? null,
      questions: formattedQuestions,
      answers: answersMap,
    };
  }

  /**
   * Record a proctoring violation (TAB_SWITCH or FULLSCREEN_EXIT).
   * If tabSwitchCount exceeds test.maxTabSwitches (default > 3), automatically finalizes and submits the test.
   */
  async reportViolation(slug: string, userId: string, dto: ReportViolationDto) {
    const test = await this.prisma.test.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      select: { id: true, maxTabSwitches: true, requireFullscreen: true },
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
      throw new BadRequestException('No active attempt found for this test.');
    }

    const maxTabSwitches = test.maxTabSwitches ?? 3;

    if (attempt.status !== TestAttemptStatus.IN_PROGRESS) {
      return {
        attemptId: attempt.id,
        status: attempt.status,
        tabSwitchCount: attempt.tabSwitchCount,
        fullscreenExitCount: attempt.fullscreenExitCount,
        maxTabSwitches,
        autoSubmitted: attempt.autoSubmitted,
        terminationReason: attempt.terminationReason,
      };
    }

    const isTabSwitch = dto.type === TestViolationType.TAB_SWITCH;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.testViolation.create({
        data: {
          attemptId: attempt.id,
          type: dto.type,
        },
      });

      return tx.testAttempt.update({
        where: { id: attempt.id },
        data: isTabSwitch
          ? { tabSwitchCount: { increment: 1 } }
          : { fullscreenExitCount: { increment: 1 } },
      });
    }, { maxWait: 15000, timeout: 30000 });

    // Auto-submit when tab switches exceed maxTabSwitches (i.e. > 3)
    if (updated.tabSwitchCount > maxTabSwitches) {
      const reason = `Auto-submitted: Exceeded maximum allowed tab switches (${maxTabSwitches})`;
      const finalized = await this.finalizeAttempt(slug, userId, {
        autoSubmitted: true,
        terminationReason: reason,
      });

      return {
        attemptId: updated.id,
        status: TestAttemptStatus.SUBMITTED,
        tabSwitchCount: updated.tabSwitchCount,
        fullscreenExitCount: updated.fullscreenExitCount,
        maxTabSwitches,
        autoSubmitted: true,
        terminationReason: reason,
        finalized,
      };
    }

    return {
      attemptId: updated.id,
      status: updated.status,
      tabSwitchCount: updated.tabSwitchCount,
      fullscreenExitCount: updated.fullscreenExitCount,
      maxTabSwitches,
      autoSubmitted: false,
      terminationReason: null,
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
  async finalizeAttempt(slug: string, userId: string, dto?: FinalizeAttemptDto) {
    const test = await this.prisma.test.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
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
        tabSwitchCount: attempt.tabSwitchCount,
        fullscreenExitCount: attempt.fullscreenExitCount,
        autoSubmitted: attempt.autoSubmitted,
        terminationReason: attempt.terminationReason,
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
        ...(dto?.autoSubmitted !== undefined && { autoSubmitted: dto.autoSubmitted }),
        ...(dto?.terminationReason !== undefined && { terminationReason: dto.terminationReason }),
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
      tabSwitchCount: finalized.tabSwitchCount,
      fullscreenExitCount: finalized.fullscreenExitCount,
      autoSubmitted: finalized.autoSubmitted,
      terminationReason: finalized.terminationReason,
      answers: finalized.answers,
    };
  }

  /**
   * Get finalized result and submission breakdown for a user.
   */
  async getResult(slug: string, userId: string) {
    const test = await this.prisma.test.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
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
        maxTabSwitches: test.maxTabSwitches ?? 3,
        requireFullscreen: test.requireFullscreen ?? true,
      },
      status: attempt.status,
      score: attempt.score,
      totalMarks: test.totalMarks,
      percentage: attempt.percentage,
      passed: attempt.passed,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      totalMinutesSpent,
      tabSwitchCount: attempt.tabSwitchCount ?? 0,
      fullscreenExitCount: attempt.fullscreenExitCount ?? 0,
      autoSubmitted: attempt.autoSubmitted ?? false,
      terminationReason: attempt.terminationReason ?? null,
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
   * Admin: Platform-wide overview KPIs and recent activity for the Admin Console.
   */
  async getAdminOverview() {
    const [
      totalStudents,
      activeStudents,
      totalProblems,
      publishedProblems,
      draftProblems,
      totalTests,
      publishedTests,
      totalSubmissions,
      acceptedSubmissions,
      totalAttempts,
      completedAttempts,
      ongoingAttempts,
      autoSubmittedAttempts,
      avgScoreAgg,
      totalBatches,
      totalTopics,
      recentAttempts,
      recentSubmissions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.user.count({ where: { role: Role.STUDENT, isActive: true } }),
      this.prisma.problem.count({ where: { status: { not: ContentStatus.ARCHIVED } } }),
      this.prisma.problem.count({ where: { status: ContentStatus.PUBLISHED } }),
      this.prisma.problem.count({ where: { status: ContentStatus.DRAFT } }),
      this.prisma.test.count(),
      this.prisma.test.count({ where: { status: ContentStatus.PUBLISHED } }),
      this.prisma.submission.count(),
      this.prisma.submission.count({ where: { verdict: SubmissionVerdict.ACCEPTED } }),
      this.prisma.testAttempt.count(),
      this.prisma.testAttempt.count({ where: { status: TestAttemptStatus.SUBMITTED } }),
      this.prisma.testAttempt.count({ where: { status: TestAttemptStatus.IN_PROGRESS } }),
      this.prisma.testAttempt.count({ where: { autoSubmitted: true } }),
      this.prisma.testAttempt.aggregate({
        where: { status: TestAttemptStatus.SUBMITTED },
        _avg: { percentage: true },
      }),
      this.prisma.organization.count(),
      this.prisma.topic.count(),
      this.prisma.testAttempt.findMany({
        take: 8,
        orderBy: { startedAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, username: true } },
          test: { select: { id: true, title: true, slug: true, totalMarks: true, maxTabSwitches: true } },
        },
      }),
      this.prisma.submission.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, username: true } },
          problem: { select: { id: true, title: true, slug: true, difficulty: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalStudents,
        activeStudents,
        inactiveStudents: Math.max(0, totalStudents - activeStudents),
        totalProblems,
        publishedProblems,
        draftProblems,
        totalTests,
        publishedTests,
        totalSubmissions,
        acceptedSubmissions,
        submissionPassRate:
          totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0,
        totalAttempts,
        completedAttempts,
        ongoingAttempts,
        autoSubmittedAttempts,
        averageAssessmentScore: Math.round(avgScoreAgg._avg.percentage ?? 0),
        totalBatches,
        totalTopics,
      },
      recentAttempts,
      recentSubmissions,
    };
  }

  /**
   * Admin: List all tests (DRAFT, PUBLISHED, ARCHIVED) with question & attempt metrics.
   */
  async listAdminTests() {
    const tests = await this.prisma.test.findMany({
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
                status: true,
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
            percentage: true,
            passed: true,
            tabSwitchCount: true,
            autoSubmitted: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tests.map((t) => {
      const completed = t.attempts.filter((a) => a.status === TestAttemptStatus.SUBMITTED);
      const passedCount = completed.filter((a) => a.passed).length;
      return {
        ...t,
        totalQuestions: t.questions.length,
        totalAttempts: t.attempts.length,
        completedAttempts: completed.length,
        autoSubmittedCount: t.attempts.filter((a) => a.autoSubmitted).length,
        passRate: completed.length > 0 ? Math.round((passedCount / completed.length) * 100) : 0,
        averageScore:
          completed.length > 0
            ? Math.round(completed.reduce((acc, a) => acc + a.score, 0) / completed.length)
            : 0,
      };
    });
  }

  /**
   * Resolves either `dto.questions` or `dto.problemSlugs` into ordered problem assignments.
   */
  private async resolveQuestionAssignments(
    dto: { questions?: TestQuestionItemDto[]; problemSlugs?: string[]; totalMarks?: number },
    fallbackTotalMarks: number,
  ): Promise<Array<{ problemId: string; orderIndex: number; marks: number }>> {
    if (dto.questions && dto.questions.length > 0) {
      const keys = dto.questions.map((q) => q.problemIdOrSlug.trim());
      const problems = await this.prisma.problem.findMany({
        where: { OR: [{ id: { in: keys } }, { slug: { in: keys } }] },
        select: { id: true, slug: true },
      });
      const lookup = new Map<string, string>();
      problems.forEach((p) => {
        lookup.set(p.id, p.id);
        lookup.set(p.slug, p.id);
      });

      const resolved: Array<{ problemId: string; orderIndex: number; marks: number }> = [];
      const seenProblemIds = new Set<string>();
      dto.questions.forEach((item, idx) => {
        const pid = lookup.get(item.problemIdOrSlug.trim());
        if (pid && !seenProblemIds.has(pid)) {
          seenProblemIds.add(pid);
          resolved.push({
            problemId: pid,
            orderIndex: resolved.length + 1,
            marks: item.marks ?? 20,
          });
        }
      });
      return resolved;
    }

    if (dto.problemSlugs && dto.problemSlugs.length > 0) {
      const cleanKeys = dto.problemSlugs.map((s) => s.trim());
      const problems = await this.prisma.problem.findMany({
        where: { OR: [{ slug: { in: cleanKeys } }, { id: { in: cleanKeys } }] },
        select: { id: true, slug: true },
      });
      const lookup = new Map<string, string>();
      problems.forEach((p) => {
        lookup.set(p.id, p.id);
        lookup.set(p.slug, p.id);
      });

      const orderedIds: string[] = [];
      const seen = new Set<string>();
      cleanKeys.forEach((k) => {
        const pid = lookup.get(k);
        if (pid && !seen.has(pid)) {
          seen.add(pid);
          orderedIds.push(pid);
        }
      });

      const marksEach = Math.max(1, Math.floor(fallbackTotalMarks / Math.max(1, orderedIds.length)));
      return orderedIds.map((problemId, i) => ({
        problemId,
        orderIndex: i + 1,
        marks: marksEach,
      }));
    }

    return [];
  }

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

    const assignments = await this.resolveQuestionAssignments(dto, dto.totalMarks ?? 100);
    const computedMarks =
      dto.totalMarks ??
      (assignments.length > 0 ? assignments.reduce((s, a) => s + a.marks, 0) : 100);

    const test = await this.prisma.$transaction(async (tx) => {
      const created = await tx.test.create({
        data: {
          slug,
          title: dto.title.trim(),
          description: dto.description,
          weekNumber: dto.weekNumber,
          instructions: dto.instructions,
          durationMinutes: dto.durationMinutes ?? 90,
          passPercentage: dto.passPercentage ?? 60,
          totalMarks: computedMarks,
          status: dto.status ?? ContentStatus.DRAFT,
          startTime: dto.startTime ? new Date(dto.startTime) : null,
          endTime: dto.endTime ? new Date(dto.endTime) : null,
          maxTabSwitches: dto.maxTabSwitches ?? 3,
          requireFullscreen: dto.requireFullscreen ?? true,
          disableCopyPaste: dto.disableCopyPaste ?? true,
          authorId: adminId,
        },
      });

      for (const item of assignments) {
        await tx.testQuestionAssignment.create({
          data: {
            testId: created.id,
            problemId: item.problemId,
            orderIndex: item.orderIndex,
            marks: item.marks,
          },
        });
      }

      return created;
    }, { maxWait: 15000, timeout: 30000 });

    return this.getAdminTestById(test.id);
  }

  /**
   * Admin Updates a Test (metadata, proctoring rules, schedule, and ordered question format).
   */
  async updateTest(testId: string, dto: UpdateTestDto) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID "${testId}" not found`);
    }

    const hasQuestionUpdate = dto.questions !== undefined || dto.problemSlugs !== undefined;
    const assignments = hasQuestionUpdate
      ? await this.resolveQuestionAssignments(dto, dto.totalMarks ?? test.totalMarks)
      : [];

    const computedMarks =
      dto.totalMarks ??
      (hasQuestionUpdate && assignments.length > 0
        ? assignments.reduce((s, a) => s + a.marks, 0)
        : undefined);

    await this.prisma.$transaction(async (tx) => {
      await tx.test.update({
        where: { id: testId },
        data: {
          ...(dto.title !== undefined && { title: dto.title.trim() }),
          ...(dto.slug !== undefined && { slug: dto.slug.trim() }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.weekNumber !== undefined && { weekNumber: dto.weekNumber }),
          ...(dto.instructions !== undefined && { instructions: dto.instructions }),
          ...(dto.durationMinutes !== undefined && { durationMinutes: dto.durationMinutes }),
          ...(dto.passPercentage !== undefined && { passPercentage: dto.passPercentage }),
          ...(computedMarks !== undefined && { totalMarks: computedMarks }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.startTime !== undefined && {
            startTime: dto.startTime ? new Date(dto.startTime) : null,
          }),
          ...(dto.endTime !== undefined && {
            endTime: dto.endTime ? new Date(dto.endTime) : null,
          }),
          ...(dto.maxTabSwitches !== undefined && { maxTabSwitches: dto.maxTabSwitches }),
          ...(dto.requireFullscreen !== undefined && { requireFullscreen: dto.requireFullscreen }),
          ...(dto.disableCopyPaste !== undefined && { disableCopyPaste: dto.disableCopyPaste }),
        },
      });

      if (hasQuestionUpdate) {
        await tx.testQuestionAssignment.deleteMany({ where: { testId } });
        for (const item of assignments) {
          await tx.testQuestionAssignment.create({
            data: {
              testId,
              problemId: item.problemId,
              orderIndex: item.orderIndex,
              marks: item.marks,
            },
          });
        }
      }
    }, { maxWait: 15000, timeout: 30000 });

    return this.getAdminTestById(testId);
  }

  /**
   * Admin Deletes or Archives a Test.
   * If historical student attempts exist, safely archives the test to preserve records.
   */
  async deleteTest(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      include: { _count: { select: { attempts: true } } },
    });
    if (!test) {
      throw new NotFoundException(`Test with ID "${testId}" not found`);
    }
    if (test._count.attempts > 0) {
      await this.prisma.test.update({
        where: { id: testId },
        data: { status: ContentStatus.ARCHIVED },
      });
      return {
        archived: true,
        message: `Test "${test.title}" has ${test._count.attempts} student attempt(s) and was safely archived to preserve historical records.`,
      };
    }
    await this.prisma.test.delete({ where: { id: testId } });
    return { archived: false, message: `Test "${test.title}" deleted successfully` };
  }

  /**
   * Admin Duplicates an Existing Test (creates a DRAFT copy with identical question assignments & proctoring).
   */
  async duplicateTest(adminId: string, testId: string) {
    const source = await this.prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
      },
    });
    if (!source) {
      throw new NotFoundException(`Test with ID "${testId}" not found`);
    }

    const suffix = Math.random().toString(36).slice(2, 6);
    const newSlug = `${source.slug}-copy-${suffix}`;
    const newTitle = `${source.title} (Copy)`;

    const created = await this.prisma.$transaction(async (tx) => {
      const copy = await tx.test.create({
        data: {
          slug: newSlug,
          title: newTitle,
          description: source.description,
          weekNumber: source.weekNumber,
          instructions: source.instructions,
          durationMinutes: source.durationMinutes,
          passPercentage: source.passPercentage,
          totalMarks: source.totalMarks,
          status: ContentStatus.DRAFT,
          maxTabSwitches: source.maxTabSwitches,
          requireFullscreen: source.requireFullscreen,
          disableCopyPaste: source.disableCopyPaste,
          authorId: adminId,
        },
      });

      for (const q of source.questions) {
        await tx.testQuestionAssignment.create({
          data: {
            testId: copy.id,
            problemId: q.problemId,
            orderIndex: q.orderIndex,
            marks: q.marks,
          },
        });
      }

      return copy;
    }, { maxWait: 15000, timeout: 30000 });

    return this.getAdminTestById(created.id);
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
                status: true,
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
            tabSwitchCount: true,
            fullscreenExitCount: true,
            autoSubmitted: true,
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
      autoSubmittedCount: test.attempts.filter((a) => a.autoSubmitted).length,
      averageScore:
        test.attempts.length > 0
          ? Math.round(
              test.attempts.reduce((acc, a) => acc + a.score, 0) / test.attempts.length,
            )
          : 0,
    };
  }

  /**
   * Admin view all student attempts for a test (with proctoring logs & per-question answers).
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
            profile: { select: { college: true, gradYear: true } },
          },
        },
        answers: {
          include: {
            problem: { select: { id: true, title: true, slug: true, difficulty: true } },
          },
        },
        violations: {
          orderBy: { occurredAt: 'asc' },
        },
      },
      orderBy: [{ score: 'desc' }, { startedAt: 'desc' }],
    });

    return attempts.map((a) => ({
      id: a.id,
      user: a.user,
      status: a.status,
      score: a.score,
      percentage: a.percentage,
      passed: a.passed,
      tabSwitchCount: a.tabSwitchCount,
      fullscreenExitCount: a.fullscreenExitCount,
      autoSubmitted: a.autoSubmitted,
      terminationReason: a.terminationReason,
      startedAt: a.startedAt,
      expiresAt: a.expiresAt,
      submittedAt: a.submittedAt,
      answers: a.answers,
      violations: a.violations,
    }));
  }

  /**
   * Admin resets/deletes a student attempt so the student can retake the test.
   */
  async deleteTestAttempt(testId: string, attemptId: string) {
    const attempt = await this.prisma.testAttempt.findFirst({
      where: { id: attemptId, testId },
    });
    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }
    await this.prisma.testAttempt.delete({ where: { id: attemptId } });
    return { message: 'Student test attempt has been reset' };
  }

  /**
   * Admin reassigns / unlocks an attempt (especially if accidentally auto-submitted).
   * Resets tabSwitchCount to 0, clears autoSubmitted and terminationReason,
   * sets status back to IN_PROGRESS, and extends expiresAt by extraMinutes (or default test duration).
   */
  async reassignTestAttempt(
    testId: string,
    attemptId: string,
    options?: { extraMinutes?: number; preserveAnswers?: boolean },
  ) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { id: true, durationMinutes: true, title: true },
    });
    if (!test) {
      throw new NotFoundException('Test not found');
    }

    const attempt = await this.prisma.testAttempt.findFirst({
      where: { id: attemptId, testId },
    });
    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    const extraMins = options?.extraMinutes && options.extraMinutes > 0 ? options.extraMinutes : test.durationMinutes;
    const newExpiresAt = new Date(Date.now() + extraMins * 60 * 1000);

    const updated = await this.prisma.testAttempt.update({
      where: { id: attemptId },
      data: {
        status: TestAttemptStatus.IN_PROGRESS,
        tabSwitchCount: 0,
        fullscreenExitCount: 0,
        autoSubmitted: false,
        terminationReason: null,
        submittedAt: null,
        expiresAt: newExpiresAt,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Also remove recorded violations so student starts with a clean slate
    await this.prisma.testViolation.deleteMany({
      where: { attemptId },
    });

    return {
      success: true,
      message: `Test "${test.title}" reassigned for ${updated.user.name || updated.user.email}. Proctoring strikes reset, status set to In Progress with ${extraMins} mins.`,
      attempt: updated,
    };
  }

  /**
   * Reset attempt for current trainer or staff user so they can test-run again.
   */
  async resetSelfAttempt(slug: string, userId: string) {
    const test = await this.prisma.test.findFirst({
      where: { OR: [{ slug }, { id: slug }] },
      select: { id: true, title: true },
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
      return { success: true, message: 'No attempt found to reset' };
    }

    await this.prisma.testAnswer.deleteMany({ where: { attemptId: attempt.id } });
    await this.prisma.testViolation.deleteMany({ where: { attemptId: attempt.id } });
    await this.prisma.testAttempt.delete({ where: { id: attempt.id } });

    return { success: true, message: `Attempt reset for "${test.title}". You can now start a fresh test run.` };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Helper Methods
  // ───────────────────────────────────────────────────────────────────────────

  private async getValidActiveAttempt(slug: string, userId: string) {
    const test = await this.prisma.test.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
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
