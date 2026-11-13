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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Difficulty,
  SystemDesignCategory,
  CoreSubjectType,
  ContentStatus,
} from '@prisma/client';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';
import { AdminPracticeService } from './admin-practice.service';

@ApiTags('Admin Practice Tracks Management (Dev, System Design, Core CS)')
@Controller('admin/practice')
@AdminOnly()
export class AdminPracticeController {
  constructor(private readonly practiceService: AdminPracticeService) {}

  // ════════════════════════════════════════════════════════════════════════════
  // 1. DEVELOPMENT TRACKS & PROJECTS
  // ════════════════════════════════════════════════════════════════════════════

  @Get('development/tracks')
  @ApiOperation({ summary: 'Admin: List development tracks with capstones and modules' })
  getDevTracks() {
    return this.practiceService.getDevTracks();
  }

  @Post('development/tracks')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create a new development track' })
  createDevTrack(
    @Body()
    body: {
      slug: string;
      title: string;
      description?: string;
      icon?: string;
      colorTone?: string;
      order?: number;
    },
  ) {
    return this.practiceService.createDevTrack(body);
  }

  @Put('development/tracks/:id')
  @ApiOperation({ summary: 'Admin: Update development track' })
  updateDevTrack(
    @Param('id') id: string,
    @Body()
    body: {
      slug?: string;
      title?: string;
      description?: string;
      icon?: string;
      colorTone?: string;
      order?: number;
    },
  ) {
    return this.practiceService.updateDevTrack(id, body);
  }

  @Delete('development/tracks/:id')
  @ApiOperation({ summary: 'Admin: Delete development track' })
  deleteDevTrack(@Param('id') id: string) {
    return this.practiceService.deleteDevTrack(id);
  }

  @Get('development/projects')
  @ApiOperation({ summary: 'Admin: List all capstone development projects' })
  getDevProjects() {
    return this.practiceService.getDevProjects();
  }

