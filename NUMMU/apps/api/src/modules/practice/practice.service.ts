import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PracticeService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Daily Challenge ────────────────────────────────────────────────────────

  async getTodayDailyChallenge(userId?: string) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Look for scheduled challenge for today
    let schedule = await this.prisma.dailyChallengeSchedule.findFirst({
      where: {
        date: today,
        isActive: true,
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
    });

    // Fallback: look for nearest active schedule, or first problem
    if (!schedule) {
      schedule = await this.prisma.dailyChallengeSchedule.findFirst({
        where: { isActive: true },
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
        orderBy: { date: 'desc' },
      });
    }

    if (!schedule) {
      const fallbackProblem = await this.prisma.problem.findFirst({
        where: { status: 'PUBLISHED' },
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
      });

      return {
        problem: fallbackProblem,
        xpBonus: 50,
        instructions: 'Complete daily challenge to sustain your consistency streak!',
        isSolved: false,
      };
    }

    // Check if user solved it
    let isSolved = false;
    if (userId) {
      const acceptedSub = await this.prisma.submission.findFirst({
        where: {
          userId,
          problemId: schedule.problemId,
          verdict: 'ACCEPTED',
        },
      });
      isSolved = Boolean(acceptedSub);
    }

    return {
      id: schedule.id,
      date: schedule.date,
      problem: schedule.problem,
      xpBonus: schedule.xpBonus,
      instructions: schedule.instructions,
      isSolved,
    };
  }

  // ─── Today's Practice Curated List ──────────────────────────────────────────

  async getCuratedPractice(userId?: string) {
    const list = await this.prisma.curatedPracticeProblem.findMany({
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
      orderBy: { orderIndex: 'asc' },
      take: 10,
    });

    // If no curated entries yet, fallback to top problems
    if (list.length === 0) {
      const fallbackProblems = await this.prisma.problem.findMany({
        where: { status: 'PUBLISHED' },
        take: 5,
        orderBy: { createdAt: 'asc' },
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
      });

      return fallbackProblems.map((p, idx) => ({
        id: `curated-${p.id}`,
        orderIndex: idx,
        isPinned: idx === 0,
        problem: p,
        isSolved: false,
      }));
    }

    // If user is authenticated, check solved statuses
    let solvedSlugs = new Set<string>();
    if (userId) {
      const solved = await this.prisma.submission.findMany({
        where: {
          userId,
          verdict: 'ACCEPTED',
        },
        select: { problem: { select: { slug: true } } },
      });
      solvedSlugs = new Set(solved.map((s) => s.problem.slug));
    }

    return list.map((item) => ({
      id: item.id,
      orderIndex: item.orderIndex,
      isPinned: item.isPinned,
      problem: item.problem,
      isSolved: solvedSlugs.has(item.problem.slug),
    }));
  }

  // ─── Development Track ──────────────────────────────────────────────────────

  async getDevelopmentTracks() {
    return this.prisma.devTrack.findMany({
      include: {
        projects: {
          where: { status: 'PUBLISHED' },
          include: {
            milestones: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        modules: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  // ─── System Design Track ────────────────────────────────────────────────────

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

  // ─── Core CS Track ──────────────────────────────────────────────────────────

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
}

