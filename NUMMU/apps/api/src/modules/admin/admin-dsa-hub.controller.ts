import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import {
  AdminDsaHubService,
  type SetDailyChallengeDto,
  type AddCuratedProblemDto,
} from './admin-dsa-hub.service';

@ApiTags('Admin DSA Hub & Daily Challenge Curation')
@Controller('admin/dsa-hub')
@AdminOnly()
export class AdminDsaHubController {
  constructor(private readonly dsaHubService: AdminDsaHubService) {}

  // ── Daily Challenge Schedules ──

  @Get('schedules')
  @ApiOperation({ summary: 'Admin: List upcoming and recent scheduled daily challenges' })
  getSchedules(@Query('days') days?: string) {
    return this.dsaHubService.getDailySchedules(days ? Number(days) : 30);
  }

  @Post('schedules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Set or update the daily challenge for a calendar date' })
  setDailySchedule(@Body() body: SetDailyChallengeDto) {
    return this.dsaHubService.setDailyChallenge(body);
  }

  @Delete('schedules/:id')
  @ApiOperation({ summary: 'Admin: Remove a scheduled daily challenge' })
  deleteSchedule(@Param('id') id: string) {
    return this.dsaHubService.deleteDailyChallenge(id);
  }

  // ── Today's Practice Curated List ──

  @Get('curated')
  @ApiOperation({ summary: 'Admin: Get curated problems for Today\'s Practice' })
  getCuratedProblems(@Query('organizationId') orgId?: string) {
    return this.dsaHubService.getCuratedProblems(orgId);
  }

  @Post('curated')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Add a problem to the curated Today\'s Practice list' })
  addCuratedProblem(@Body() body: AddCuratedProblemDto) {
    return this.dsaHubService.addCuratedProblem(body);
  }

  @Put('curated/reorder')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Reorder curated practice problems' })
  reorderCuratedProblems(@Body() body: { items: { id: string; orderIndex: number }[] }) {
    return this.dsaHubService.reorderCuratedProblems(body?.items || []);
  }

  @Delete('curated/:id')
  @ApiOperation({ summary: 'Admin: Remove a problem from the curated practice list' })
  removeCuratedProblem(@Param('id') id: string) {
    return this.dsaHubService.removeCuratedProblem(id);
  }

  // ── Featured Assessment ──

  @Put('featured-test/:testId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Pin a proctored assessment as the featured test card on practice dashboard' })
  setFeaturedAssessment(@Param('testId') testId: string) {
    return this.dsaHubService.setFeaturedAssessment(testId);
  }
}

