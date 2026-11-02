import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EXECUTION_PROVIDER,
  ExecutionProvider,
  ExecutionJob,
  ExecutionResult,
} from './providers/execution-provider.interface';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { RunCodeDto } from './dto/run-code.dto';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { Role, SubmissionVerdict, SubmissionStatus, Prisma } from '@prisma/client';
import { OutputComparatorService } from './comparators/output-comparator.service';
import { LanguageRegistry } from './registry/language.registry';
import { GamificationService } from '../gamification/gamification.service';
import type {
  RunResult,
  SubmissionDetail,
  SubmissionListItem,
  PaginatedSubmissionsResult,
  TestCaseRunResult,
} from '@numu/types';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EXECUTION_PROVIDER)
    private readonly executionProvider: ExecutionProvider,
    private readonly outputComparatorService: OutputComparatorService,
    private readonly languageRegistry: LanguageRegistry,
    private readonly gamificationService: GamificationService,
  ) {}

  /**
   * Ephemeral code run against all unhidden sample testcases (or custom input).
   * Does NOT persist a submission record to the database.
   */
  async runCode(userId: string, dto: RunCodeDto): Promise<RunResult> {
    const problem = await this.prisma.problem.findUnique({
      where: { slug: dto.problemSlug },
      include: {
        testCases: { where: { isHidden: false }, orderBy: { orderIndex: 'asc' } },
        examples: { orderBy: { order: 'asc' } },
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with slug "${dto.problemSlug}" not found`);
    }

    const langConfig = this.languageRegistry.get(dto.language);
    const cpuLimit = langConfig?.defaultCpuLimitMs ?? 2000;
    const memoryLimit = langConfig?.defaultMemoryLimitKb ?? 262144;

    // Custom input branch
    if (dto.customInput !== undefined && dto.customInput.trim().length > 0) {
      const job: ExecutionJob = {
        sourceCode: dto.code,
        language: dto.language,
        stdin: dto.customInput,
        expectedOutput: '',
        cpuTimeLimitMs: cpuLimit,
        memoryLimitKb: memoryLimit,
      };

      const result = await this.executionProvider.runSingle(job);
      const userOutput = result.stdout ? result.stdout.trim() : null;

      return {
        status: 'COMPLETED',
        verdict: result.verdict,
        runtimeMs: result.runtimeMs,
        memoryKb: result.memoryKb,
        stdout: result.stdout,
        stderr: result.stderr,
        compileError: result.compileOutput,
        expectedOutput: null,
        userOutput,
        isMatch: result.verdict === 'ACCEPTED',
        totalTests: 1,
        testsPassed: result.verdict === 'ACCEPTED' ? 1 : 0,
        testCases: [
          {
            index: 1,
            input: dto.customInput,
            expectedOutput: '',
            userOutput,
            status: result.verdict,
            isMatch: result.verdict === 'ACCEPTED',
            runtimeMs: result.runtimeMs,
            memoryKb: result.memoryKb,
            stdout: result.stdout,
            stderr: result.stderr,
          },
        ],
      };
    }

    // Default: Run against ALL unhidden test cases
    const unhiddenCases: Array<{ input: string; expectedOutput: string }> =
      problem.testCases && problem.testCases.length > 0
        ? problem.testCases.map((tc) => ({ input: tc.input, expectedOutput: tc.expectedOutput }))
        : (problem.examples || []).map((ex) => ({ input: ex.input, expectedOutput: ex.output }));

    if (unhiddenCases.length === 0) {
      unhiddenCases.push({ input: '', expectedOutput: '' });
    }

    const jobs: ExecutionJob[] = unhiddenCases.map((tc) => ({
      sourceCode: dto.code,
      language: dto.language,
      stdin: tc.input,
      expectedOutput: tc.expectedOutput,
      cpuTimeLimitMs: cpuLimit,
      memoryLimitKb: memoryLimit,
    }));

    const results = await Promise.all(
      jobs.map((job) => this.executionProvider.runSingle(job)),
    );

    let testsPassed = 0;
    let maxRuntime = 0;
    let maxMemory = 0;
    let aggregateStderr: string | null = null;
    let aggregateCompileError: string | null = null;
    let aggregateStdout: string | null = null;
    let overallVerdict: SubmissionVerdict = 'ACCEPTED';

    const testCaseResults: TestCaseRunResult[] = results.map((res, i) => {
      const tc = unhiddenCases[i]!;
      const userOutput = res.stdout ? res.stdout.trim() : null;
      const cleanExpected = tc.expectedOutput.trim();
      const isMatch = this.outputComparatorService.compare(userOutput, cleanExpected, {
        problemSlug: problem.slug,
      }).isMatch;

      let caseVerdict: SubmissionVerdict = res.verdict as SubmissionVerdict;
      if (res.verdict === 'ACCEPTED' || res.statusId === 3) {
        caseVerdict = isMatch ? 'ACCEPTED' : 'WRONG_ANSWER';
      }

      if (caseVerdict === 'ACCEPTED') {
        testsPassed++;
      } else if (overallVerdict === 'ACCEPTED') {
        overallVerdict = caseVerdict;
      }

      if (res.runtimeMs && res.runtimeMs > maxRuntime) maxRuntime = res.runtimeMs;
      if (res.memoryKb && res.memoryKb > maxMemory) maxMemory = res.memoryKb;
      if (res.stderr && !aggregateStderr) aggregateStderr = res.stderr;
      if (res.compileOutput && !aggregateCompileError) aggregateCompileError = res.compileOutput;
      if (res.stdout && !aggregateStdout) aggregateStdout = res.stdout;

      return {
        index: i + 1,
        input: tc.input,
        expectedOutput: cleanExpected,
        userOutput,
        status: caseVerdict,
        isMatch,
        runtimeMs: res.runtimeMs,
        memoryKb: res.memoryKb,
        stdout: res.stdout,
        stderr: res.stderr,
      };
    });

    const compError = results.find(
      (r) => r.verdict === 'COMPILATION_ERROR' || Boolean(r.compileOutput),
    );
    if (compError) {
      overallVerdict = 'COMPILATION_ERROR';
      aggregateCompileError = compError.compileOutput || 'Compilation error';
    }

    const firstCase = testCaseResults[0];

    return {
      status: 'COMPLETED',
      verdict: overallVerdict,
      runtimeMs: maxRuntime || firstCase?.runtimeMs || null,
      memoryKb: maxMemory || firstCase?.memoryKb || null,
      stdout: aggregateStdout,
      stderr: aggregateStderr,
      compileError: aggregateCompileError,
      expectedOutput: firstCase?.expectedOutput || null,
      userOutput: firstCase?.userOutput || null,
      isMatch: overallVerdict === 'ACCEPTED',
      testCases: testCaseResults,
      totalTests: testCaseResults.length,
      testsPassed,
    };
  }

  /**
   * Formal submission against all test cases.
   * Persists the submission, transitions states, and calculates terminal verdict.
   */
  async submit(userId: string, dto: SubmitCodeDto): Promise<SubmissionDetail> {
    const problem = await this.prisma.problem.findUnique({
      where: { slug: dto.problemSlug },
      include: {
        testCases: { orderBy: { orderIndex: 'asc' } },
        examples: { orderBy: { order: 'asc' } },
      },
    });

    if (!problem) {
      throw new NotFoundException(`Problem with slug "${dto.problemSlug}" not found`);
    }

    // Prepare evaluation test suite
    let evaluationCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }> = [];

    if (problem.testCases && problem.testCases.length > 0) {
      evaluationCases = problem.testCases.map((tc) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden,
      }));
    } else if (problem.examples && problem.examples.length > 0) {
      evaluationCases = problem.examples.map((ex) => ({
        input: ex.input,
        expectedOutput: ex.output,
        isHidden: false,
      }));
    } else {
      // Minimal fallback if problem has no registered test cases
      evaluationCases = [{ input: '', expectedOutput: '', isHidden: false }];
    }

    // 1. Initial database persistence with QUEUED status
    const submission = await this.prisma.submission.create({
      data: {
        problemId: problem.id,
        userId,
        language: dto.language,
        code: dto.code,
        status: SubmissionStatus.QUEUED,
        verdict: SubmissionVerdict.PENDING,
        totalTests: evaluationCases.length,
        testsPassed: 0,
      },
    });

    // 2. Transition to PROCESSING
    await this.prisma.submission.update({
      where: { id: submission.id },
      data: { status: SubmissionStatus.PROCESSING },
    });

    // 3. Dispatch batch to ExecutionProvider
    const langConfig = this.languageRegistry.get(dto.language);
    const cpuLimit = langConfig?.defaultCpuLimitMs ?? 2000;
    const memoryLimit = langConfig?.defaultMemoryLimitKb ?? 262144;

    const jobs: ExecutionJob[] = evaluationCases.map((tc) => ({
      sourceCode: dto.code,
      language: dto.language,
      stdin: tc.input,
      expectedOutput: tc.expectedOutput,
      cpuTimeLimitMs: cpuLimit,
      memoryLimitKb: memoryLimit,
    }));

    const results: ExecutionResult[] = [];
    const chunkSize = 2;
    for (let i = 0; i < jobs.length; i += chunkSize) {
      const chunk = jobs.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(
        chunk.map((job) => this.executionProvider.runSingle(job)),
      );
      results.push(...chunkResults);
      if (chunkResults.some((r) => r.verdict === 'COMPILATION_ERROR')) {
        break;
      }
    }

    // 4. Aggregate outcomes and calculate final verdict
    const outcome = this.calculateTerminalVerdict(results, evaluationCases, problem.slug);

    // 5. Update submission record with terminal result
    const updated = await this.prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: SubmissionStatus.COMPLETED,
        verdict: outcome.verdict,
        runtimeMs: outcome.runtimeMs,
        memoryKb: outcome.memoryKb,
        testsPassed: outcome.testsPassed,
        compileError: outcome.compileError,
        stdout: outcome.stdout,
        stderr: outcome.stderr,
        judge0Tokens: [],
      },
      include: {
        problem: { select: { slug: true, title: true } },
      },
    });

    // 6. Update acceptance rate and trigger gamification reward if accepted
    if (outcome.verdict === SubmissionVerdict.ACCEPTED) {
      void this.updateProblemAcceptanceRate(problem.id);
      try {
        await this.gamificationService.awardSolveReward({
          userId,
          problemId: problem.id,
          difficulty: problem.difficulty,
          submissionId: updated.id,
        });
      } catch (err) {
        this.logger.error(`Error awarding gamification solve XP: ${(err as Error).message}`);
      }
    }

    return this.mapToDetail(updated);
  }

  /**
   * Retrieves single submission detail with ownership security checks.
   */
  async findById(id: string, user?: AuthenticatedUser): Promise<SubmissionDetail> {
    if (!user) {
      throw new UnauthorizedException('Authentication credentials missing');
    }

    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        problem: { select: { slug: true, title: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID "${id}" not found`);
    }

    // Ownership check: user must be the author or have privileged role
    const isOwner = submission.userId === user.id;
    const isPrivileged = user.role === Role.PLATFORM_ADMIN || user.role === Role.TRAINER;

    if (!isOwner && !isPrivileged) {
      throw new ForbiddenException('You do not have permission to view this submission');
    }

    return this.mapToDetail(submission);
  }

  /**
   * Lists submissions made by the currently authenticated user with filtering & pagination.
   */
  async findAll(
    user: AuthenticatedUser,
    query: SubmissionQueryDto,
  ): Promise<PaginatedSubmissionsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SubmissionWhereInput = {
      userId: user.id,
    };

    if (query.problemSlug) {
      where.problem = { slug: query.problemSlug };
    }

    if (query.verdict) {
      where.verdict = query.verdict;
    }

    const [items, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          problem: { select: { slug: true, title: true } },
        },
      }),
      this.prisma.submission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: items.map((s) => ({
        id: s.id,
        problemSlug: s.problem.slug,
        problemTitle: s.problem.title,
        language: s.language,
        status: s.status as SubmissionStatus,
        verdict: s.verdict as SubmissionVerdict,
        runtimeMs: s.runtimeMs,
        memoryKb: s.memoryKb,
        testsPassed: s.testsPassed,
        totalTests: s.totalTests,
        createdAt: s.createdAt.toISOString(),
      })),
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Retrieves user submissions for a specific problem.
   */
  async findByProblem(
    problemSlug: string,
    user: AuthenticatedUser,
  ): Promise<SubmissionListItem[]> {
    const submissions = await this.prisma.submission.findMany({
      where: {
        userId: user.id,
        problem: { slug: problemSlug },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        problem: { select: { slug: true, title: true } },
      },
    });

    return submissions.map((s) => ({
      id: s.id,
      problemSlug: s.problem.slug,
      problemTitle: s.problem.title,
      language: s.language,
      status: s.status as SubmissionStatus,
      verdict: s.verdict as SubmissionVerdict,
      runtimeMs: s.runtimeMs,
      memoryKb: s.memoryKb,
      testsPassed: s.testsPassed,
      totalTests: s.totalTests,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  /**
   * Evaluates test case results according to strict priority order.
   */
  private calculateTerminalVerdict(
    results: ExecutionResult[],
    cases: Array<{ input: string; expectedOutput: string; isHidden: boolean }>,
    problemSlug?: string,
  ): {
    verdict: SubmissionVerdict;
    runtimeMs: number | null;
    memoryKb: number | null;
    testsPassed: number;
    compileError: string | null;
    stdout: string | null;
    stderr: string | null;
  } {
    let testsPassed = 0;
    let maxRuntime = 0;
    let maxMemory = 0;
    const compileError: string | null = null;
    let stdout: string | null = null;
    let stderr: string | null = null;

    // Check for compilation error first
    const compError = results.find((r) => r.verdict === 'COMPILATION_ERROR' || Boolean(r.compileOutput));
    if (compError) {
      return {
        verdict: SubmissionVerdict.COMPILATION_ERROR,
        runtimeMs: null,
        memoryKb: null,
        testsPassed: 0,
        compileError: compError.compileOutput || 'Compilation failed',
        stdout: null,
        stderr: null,
      };
    }

    let firstFailureVerdict: SubmissionVerdict | null = null;

    for (let i = 0; i < results.length; i++) {
      const res = results[i]!;
      const testCase = cases[i];

      if (res.runtimeMs && res.runtimeMs > maxRuntime) maxRuntime = res.runtimeMs;
      if (res.memoryKb && res.memoryKb > maxMemory) maxMemory = res.memoryKb;

      const userOutput = res.stdout ? res.stdout.trim() : null;
      const expectedOutput = testCase?.expectedOutput ? testCase.expectedOutput.trim() : '';
      const isMatch = this.outputComparatorService.compare(userOutput, expectedOutput, {
        problemSlug,
      }).isMatch;

      const caseVerdict: SubmissionVerdict =
        res.verdict === 'ACCEPTED' || res.statusId === 3
          ? isMatch
            ? SubmissionVerdict.ACCEPTED
            : SubmissionVerdict.WRONG_ANSWER
          : (res.verdict as SubmissionVerdict);

      if (caseVerdict === SubmissionVerdict.ACCEPTED) {
        testsPassed++;
        if (!stdout && res.stdout && testCase && !testCase.isHidden) {
          stdout = res.stdout;
        }
      } else {
        if (!firstFailureVerdict) {
          firstFailureVerdict = caseVerdict;
          if (res.stderr) stderr = res.stderr;
          if (!testCase?.isHidden && res.stdout) stdout = res.stdout;
        }
      }
    }

    const finalVerdict = firstFailureVerdict || SubmissionVerdict.ACCEPTED;

    return {
      verdict: finalVerdict,
      runtimeMs: maxRuntime || 35,
      memoryKb: maxMemory || 14200,
      testsPassed,
      compileError,
      stdout,
      stderr,
    };
  }

  /**
   * Helper to robustly compare actual vs expected outputs.
   * Delegates to OutputComparatorService.
   */
  private isOutputMatching(
    actual: string | null | undefined,
    expected: string | null | undefined,
  ): boolean {
    return this.outputComparatorService.compare(actual, expected).isMatch;
  }

  private async updateProblemAcceptanceRate(problemId: string): Promise<void> {
    try {
      const [total, accepted] = await Promise.all([
        this.prisma.submission.count({ where: { problemId } }),
        this.prisma.submission.count({
          where: { problemId, verdict: SubmissionVerdict.ACCEPTED },
        }),
      ]);

      if (total > 0) {
        const rate = Number(((accepted / total) * 100).toFixed(1));
        await this.prisma.problem.update({
          where: { id: problemId },
          data: { acceptanceRate: rate },
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to update problem acceptance rate: ${err}`);
    }
  }

  private mapToDetail(
    s: Prisma.SubmissionGetPayload<{ include: { problem: { select: { slug: true; title: true } } } }>,
  ): SubmissionDetail {
    return {
      id: s.id,
      problemSlug: s.problem.slug,
      problemTitle: s.problem.title,
      language: s.language,
      code: s.code,
      status: s.status,
      verdict: s.verdict,
      runtimeMs: s.runtimeMs,
      memoryKb: s.memoryKb,
      testsPassed: s.testsPassed,
      totalTests: s.totalTests,
      compileError: s.compileError,
      stdout: s.stdout,
      stderr: s.stderr,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  }
}
