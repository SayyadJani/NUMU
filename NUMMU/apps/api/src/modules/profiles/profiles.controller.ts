import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { ProgressService } from '../progress/progress.service';
import { GamificationService } from '../gamification/gamification.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Profiles')
@Controller('profile')
export class ProfilesController {
  constructor(
    private readonly usersService: UsersService,
    private readonly progressService: ProgressService,
    private readonly gamificationService: GamificationService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile with complete metrics' })
  @ApiResponse({ status: 200, description: 'Current user profile details' })
  async getMyProfile(@CurrentUser() user: AuthenticatedUser) {
    const userRecord = await this.usersService.findMe(user.id);
    return this.enrichProfileWithStats(userRecord);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Updated profile details' })
  updateMyProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Get(':username')
  @ApiOperation({ summary: 'Get public profile for a user with verified progress and metrics' })
  @ApiParam({ name: 'username', example: 'alexrivera', description: 'Username handle' })
  @ApiResponse({ status: 200, description: 'Public profile with stats' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProfile(@Param('username') username: string) {
    const userRecord = await this.usersService.findByUsername(username);
    return this.enrichProfileWithStats(userRecord);
  }

  private async enrichProfileWithStats(user: any) {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();

    // Timeout helper to guarantee fast responses under any DB load
    const withTimeout = <T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
      ]);
    };

    const [overview, topicProgress, activity, badges, history, userAttemptsRaw, totalPublishedTestsRaw] =
      await Promise.all([
        withTimeout(this.progressService.getOverview(user.id).catch(() => null), 2500, null),
        withTimeout(this.progressService.getTopicProgress(user.id).catch(() => null), 2500, null),
        withTimeout(this.progressService.getActivitySummary(user.id, { startDate: oneYearAgo }).catch(() => null), 2500, null),
        withTimeout(this.gamificationService.getBadges(user.id, { page: 1, limit: 50 }).catch(() => null), 2500, null),
        withTimeout(this.progressService.getSubmissionHistory(user.id, { limit: 20 }).catch(() => null), 2500, null),
        withTimeout(
          this.prisma.testAttempt.findMany({
            where: { userId: user.id },
            include: {
              test: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  weekNumber: true,
                  createdAt: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          }).catch(() => []),
          2500,
          []
        ),
        withTimeout(
          this.prisma.test.count({
            where: { status: 'PUBLISHED' },
          }).catch(() => 0),
          1500,
          0
        ),
      ]);

    const problemsSolved = overview?.totalProblemsSolved ?? 0;
    const easySolved = overview?.difficulty.easy ?? 0;
    const mediumSolved = overview?.difficulty.medium ?? 0;
    const hardSolved = overview?.difficulty.hard ?? 0;
    const totalAvailable = overview?.totalAvailable.total ?? 7;
    const acceptanceRate = overview?.acceptanceRate ?? '0.0%';
    const totalSubmissions = overview?.totalSubmissions ?? 0;
    const dayStreak = activity?.currentStreak ?? 0;
    const maxStreak = activity?.longestStreak ?? 0;

    // Fast dynamic global rank calculation
    let globalRank = 1;
    if (problemsSolved > 0) {
      try {
        const betterSolvers = await withTimeout(
          this.prisma.submission.groupBy({
            by: ['userId'],
            where: { verdict: 'ACCEPTED' },
            having: {
              problemId: {
                _count: {
                  gt: problemsSolved,
                },
              },
            },
          }),
          1500,
          []
        );
        globalRank = Math.max(1, (betterSolvers?.length ?? 0) + 1);
      } catch {
        globalRank = 1;
      }
    }

    // Dynamic rating computed from accepted problems and verified activity
    const contestRating = Math.max(1200, 1200 + problemsSolved * 60 + Math.min(150, totalSubmissions * 4) + dayStreak * 15);

    const userAttempts = Array.isArray(userAttemptsRaw) ? userAttemptsRaw : [];
    const totalPublishedTests = typeof totalPublishedTestsRaw === 'number' ? totalPublishedTestsRaw : 0;

    const testsAttended = userAttempts.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'EXPIRED',
    ).length;
    const totalTestsConducted = Math.max(testsAttended, totalPublishedTests);
    const testsMissed = Math.max(0, totalTestsConducted - testsAttended);

    // Map genuine test attempts to results log (empty for new users)
    const conductedTests = userAttempts.map((attempt) => ({
      id: attempt.testId || attempt.id,
      testName: attempt.test?.title ?? `Weekly Assessment ${attempt.test?.weekNumber ? `#${attempt.test.weekNumber}` : ''}`.trim(),
      type: attempt.test?.weekNumber ? 'Weekly' : 'Assessment',
      status: attempt.status === 'SUBMITTED' ? 'ATTENDED' : 'MISSED',
      date: new Date(attempt.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      score: attempt.score ?? 0,
      accuracy: Math.round(attempt.percentage ?? 0),
      rank: null,
      ratingChange: attempt.passed ? 15 : 0,
      timeSpent:
        attempt.submittedAt && attempt.startedAt
          ? `${Math.max(1, Math.round((new Date(attempt.submittedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000))} mins`
          : '—',
      topic: 'Comprehensive Assessment',
    }));

    return {
      ...user,
      stats: {
        problemsSolved,
        easySolved,
        mediumSolved,
        hardSolved,
        totalAvailable,
        acceptanceRate,
        totalSubmissions,
        dayStreak,
        maxStreak,
        contestRating,
        totalTestsConducted,
        testsAttended,
        testsMissed,
        testsCompleted: testsAttended,
        projectsCompleted: 0,
        globalRank,
      },
      topicProgress: topicProgress?.topics ?? [],
      badges: badges ?? [],
      activity: activity ?? null,
      recentSubmissions: history?.items ?? [],
      tests: {
        totalConducted: totalTestsConducted,
        attended: testsAttended,
        missed: testsMissed,
        history: conductedTests,
      },
    };
  }
}
