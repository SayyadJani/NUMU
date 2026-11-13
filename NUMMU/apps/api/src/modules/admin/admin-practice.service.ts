import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Difficulty,
  SystemDesignCategory,
  CoreSubjectType,
  ContentStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminPracticeService {
  constructor(private readonly prisma: PrismaService) {}

  // ════════════════════════════════════════════════════════════════════════════
  // 1. DEVELOPMENT TRACKS & CAPSTONE PROJECTS
  // ════════════════════════════════════════════════════════════════════════════

  async getDevTracks() {
    return this.prisma.devTrack.findMany({
      include: {
        projects: {
          include: {
            milestones: {
              orderBy: { order: 'asc' },
            },
          },
        },
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createDevTrack(data: {
    slug: string;
    title: string;
    description?: string;
    icon?: string;
    colorTone?: string;
    order?: number;
  }) {
    return this.prisma.devTrack.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        icon: data.icon ?? 'Monitor',
        colorTone: data.colorTone ?? 'emerald',
        order: data.order ?? 0,
      },
    });
  }

  async updateDevTrack(
    id: string,
    data: {
      slug?: string;
      title?: string;
      description?: string;
      icon?: string;
      colorTone?: string;
      order?: number;
    },
  ) {
    return this.prisma.devTrack.update({
      where: { id },
      data,
    });
  }

  async deleteDevTrack(id: string) {
    return this.prisma.devTrack.delete({
      where: { id },
    });
  }

  async getDevProjects() {
    return this.prisma.devProject.findMany({
      include: {
        track: true,
        milestones: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDevProject(data: {
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
  }) {
    return this.prisma.devProject.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        trackId: data.trackId,
        stage: data.stage ?? 'planning',
        totalSprints: data.totalSprints ?? 5,
        techStack: data.techStack ?? [],
        starterRepoUrl: data.starterRepoUrl,
        demoUrl: data.demoUrl,
        xpReward: data.xpReward ?? 400,
        isOfficial: data.isOfficial ?? true,
        status: data.status ?? ContentStatus.PUBLISHED,
        milestones: data.milestones?.length
          ? {
              create: data.milestones.map((m, idx) => ({
                title: m,
                order: idx + 1,
              })),
            }
          : undefined,
      },
      include: {
        track: true,
        milestones: true,
      },
    });
  }

  async updateDevProject(
    id: string,
    data: {
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
    return this.prisma.devProject.update({
      where: { id },
      data,
      include: {
        track: true,
        milestones: true,
      },
    });
  }

  async deleteDevProject(id: string) {
    return this.prisma.devProject.delete({
      where: { id },
    });
  }

  async addDevMilestone(projectId: string, title: string, order?: number) {
    const project = await this.prisma.devProject.findUnique({
      where: { id: projectId },
      include: { milestones: true },
    });
    if (!project) throw new NotFoundException('Project not found');

    return this.prisma.devMilestone.create({
      data: {
        projectId,
        title,
        order: order ?? project.milestones.length + 1,
      },
    });
  }

  async deleteDevMilestone(id: string) {
    return this.prisma.devMilestone.delete({
      where: { id },
    });
  }

  async createDevModule(data: {
    trackId: string;
    title: string;
    duration?: string;
    difficulty?: Difficulty;
    tags?: string[];
    totalLessons?: number;
    order?: number;
  }) {
    return this.prisma.devModule.create({
      data: {
        trackId: data.trackId,
        title: data.title,
        duration: data.duration ?? '2 hrs',
        difficulty: data.difficulty ?? Difficulty.MEDIUM,
        tags: data.tags ?? [],
        totalLessons: data.totalLessons ?? 5,
        order: data.order ?? 0,
      },
    });
  }

  async deleteDevModule(id: string) {
    return this.prisma.devModule.delete({
      where: { id },
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. SYSTEM DESIGN TRACK
  // ════════════════════════════════════════════════════════════════════════════

  async getSystemDesignTopics() {
    return this.prisma.systemDesignTopic.findMany({
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  }

  async createSystemDesignTopic(data: {
    slug: string;
    title: string;
    category: SystemDesignCategory;
    description?: string;
    order?: number;
  }) {
    return this.prisma.systemDesignTopic.create({
      data: {
        slug: data.slug,
        title: data.title,
        category: data.category,
        description: data.description,
        order: data.order ?? 0,
      },
    });
  }

  async updateSystemDesignTopic(
    id: string,
    data: {
      title?: string;
      category?: SystemDesignCategory;
      description?: string;
      order?: number;
    },
  ) {
    return this.prisma.systemDesignTopic.update({
      where: { id },
      data,
    });
  }

  async deleteSystemDesignTopic(id: string) {
    return this.prisma.systemDesignTopic.delete({
      where: { id },
    });
  }

  async createSystemDesignQuestion(data: {
    topicId: string;
    title: string;
    difficulty?: Difficulty;
    duration?: string;
    architectureUrl?: string;
    editorial?: string;
    order?: number;
  }) {
    return this.prisma.systemDesignQuestion.create({
      data: {
        topicId: data.topicId,
        title: data.title,
        difficulty: data.difficulty ?? Difficulty.MEDIUM,
        duration: data.duration ?? '30 min',
        architectureUrl: data.architectureUrl,
        editorial: data.editorial,
        order: data.order ?? 0,
      },
    });
  }

  async updateSystemDesignQuestion(
    id: string,
    data: {
      title?: string;
      difficulty?: Difficulty;
      duration?: string;
      architectureUrl?: string;
      editorial?: string;
      order?: number;
    },
  ) {
    return this.prisma.systemDesignQuestion.update({
      where: { id },
      data,
    });
  }

  async deleteSystemDesignQuestion(id: string) {
    return this.prisma.systemDesignQuestion.delete({
      where: { id },
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 3. CORE CS TRACK (DBMS, OS, CN, OOPS)
  // ════════════════════════════════════════════════════════════════════════════

  async getCoreSubjects() {
    return this.prisma.coreSubject.findMany({
      include: {
        topics: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async createCoreSubject(data: {
    slug: string;
    type: CoreSubjectType;
    title: string;
    description?: string;
    icon?: string;
    order?: number;
  }) {
    return this.prisma.coreSubject.create({
      data: {
        slug: data.slug,
        type: data.type,
        title: data.title,
        description: data.description,
        icon: data.icon ?? 'Database',
        order: data.order ?? 0,
      },
    });
  }

  async updateCoreSubject(
    id: string,
    data: {
      title?: string;
      description?: string;
      icon?: string;
      order?: number;
    },
  ) {
    return this.prisma.coreSubject.update({
      where: { id },
      data,
    });
  }

  async deleteCoreSubject(id: string) {
    return this.prisma.coreSubject.delete({
      where: { id },
    });
  }

  async createCoreTopic(data: {
    subjectId: string;
    slug: string;
    title: string;
    order?: number;
  }) {
    return this.prisma.coreTopic.create({
      data: {
        subjectId: data.subjectId,
        slug: data.slug,
        title: data.title,
        order: data.order ?? 0,
      },
    });
  }

  async updateCoreTopic(
    id: string,
    data: {
      title?: string;
      order?: number;
    },
  ) {
    return this.prisma.coreTopic.update({
      where: { id },
      data,
    });
  }

  async deleteCoreTopic(id: string) {
    return this.prisma.coreTopic.delete({
      where: { id },
    });
  }

  async createCoreQuestion(data: {
    topicId: string;
    title: string;
    difficulty?: Difficulty;
    explanation?: string;
    order?: number;
  }) {
    return this.prisma.coreQuestion.create({
      data: {
        topicId: data.topicId,
        title: data.title,
        difficulty: data.difficulty ?? Difficulty.EASY,
        explanation: data.explanation,
        order: data.order ?? 0,
      },
    });
  }

  async updateCoreQuestion(
    id: string,
    data: {
      title?: string;
      difficulty?: Difficulty;
      explanation?: string;
      order?: number;
    },
  ) {
    return this.prisma.coreQuestion.update({
      where: { id },
      data,
    });
  }

  async deleteCoreQuestion(id: string) {
    return this.prisma.coreQuestion.delete({
      where: { id },
    });
  }
}

