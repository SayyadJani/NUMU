import {
  Controller,
  Get,
  Post,
  Param,
  Body,
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
import { TestsService } from './tests.service';
import { AutosaveAnswerDto } from './dto/autosave-answer.dto';
import { RunTestCodeDto } from './dto/run-test-code.dto';
import { SubmitQuestionDto } from './dto/submit-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Weekly Tests')
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List all published weekly tests' })
  @ApiResponse({ status: 200, description: 'List of published tests' })
  listPublished(@CurrentUser() user?: AuthenticatedUser) {
    return this.testsService.listPublishedTests(user?.id);
  }

  @Get(':slug')
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get details and instructions for a weekly test' })
  @ApiParam({ name: 'slug', description: 'Test unique slug (e.g., weekly-dsa-12)' })
  @ApiResponse({ status: 200, description: 'Test overview and syllabus details' })
  @ApiResponse({ status: 404, description: 'Test not found or not published' })
  getBySlug(@Param('slug') slug: string, @CurrentUser() user?: AuthenticatedUser) {
    return this.testsService.getTestBySlug(slug, user?.id);
  }

  @Post(':slug/attempt')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start or resume an active test attempt (Idempotent)' })
  @ApiParam({ name: 'slug', description: 'Test unique slug' })
  @ApiResponse({ status: 200, description: 'Active attempt state, timer, questions and draft answers' })
  startOrResumeAttempt(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.testsService.startOrResumeAttempt(slug, user.id);
  }

  @Post(':slug/attempt/autosave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autosave current student answer draft and progress' })
  @ApiParam({ name: 'slug', description: 'Test unique slug' })
  autosaveAnswer(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AutosaveAnswerDto,
  ) {
    return this.testsService.autosaveAnswer(slug, user.id, dto);
  }

  @Post(':slug/attempt/run')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run test code against public sample testcases via Judge0' })
  @ApiParam({ name: 'slug', description: 'Test unique slug' })
  runCode(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RunTestCodeDto,
  ) {
    return this.testsService.runCode(slug, user.id, dto);
  }

  @Post(':slug/attempt/submit-question')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit solution for evaluation against full hidden test suite' })
  @ApiParam({ name: 'slug', description: 'Test unique slug' })
  submitQuestion(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SubmitQuestionDto,
  ) {
    return this.testsService.submitQuestion(slug, user.id, dto);
  }

  @Post(':slug/attempt/finalize')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalize entire test attempt, compute final score, and award XP' })
  @ApiParam({ name: 'slug', description: 'Test unique slug' })
  finalizeAttempt(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.testsService.finalizeAttempt(slug, user.id);
  }

  @Get(':slug/attempt/result')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get finalized attempt results and breakdown' })
  @ApiParam({ name: 'slug', description: 'Test unique slug' })
  getResult(
    @Param('slug') slug: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.testsService.getResult(slug, user.id);
  }
}
