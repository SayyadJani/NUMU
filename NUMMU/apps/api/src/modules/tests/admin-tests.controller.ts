import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';

@ApiTags('Admin Tests')
@Controller('admin/tests')
@AdminOnly()
export class AdminTestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Admin: Platform KPIs and recent activity overview' })
  getOverview() {
    return this.testsService.getAdminOverview();
  }

  @Get()
  @ApiOperation({ summary: 'Admin: List all tests (draft, published, archived) with metrics' })
  listAdminTests() {
    return this.testsService.listAdminTests();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create a new weekly test with ordered question assignments' })
  @ApiResponse({ status: 201, description: 'Test created successfully' })
  createTest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTestDto,
  ) {
    return this.testsService.createTest(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update test details, schedule, proctoring, or question order' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Test updated successfully' })
  updateTest(
    @Param('id') id: string,
    @Body() dto: UpdateTestDto,
  ) {
    return this.testsService.updateTest(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Admin: Delete a test (or archive if attempts exist)' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  deleteTest(@Param('id') id: string) {
    return this.testsService.deleteTest(id);
  }

  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Duplicate an existing test as a new DRAFT' })
  duplicateTest(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.testsService.duplicateTest(user.id, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get test details with question list and attempt statistics' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'Admin test view' })
  getAdminTestById(@Param('id') id: string) {
    return this.testsService.getAdminTestById(id);
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: 'Admin: List student attempts, proctoring logs, and answers for a test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({ status: 200, description: 'List of student attempts' })
  getTestAttempts(@Param('id') id: string) {
    return this.testsService.getTestAttempts(id);
  }

  @Delete(':id/attempts/:attemptId')
  @ApiOperation({ summary: 'Admin: Reset/delete a student test attempt to allow retake' })
  deleteTestAttempt(
    @Param('id') id: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.testsService.deleteTestAttempt(id, attemptId);
  }

  @Post(':id/attempts/:attemptId/reassign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin: Reassign/unlock an auto-submitted or finalized test attempt' })
  @ApiResponse({ status: 200, description: 'Attempt reassigned and timer extended' })
  reassignTestAttempt(
    @Param('id') id: string,
    @Param('attemptId') attemptId: string,
    @Body() body?: { extraMinutes?: number },
  ) {
    return this.testsService.reassignTestAttempt(id, attemptId, body);
  }
}
