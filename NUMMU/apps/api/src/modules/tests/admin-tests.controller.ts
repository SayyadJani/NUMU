import {
  Controller,
  Get,
  Post,
  Patch,
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
import { CreateTestDto } from './dto/create-test.dto';
import { UpdateTestDto } from './dto/update-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Tests')
@Controller('admin/tests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PLATFORM_ADMIN, Role.TRAINER)
@ApiBearerAuth('JWT')
export class AdminTestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create a new weekly test with problem assignments' })
  @ApiResponse({ status: 201, description: 'Test created successfully' })
  createTest(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTestDto,
  ) {
    return this.testsService.createTest(user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Admin: Update test details or schedule' })
  @ApiParam({ name: 'id', description: 'Test UUID' })
  @ApiResponse({ status: 200, description: 'Test updated successfully' })
  updateTest(
    @Param('id') id: string,
    @Body() dto: UpdateTestDto,
  ) {
    return this.testsService.updateTest(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Admin: Get test details with question list and attempt statistics' })
  @ApiParam({ name: 'id', description: 'Test UUID' })
  @ApiResponse({ status: 200, description: 'Admin test view' })
  getAdminTestById(@Param('id') id: string) {
    return this.testsService.getAdminTestById(id);
  }

  @Get(':id/attempts')
  @ApiOperation({ summary: 'Admin: List student attempts and scores for a test' })
  @ApiParam({ name: 'id', description: 'Test UUID' })
  @ApiResponse({ status: 200, description: 'List of student attempts' })
  getTestAttempts(@Param('id') id: string) {
    return this.testsService.getTestAttempts(id);
  }
}
