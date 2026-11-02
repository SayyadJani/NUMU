import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { ProblemsService } from './problems.service';
import { ProblemQueryDto } from './dto/problem-query.dto';
import { CreateProblemDto } from './dto/create-problem.dto';
import { UpdateProblemDto } from './dto/update-problem.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, type AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Problems')
@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  @Get()
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List and filter problems with pagination' })
  @ApiResponse({ status: 200, description: 'Paginated problem items' })
  findAll(
    @Query() query: ProblemQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.problemsService.findAll(query, user);
  }

  @Get(':slug')
  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get complete problem details by slug' })
  @ApiParam({ name: 'slug', description: 'Unique problem slug (e.g., two-sum)' })
  @ApiResponse({ status: 200, description: 'Problem statement, examples, and boilerplates' })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    return this.problemsService.findBySlug(slug, user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new DSA problem (Trainer / Platform Admin)' })
  @ApiResponse({ status: 201, description: 'Problem created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Slug conflict' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProblemDto,
  ) {
    return this.problemsService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update an existing problem (Author Trainer / Platform Admin)' })
  @ApiParam({ name: 'id', description: 'Problem ID' })
  @ApiResponse({ status: 200, description: 'Problem updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProblemDto,
  ) {
    return this.problemsService.update(id, user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Archive a problem (Author Trainer / Platform Admin)' })
  @ApiParam({ name: 'id', description: 'Problem ID' })
  @ApiResponse({ status: 200, description: 'Problem archived' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Problem not found' })
  archive(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.problemsService.archive(id, user);
  }
}
