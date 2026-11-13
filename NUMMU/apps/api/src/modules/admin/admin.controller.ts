import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrganizationRole } from '@prisma/client';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { AdminService, type BulkProblemRecordInput } from './admin.service';

@ApiTags('Admin Management & Analytics')
@Controller('admin')
@AdminOnly()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Topics & Curriculum Distribution ──
  @Get('topics-curriculum')
  @ApiOperation({
    summary: 'Admin: Get all DSA topics with difficulty distribution & submission accuracy',
  })
  getTopicsCurriculum() {
    return this.adminService.getTopicsWithCurriculumStats();
  }

  // ── Bulk Problem Validation & Import ──
  @Post('problems/bulk/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin: Validate bulk problem JSON/CSV records before importing',
  })
  validateBulkProblems(@Body() body: { records: BulkProblemRecordInput[] }) {
    return this.adminService.validateBulkProblems(body?.records || []);
  }

  @Post('problems/bulk/import')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Admin: Import validated bulk problems into the shared question bank',
  })
  importBulkProblems(
    @CurrentUser() user: AuthenticatedUser,
    @Body()
    body: {
      records: BulkProblemRecordInput[];
      autoCreateMissingTopics?: boolean;
      skipDuplicates?: boolean;
    },
  ) {
    return this.adminService.importBulkProblems(user.id, body?.records || [], {
      autoCreateMissingTopics: body?.autoCreateMissingTopics,
      skipDuplicates: body?.skipDuplicates,
    });
  }

  // ── Submissions & Judge0 Evaluation Management ──
  @Get('submissions')
  @ApiOperation({
    summary: 'Admin: Paginated list of all student submissions with verdict/language filters',
  })
  listSubmissions(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('verdict') verdict?: string,
    @Query('status') status?: string,
    @Query('language') language?: string,
    @Query('problemId') problemId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.adminService.listAdminSubmissions(user, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      verdict,
      status,
      language,
      problemId,
      userId,
    });
  }

  @Get('submissions/:id')
  @ApiOperation({
    summary: 'Admin: Get full submission details (code, stdout, stderr, compileError, runtime)',
  })
  getSubmissionById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.adminService.getAdminSubmissionById(user, id);
  }

  // ── Batches (Organizations) & Batch-Wise Analytics ──
  @Get('batches')
  @ApiOperation({
    summary: 'Admin: List all batches/colleges with student & trainer metrics',
  })
  listBatches(@CurrentUser() user: AuthenticatedUser) {
    return this.adminService.listBatches(user);
  }

  @Post('batches')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create a new student batch / organization' })
  createBatch(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { name: string; slug?: string; description?: string },
  ) {
    return this.adminService.createBatch(user, body);
  }

  @Patch('batches/:id')
  @ApiOperation({ summary: 'Admin: Update batch details' })
  updateBatch(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.adminService.updateBatch(user, id, body);
  }

  @Delete('batches/:id')
  @ApiOperation({ summary: 'Admin: Delete a batch' })
  deleteBatch(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.adminService.deleteBatch(user, id);
  }

  @Get('batches/:id/analytics')
  @ApiOperation({
    summary:
      'Admin: Detailed batch analytics, topic performance, student comparisons, and attention alerts',
  })
  getBatchAnalytics(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.adminService.getBatchAnalytics(user, id);
  }

  @Post('batches/:id/members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin: Assign students or trainers to a batch',
  })
  assignBatchMembers(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: { userIds: string[]; role?: OrganizationRole },
  ) {
    return this.adminService.assignBatchMembers(user, id, body);
  }

  @Delete('batches/:id/members/:userId')
  @ApiOperation({ summary: 'Admin: Remove a student or trainer from a batch' })
  removeBatchMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.adminService.removeBatchMember(user, id, userId);
  }

  // ── Comprehensive Student-Wise Analytics ──
  @Get('students/:id/analytics')
  @ApiOperation({
    summary:
      'Admin: Complete student-wise analytics (DSA progress, topic accuracy, strong/weak topics, test trends)',
  })
  getStudentAnalytics(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.adminService.getStudentAnalytics(user, id);
  }
}

