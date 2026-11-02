import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { GamificationSummaryQueryDto } from './dto/gamification-summary-query.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import type {
  GamificationSummaryDto,
  PaginatedBadgesResult,
  PaginatedXpHistoryResult,
} from '@numu/types';

@ApiTags('Gamification & Achievements')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('summary')
  @ApiOperation({
    summary: "Retrieve authenticated user's gamification summary (XP, Level, Streak, Recent Badges)",
  })
  @ApiResponse({ status: 200, description: 'User gamification summary' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: GamificationSummaryQueryDto,
  ): Promise<GamificationSummaryDto> {
    return this.gamificationService.getSummary(user.id, query.tzOffsetMinutes);
  }

  @Get('badges')
  @ApiOperation({
    summary: "Retrieve authenticated user's earned badges",
  })
  @ApiResponse({ status: 200, description: 'List of earned badges with unlock dates' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getBadges(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedBadgesResult> {
    return this.gamificationService.getBadges(user.id, query);
  }

  @Get('badges/available')
  @ApiOperation({
    summary: 'Retrieve all active badge definitions and progress for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'List of active badges with user earning status' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAvailableBadges(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedBadgesResult> {
    return this.gamificationService.getAvailableBadges(user.id, query);
  }

  @Get('xp-history')
  @ApiOperation({
    summary: "Retrieve authenticated user's XP transaction ledger history",
  })
  @ApiResponse({ status: 200, description: 'Paginated XP ledger events' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getXpHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedXpHistoryResult> {
    return this.gamificationService.getXpHistory(user.id, query);
  }
}
