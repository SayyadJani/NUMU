import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { RunCodeDto } from './dto/run-code.dto';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Submissions')
@Controller()
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('submissions/run')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Ephemeral code run against sample case or custom input' })
  @ApiResponse({ status: 200, description: 'Execution result and output comparison' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  runCode(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RunCodeDto,
  ) {
    return this.submissionsService.runCode(user.id, dto);
  }

  @Post('submissions')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Submit solution for formal evaluation against all test cases' })
  @ApiResponse({ status: 201, description: 'Submission evaluated and persisted' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitCodeDto,
  ) {
    return this.submissionsService.submit(user.id, dto);
  }

  @Get('submissions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Get single submission details and terminal verdict' })
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiResponse({ status: 200, description: 'Submission detail with execution stats' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden (Not the submission author or staff)' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  findById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.submissionsService.findById(id, user);
  }

  @Get('submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List submissions made by the currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Paginated user submissions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: SubmissionQueryDto,
  ) {
    return this.submissionsService.findAll(user, query);
  }

  @Get('problems/:slug/submissions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'List recent submissions for a specific problem by the current user' })
  @ApiParam({ name: 'slug', description: 'Problem unique slug' })
  @ApiResponse({ status: 200, description: 'Recent user submissions for problem' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByProblem(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.submissionsService.findByProblem(slug, user);
  }
}
