import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface SetDailyChallengeDto {
  date: string; // YYYY-MM-DD
  problemId: string;
  xpBonus?: number;
  instructions?: string;
  isActive?: boolean;
}

export interface AddCuratedProblemDto {
  problemId: string;
  orderIndex?: number;
  isPinned?: boolean;
  organizationId?: string;
}

@Injectable()
export class AdminDsaHubService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Daily Challenge Scheduling ─────────────────────────────────────────────

  async getDailySchedules(daysAhead = 30) {
    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    start.setUTCDate(start.getUTCDate() - 2); // Show recent past 2 days

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + daysAhead);

    return this.prisma.dailyChallengeSchedule.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            acceptanceRate: true,
            topics: {
              include: {
                topic: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async setDailyChallenge(dto: SetDailyChallengeDto) {
    const targetDate = new Date(dto.date);
    if (isNaN(targetDate.getTime())) {
      throw new BadRequestException('Invalid date format. Expected YYYY-MM-DD');
    }
    targetDate.setUTCHours(0, 0, 0, 0);

    const problem = await this.prisma.problem.findUnique({
      where: { id: dto.problemId },
    });
    if (!problem) {
      throw new NotFoundException(`Problem with ID "${dto.problemId}" not found`);
    }

    return this.prisma.dailyChallengeSchedule.upsert({
      where: { date: targetDate },
      update: {
        problemId: dto.problemId,
        xpBonus: dto.xpBonus ?? 50,
        instructions: dto.instructions,
        isActive: dto.isActive ?? true,
      },
      create: {
        date: targetDate,
        problemId: dto.problemId,
        xpBonus: dto.xpBonus ?? 50,
        instructions: dto.instructions,
        isActive: dto.isActive ?? true,
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    });
  }

  async deleteDailyChallenge(id: string) {
    return this.prisma.dailyChallengeSchedule.delete({
      where: { id },
    });
  }

  // ─── Today's Practice Curated List ──────────────────────────────────────────

  async getCuratedProblems(organizationId?: string) {
    return this.prisma.curatedPracticeProblem.findMany({
      where: organizationId ? { organizationId } : {},
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            acceptanceRate: true,
            status: true,
            topics: {
              include: {
                topic: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  async addCuratedProblem(dto: AddCuratedProblemDto) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: dto.problemId },
    });
    if (!problem) {
      throw new NotFoundException(`Problem with ID "${dto.problemId}" not found`);
    }

    const count = await this.prisma.curatedPracticeProblem.count({
      where: dto.organizationId ? { organizationId: dto.organizationId } : {},
    });

    return this.prisma.curatedPracticeProblem.create({
      data: {
        problemId: dto.problemId,
        orderIndex: dto.orderIndex ?? count,
        isPinned: dto.isPinned ?? false,
        organizationId: dto.organizationId,
      },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
          },
        },
      },
    });
  }

  async reorderCuratedProblems(items: { id: string; orderIndex: number }[]) {
    const updates = items.map((item) =>
      this.prisma.curatedPracticeProblem.update({
        where: { id: item.id },
        data: { orderIndex: item.orderIndex },
      }),
    );
    return this.prisma.$transaction(updates);
  }

  async removeCuratedProblem(id: string) {
    return this.prisma.curatedPracticeProblem.delete({
      where: { id },
    });
  }

  // ─── Featured Assessment Toggle ─────────────────────────────────────────────

  async setFeaturedAssessment(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
    });
    if (!test) {
      throw new NotFoundException(`Assessment with ID "${testId}" not found`);
    }

    // Reset others to false
    await this.prisma.test.updateMany({
      data: { isFeaturedOnDashboard: false },
    });

    return this.prisma.test.update({
      where: { id: testId },
      data: { isFeaturedOnDashboard: true },
    });
  }
}

