import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import type { Request } from 'express';

@ApiTags('Leaderboard & Arena')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Public()
  @Get('global')
  @ApiOperation({ summary: 'Get global circuit standings with filtering and pagination' })
  async getGlobal(@Query() query: LeaderboardQueryDto, @Req() req: Request) {
    // Attempt extracting user ID from request if present (optional auth)
    const user = (req as any).user;
    return this.leaderboardService.getGlobalLeaderboard(query, user?.id);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get leaderboard list (alias to global)' })
  async getLeaderboard(@Query() query: LeaderboardQueryDto, @Req() req: Request) {
    const user = (req as any).user;
    return this.leaderboardService.getGlobalLeaderboard(query, user?.id);
  }

  @Public()
  @Get('colleges')
  @ApiOperation({ summary: 'Get collegiate division standings' })
  async getColleges() {
    return this.leaderboardService.getCollegeRankings();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @Get('me')
  @ApiOperation({ summary: 'Get current student circuit rank and stats' })
  async getMyRank(@CurrentUser() user: AuthenticatedUser) {
    return this.leaderboardService.getMyRank(user.id);
  }
}

