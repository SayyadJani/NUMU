import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all topics with published problem counts' })
  @ApiResponse({ status: 200, description: 'Array of topic catalog items' })
  findAll() {
    return this.topicsService.findAll();
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Get topic details and syllabus by slug' })
  @ApiParam({ name: 'slug', description: 'Unique topic slug (e.g., arrays)' })
  @ApiResponse({ status: 200, description: 'Topic details and ordered problems' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.topicsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER, Role.PLATFORM_ADMIN)
  @ApiBearerAuth('bearer')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new DSA topic (Trainer / Platform Admin)' })
  @ApiResponse({ status: 201, description: 'Topic created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Topic slug conflict' })
  create(@Body() dto: CreateTopicDto) {
    return this.topicsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Update a topic (Platform Admin)' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'Topic updated successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  update(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.topicsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PLATFORM_ADMIN)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Delete a topic (Platform Admin)' })
  @ApiParam({ name: 'id', description: 'Topic ID' })
  @ApiResponse({ status: 200, description: 'Topic deleted' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  delete(@Param('id') id: string) {
    return this.topicsService.delete(id);
  }
}
