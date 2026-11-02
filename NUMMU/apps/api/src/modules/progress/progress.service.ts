import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ContentStatus, Difficulty, SubmissionVerdict, SubmissionStatus, Prisma } from '@prisma/client';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { SolvedProblemsQueryDto } from './dto/solved-problems-query.dto';
import { SubmissionQueryDto } from '../submissions/dto/submission-query.dto';
import type {
  ProgressOverviewDto,
  TopicProgressSummary,
  TopicProgressItem,
  PatternProgressSummary,
  PaginatedSolvedProblemsResult,
  SolvedProblemItemDto,
  ActivitySummaryDto,
  DailyActivityItem,
  PaginatedSubmissionsResult,
} from '@numu/types';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates overall progress statistics for the authenticated user.
   * Derives unique solved problem counts, difficulty breakdown, and submission aggregates.
   */
  async getOverview(userId: string): Promise<ProgressOverviewDto> {
    // 1. Fetch catalog availability totals (published problems only)
    const publishedProblems = await this.prisma.problem.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { id: true, difficulty: true },
    });

    const totalAvailable = {
      easy: publishedProblems.filter((p) => p.difficulty === Difficulty.EASY).length,
      medium: publishedProblems.filter((p) => p.difficulty === Difficulty.MEDIUM).length,
      hard: publishedProblems.filter((p) => p.difficulty === Difficulty.HARD).length,
      total: publishedProblems.length,
    };

    // 2. Fetch unique solved problems by the authenticated user (published only)
    const userAcceptedDistinct = await this.prisma.submission.findMany({
      where: {
        userId,
        verdict: SubmissionVerdict.ACCEPTED,
        problem: { status: ContentStatus.PUBLISHED },
      },
      select: {
        problemId: true,
        problem: {
          select: { difficulty: true },
        },
      },
      distinct: ['problemId'],
    });

    const solvedCounts = {
      easy: userAcceptedDistinct.filter((s) => s.problem.difficulty === Difficulty.EASY).length,
      medium: userAcceptedDistinct.filter((s) => s.problem.difficulty === Difficulty.MEDIUM).length,
      hard: userAcceptedDistinct.filter((s) => s.problem.difficulty === Difficulty.HARD).length,
    };

    const totalProblemsSolved = userAcceptedDistinct.length;

    // 3. User submission totals
    const [totalSubmissions, acceptedSubmissions] = await Promise.all([
      this.prisma.submission.count({ where: { userId } }),
      this.prisma.submission.count({
        where: { userId, verdict: SubmissionVerdict.ACCEPTED },
      }),
    ]);

    const acceptanceRate =
      totalSubmissions > 0
        ? `${((acceptedSubmissions / totalSubmissions) * 100).toFixed(1)}%`
        : '0.0%';

    return {
      totalProblemsSolved,
      difficulty: solvedCounts,
      totalAvailable,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
    };
  }

  /**
   * Calculates topic-wise problem completion and mastery percentages.
   */
  async getTopicProgress(userId: string): Promise<TopicProgressSummary> {
    const [topics, userSolved] = await Promise.all([
      this.prisma.topic.findMany({
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          order: true,
          problems: {
            where: {
              problem: { status: ContentStatus.PUBLISHED },
            },
            select: { problemId: true },
          },
        },
      }),
      this.prisma.submission.findMany({
        where: {
          userId,
          verdict: SubmissionVerdict.ACCEPTED,
          problem: { status: ContentStatus.PUBLISHED },
        },
        select: { problemId: true },
        distinct: ['problemId'],
      }),
    ]);

    const solvedProblemIds = new Set(userSolved.map((s) => s.problemId));

    const topicItems: TopicProgressItem[] = topics.map((t) => {
      const topicProblemIds = Array.from(new Set(t.problems.map((p) => p.problemId)));
      const totalProblems = topicProblemIds.length;
      const solvedProblems = topicProblemIds.filter((id) => solvedProblemIds.has(id)).length;
      const remainingProblems = Math.max(0, totalProblems - solvedProblems);
      const percentage =
        totalProblems > 0 ? Math.min(100, Math.round((solvedProblems / totalProblems) * 100)) : 0;

      return {
        id: t.id,
        name: t.name,
        slug: t.slug,
        order: t.order,
        totalProblems,
        solvedProblems,
        remainingProblems,
        percentage,
      };
    });

    return {
      topics: topicItems,
      totalTopics: topicItems.length,
    };
  }

  /**
   * Returns pattern progress. In the current schema, topics serve as the primary curriculum structure.
   */
  async getPatternProgress(_userId: string): Promise<PatternProgressSummary> {
    return {
      patterns: [],
      message:
        'Patterns are not modeled separately in the current catalog; topics represent the primary curriculum groupings.',
    };
  }

  /**
   * Retrieves unique solved problems for the authenticated user with filters and pagination.
   */
  async getSolvedProblems(
    userId: string,
    query: SolvedProblemsQueryDto,
  ): Promise<PaginatedSolvedProblemsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const problemWhere: Prisma.ProblemWhereInput = {
      status: ContentStatus.PUBLISHED,
    };

    if (query.difficulty) {
      problemWhere.difficulty = query.difficulty;
    }

    if (query.topic) {
      problemWhere.topics = {
        some: {
          topic: { slug: query.topic },
        },
      };
    }

    // Retrieve unique problems solved by the user matching the problem filters
    const userAccepted = await this.prisma.submission.findMany({
      where: {
        userId,
        verdict: SubmissionVerdict.ACCEPTED,
        problem: problemWhere,
      },
      select: {
        problemId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['problemId'],
    });

    const total = userAccepted.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const pagedRecords = userAccepted.slice(skip, skip + limit);
    const pagedProblemIds = pagedRecords.map((r) => r.problemId);

    if (pagedProblemIds.length === 0) {
      return {
        items: [],
        total,
        page,
        limit,
        totalPages,
        hasNextPage: false,
        hasPrevPage: page > 1,
      };
    }

    // Fetch problem details for the paged set
    const problems = await this.prisma.problem.findMany({
      where: { id: { in: pagedProblemIds } },
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true,
        topics: {
          select: {
            isPrimary: true,
            topic: { select: { slug: true, name: true } },
          },
        },
      },
    });

    const problemsMap = new Map(problems.map((p) => [p.id, p]));

    // Fetch submission counts for this user for each problem in the page
    const submissionCounts = await this.prisma.submission.groupBy({
      by: ['problemId', 'verdict'],
      where: {
        userId,
        problemId: { in: pagedProblemIds },
      },
      _count: { id: true },
    });

    const countsMap = new Map<string, { total: number; accepted: number }>();
    for (const sc of submissionCounts) {
      const cur = countsMap.get(sc.problemId) || { total: 0, accepted: 0 };
      cur.total += sc._count.id;
      if (sc.verdict === SubmissionVerdict.ACCEPTED) {
        cur.accepted += sc._count.id;
      }
      countsMap.set(sc.problemId, cur);
    }

    const items: SolvedProblemItemDto[] = pagedRecords
      .map((record) => {
        const problem = problemsMap.get(record.problemId);
        if (!problem) return null;

        const primaryTopicRef = problem.topics.find((t) => t.isPrimary) || problem.topics[0];
        const allTopics = problem.topics.map((t) => ({
          slug: t.topic.slug,
          name: t.topic.name,
        }));
        const counts = countsMap.get(problem.id) || { total: 1, accepted: 1 };

        return {
          id: problem.id,
          slug: problem.slug,
          title: problem.title,
          difficulty: problem.difficulty,
          solvedAt: record.createdAt.toISOString(),
          primaryTopic: primaryTopicRef
            ? { slug: primaryTopicRef.topic.slug, name: primaryTopicRef.topic.name }
            : null,
          topics: allTopics,
          totalSubmissions: counts.total,
          acceptedSubmissions: counts.accepted,
        };
      })
      .filter((item): item is SolvedProblemItemDto => item !== null);

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
   * Retrieves paginated submission history for the authenticated user.
   * Omits code, private test cases, and execution secrets.
   */
  async getSubmissionHistory(
    userId: string,
    query: SubmissionQueryDto,
  ): Promise<PaginatedSubmissionsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.SubmissionWhereInput = {
      userId,
    };

    if (query.problemSlug) {
      where.problem = { slug: query.problemSlug };
    }

    if (query.verdict) {
      where.verdict = query.verdict;
    }

    const [submissions, total] = await Promise.all([
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
          createdAt: true,
          problem: {
            select: {
              slug: true,
              title: true,
            },
          },
        },
      }),
      this.prisma.submission.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: submissions.map((s) => ({
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
   * Calculates daily activity and consistency data across a requested date range.
   * Guarantees newly solved problems are counted on their FIRST accepted date only.
   */
  async getActivitySummary(userId: string, query: ActivityQueryDto): Promise<ActivitySummaryDto> {
    const tzOffsetMinutes = query.tzOffsetMinutes ?? 0;

    // 1. Resolve date boundaries
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (query.endDate) {
      endDate = new Date(query.endDate);
      if (isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid endDate parameter');
      }
    } else {
      endDate = new Date(now);
    }

    if (query.startDate) {
      startDate = new Date(query.startDate);
      if (isNaN(startDate.getTime())) {
        throw new BadRequestException('Invalid startDate parameter');
      }
    } else {
      // Default to 90 days prior to endDate
      startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 90);
    }

    if (startDate > endDate) {
      throw new BadRequestException('startDate must be on or before endDate');
    }

    // Maximum date range limit: 365 days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      throw new BadRequestException('Requested date range cannot exceed 365 days');
    }

    // Align start to beginning of day and end to end of day in local/adjusted timeframe
    const startUtc = new Date(startDate);
    startUtc.setUTCHours(0, 0, 0, 0);

    const endUtc = new Date(endDate);
    endUtc.setUTCHours(23, 59, 59, 999);

    // 2. Fetch user submissions in range
    const submissionsInRange = await this.prisma.submission.findMany({
      where: {
        userId,
        createdAt: {
          gte: startUtc,
          lte: endUtc,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 3. Determine first accepted date for each solved problem by user
    // A problem is "newly solved" strictly on the calendar date of its earliest accepted submission
    const firstAcceptedSubmissions = await this.prisma.submission.groupBy({
      by: ['problemId'],
      where: {
        userId,
        verdict: SubmissionVerdict.ACCEPTED,
        problem: { status: ContentStatus.PUBLISHED },
      },
      _min: {
        createdAt: true,
      },
    });

    // Map: date string (YYYY-MM-DD) -> count of problems newly solved on that date
    const newlySolvedCountByDate = new Map<string, number>();
    for (const record of firstAcceptedSubmissions) {
      if (record._min.createdAt) {
        const localDateStr = this.formatDateWithOffset(record._min.createdAt, tzOffsetMinutes);
        newlySolvedCountByDate.set(
          localDateStr,
          (newlySolvedCountByDate.get(localDateStr) || 0) + 1,
        );
      }
    }

    // 4. Group submissions by calendar date
    const submissionCountByDate = new Map<string, number>();
    for (const sub of submissionsInRange) {
      const localDateStr = this.formatDateWithOffset(sub.createdAt, tzOffsetMinutes);
      submissionCountByDate.set(
        localDateStr,
        (submissionCountByDate.get(localDateStr) || 0) + 1,
      );
    }

    // 5. Generate daily activity list for all days in the requested interval
    const dailyActivity: DailyActivityItem[] = [];
    const iterDate = new Date(startUtc);
    let activeDays = 0;
    let totalSubmissions = 0;
    let totalUniqueSolved = 0;

    while (iterDate <= endUtc) {
      const dateStr = this.formatDateWithOffset(iterDate, tzOffsetMinutes);
      const subCount = submissionCountByDate.get(dateStr) || 0;
      const solvedCount = newlySolvedCountByDate.get(dateStr) || 0;

      if (subCount > 0 || solvedCount > 0) {
        activeDays++;
      }
      totalSubmissions += subCount;
      totalUniqueSolved += solvedCount;

      dailyActivity.push({
        date: dateStr,
        submissionCount: subCount,
        uniqueSolvedCount: solvedCount,
      });

      iterDate.setUTCDate(iterDate.getUTCDate() + 1);
    }

    // 6. Calculate consistency streaks
    const { currentStreak, longestStreak } = this.calculateStreaks(dailyActivity);

    return {
      startDate: this.formatDateWithOffset(startUtc, tzOffsetMinutes),
      endDate: this.formatDateWithOffset(endUtc, tzOffsetMinutes),
      totalDays: dailyActivity.length,
      activeDays,
      totalSubmissions,
      totalUniqueSolved,
      currentStreak,
      longestStreak,
      dailyActivity,
    };
  }

  /**
   * Helper to format a Date into YYYY-MM-DD with an optional timezone offset in minutes.
   */
  private formatDateWithOffset(date: Date, offsetMinutes: number): string {
    const adjusted = new Date(date.getTime() - offsetMinutes * 60000);
    const year = adjusted.getUTCFullYear();
    const month = String(adjusted.getUTCMonth() + 1).padStart(2, '0');
    const day = String(adjusted.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calculates current and longest streaks of active days (days with >= 1 submission or solved problem).
   */
  private calculateStreaks(daily: DailyActivityItem[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    let longestStreak = 0;
    let currentRun = 0;

    for (let i = 0; i < daily.length; i++) {
      const day = daily[i]!;
      if (day.submissionCount > 0 || day.uniqueSolvedCount > 0) {
        currentRun++;
        if (currentRun > longestStreak) {
          longestStreak = currentRun;
        }
      } else {
        currentRun = 0;
      }
    }

    // Current streak: count backward from the most recent day in the series
    let currentStreak = 0;
    for (let i = daily.length - 1; i >= 0; i--) {
      const day = daily[i]!;
      if (day.submissionCount > 0 || day.uniqueSolvedCount > 0) {
        currentStreak++;
      } else {
        // If today has 0 activity, check if yesterday was active; if not, streak is 0
        if (i === daily.length - 1) {
          continue;
        }
        break;
      }
    }

    return { currentStreak, longestStreak };
  }
}