  @Post('development/projects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create a new capstone project' })
  createDevProject(
    @Body()
    body: {
      slug: string;
      title: string;
      description: string;
      trackId?: string;
      stage?: string;
      totalSprints?: number;
      techStack?: string[];
      starterRepoUrl?: string;
      demoUrl?: string;
      xpReward?: number;
      isOfficial?: boolean;
      status?: ContentStatus;
      milestones?: string[];
    },
  ) {
    return this.practiceService.createDevProject(body);
  }

  @Put('development/projects/:id')
  @ApiOperation({ summary: 'Admin: Update capstone project' })
  updateDevProject(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      trackId?: string;
      stage?: string;
      totalSprints?: number;
      techStack?: string[];
      starterRepoUrl?: string;
      demoUrl?: string;
      xpReward?: number;
      isOfficial?: boolean;
      status?: ContentStatus;
    },
  ) {
    return this.practiceService.updateDevProject(id, body);
  }

  @Delete('development/projects/:id')
  @ApiOperation({ summary: 'Admin: Delete capstone project' })
  deleteDevProject(@Param('id') id: string) {
    return this.practiceService.deleteDevProject(id);
  }

  @Post('development/projects/:id/milestones')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Add milestone to capstone project' })
  addMilestone(
    @Param('id') projectId: string,
    @Body() body: { title: string; order?: number },
  ) {
    return this.practiceService.addDevMilestone(projectId, body.title, body.order);
  }

  @Delete('development/milestones/:id')
  @ApiOperation({ summary: 'Admin: Delete milestone' })
  deleteMilestone(@Param('id') id: string) {
    return this.practiceService.deleteDevMilestone(id);
  }

  @Post('development/modules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create development module' })
  createDevModule(
    @Body()
    body: {
      trackId: string;
      title: string;
      duration?: string;
      difficulty?: Difficulty;
      tags?: string[];
      totalLessons?: number;
      order?: number;
    },
  ) {
    return this.practiceService.createDevModule(body);
  }

  @Delete('development/modules/:id')
  @ApiOperation({ summary: 'Admin: Delete development module' })
  deleteDevModule(@Param('id') id: string) {
    return this.practiceService.deleteDevModule(id);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. SYSTEM DESIGN TRACK
  // ════════════════════════════════════════════════════════════════════════════

  @Get('system-design/topics')
  @ApiOperation({ summary: 'Admin: List all System Design topics and scenarios' })
  getSystemDesignTopics() {
    return this.practiceService.getSystemDesignTopics();
  }

  @Post('system-design/topics')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create new System Design topic' })
  createSystemDesignTopic(
    @Body()
    body: {
      slug: string;
      title: string;
      category: SystemDesignCategory;
      description?: string;
      order?: number;
    },
  ) {
    return this.practiceService.createSystemDesignTopic(body);
  }

  @Put('system-design/topics/:id')
  @ApiOperation({ summary: 'Admin: Update System Design topic' })
  updateSystemDesignTopic(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      category?: SystemDesignCategory;
      description?: string;
      order?: number;
    },
  ) {
    return this.practiceService.updateSystemDesignTopic(id, body);
  }

  @Delete('system-design/topics/:id')
  @ApiOperation({ summary: 'Admin: Delete System Design topic' })
  deleteSystemDesignTopic(@Param('id') id: string) {
    return this.practiceService.deleteSystemDesignTopic(id);
  }

  @Post('system-design/questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Add scenario/case-study question to System Design topic' })
  createSystemDesignQuestion(
    @Body()
    body: {
      topicId: string;
      title: string;
      difficulty?: Difficulty;
      duration?: string;
      architectureUrl?: string;
      editorial?: string;
      order?: number;
    },
  ) {
    return this.practiceService.createSystemDesignQuestion(body);
  }

  @Put('system-design/questions/:id')
  @ApiOperation({ summary: 'Admin: Update System Design question' })
  updateSystemDesignQuestion(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      difficulty?: Difficulty;
      duration?: string;
      architectureUrl?: string;
      editorial?: string;
      order?: number;
    },
  ) {
    return this.practiceService.updateSystemDesignQuestion(id, body);
  }

  @Delete('system-design/questions/:id')
  @ApiOperation({ summary: 'Admin: Delete System Design question' })
  deleteSystemDesignQuestion(@Param('id') id: string) {
    return this.practiceService.deleteSystemDesignQuestion(id);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 3. CORE CS TRACK
  // ════════════════════════════════════════════════════════════════════════════

  @Get('core/subjects')
  @ApiOperation({ summary: 'Admin: List Core CS subjects, syllabi topics, and interview questions' })
  getCoreSubjects() {
    return this.practiceService.getCoreSubjects();
  }

  @Post('core/subjects')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Create Core CS subject' })
  createCoreSubject(
    @Body()
    body: {
      slug: string;
      type: CoreSubjectType;
      title: string;
      description?: string;
      icon?: string;
      order?: number;
    },
  ) {
    return this.practiceService.createCoreSubject(body);
  }

  @Put('core/subjects/:id')
  @ApiOperation({ summary: 'Admin: Update Core CS subject' })
  updateCoreSubject(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      icon?: string;
      order?: number;
    },
  ) {
    return this.practiceService.updateCoreSubject(id, body);
  }

  @Delete('core/subjects/:id')
  @ApiOperation({ summary: 'Admin: Delete Core CS subject' })
  deleteCoreSubject(@Param('id') id: string) {
    return this.practiceService.deleteCoreSubject(id);
  }

  @Post('core/topics')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Add syllabus topic to Core CS subject' })
  createCoreTopic(
    @Body()
    body: {
      subjectId: string;
      slug: string;
      title: string;
      order?: number;
    },
  ) {
    return this.practiceService.createCoreTopic(body);
  }

  @Put('core/topics/:id')
  @ApiOperation({ summary: 'Admin: Update Core CS syllabus topic' })
  updateCoreTopic(
    @Param('id') id: string,
    @Body() body: { title?: string; order?: number },
  ) {
    return this.practiceService.updateCoreTopic(id, body);
  }

  @Delete('core/topics/:id')
  @ApiOperation({ summary: 'Admin: Delete Core CS topic' })
  deleteCoreTopic(@Param('id') id: string) {
    return this.practiceService.deleteCoreTopic(id);
  }

  @Post('core/questions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Admin: Add interview question to Core CS topic' })
  createCoreQuestion(
    @Body()
    body: {
      topicId: string;
      title: string;
      difficulty?: Difficulty;
      explanation?: string;
      order?: number;
    },
  ) {
    return this.practiceService.createCoreQuestion(body);
  }

  @Put('core/questions/:id')
  @ApiOperation({ summary: 'Admin: Update Core CS interview question' })
  updateCoreQuestion(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      difficulty?: Difficulty;
      explanation?: string;
      order?: number;
    },
  ) {
    return this.practiceService.updateCoreQuestion(id, body);
  }

  @Delete('core/questions/:id')
  @ApiOperation({ summary: 'Admin: Delete Core CS question' })
  deleteCoreQuestion(@Param('id') id: string) {
    return this.practiceService.deleteCoreQuestion(id);
  }
}

