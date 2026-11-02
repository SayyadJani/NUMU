import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { SolvedProblemsQueryDto } from './dto/solved-problems-query.dto';
import { SubmissionQueryDto } from '../submissions/dto/submission-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import type {
  ProgressOverviewDto,
  TopicProgressSummary,
  PatternProgressSummary,
  PaginatedSolvedProblemsResult,
  PaginatedSubmissionsResult,
  ActivitySummaryDto,
} from '@numu/types';

@ApiTags('Progress & Analytics')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('overview')
  @ApiOperation({
    summary: "Retrieve authenticated user's overall progress statistics and difficulty breakdown",
  })
  @ApiResponse({ status: 200, description: 'Progress overview statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getOverview(@CurrentUser() user: AuthenticatedUser): Promise<ProgressOverviewDto> {
    return this.progressService.getOverview(user.id);
  }

  @Get('by-topic')
  @ApiOperation({
    summary: 'Retrieve topic-wise DSA problem completion counts and mastery percentages',
  })
  @ApiResponse({ status: 200, description: 'Topic breakdown with completion percentages' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTopicProgress(@CurrentUser() user: AuthenticatedUser): Promise<TopicProgressSummary> {
    return this.progressService.getTopicProgress(user.id);
  }

  @Get('by-pattern')
  @ApiOperation({
    summary: 'Retrieve pattern progress breakdown (topics serve as primary syllabus)',
  })
  @ApiResponse({ status: 200, description: 'Pattern breakdown' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getPatternProgress(@CurrentUser() user: AuthenticatedUser): Promise<PatternProgressSummary> {
    return this.progressService.getPatternProgress(user.id);
  }

  @Get('solved-problems')
  @ApiOperation({
    summary: 'Retrieve paginated unique solved problems with difficulty and topic filters',
  })
  @ApiResponse({ status: 200, description: 'Paginated unique solved problems' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSolvedProblems(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SolvedProblemsQueryDto,
  ): Promise<PaginatedSolvedProblemsResult> {
    return this.progressService.getSolvedProblems(user.id, query);
  }

  @Get('submission-history')
  @ApiOperation({
    summary: "Retrieve authenticated user's submission history with verdict and execution metrics",
  })
  @ApiResponse({ status: 200, description: 'Paginated user submission history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSubmissionHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SubmissionQueryDto,
  ): Promise<PaginatedSubmissionsResult> {
    return this.progressService.getSubmissionHistory(user.id, query);
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Retrieve daily submission and uniquely solved problem activity in a date range',
  })
  @ApiResponse({ status: 200, description: 'Daily activity aggregation with streaks' })
  @ApiResponse({ status: 400, description: 'Invalid date format or range exceeds 365 days' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ActivityQueryDto,
  ): Promise<ActivitySummaryDto> {
    return this.progressService.getActivitySummary(user.id, query);
  }
}
