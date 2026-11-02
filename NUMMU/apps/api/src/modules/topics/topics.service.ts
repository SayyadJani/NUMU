import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import type { TopicItem } from '@numu/types';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to format a string into a URL-safe kebab-case slug.
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Retrieves all topics ordered by their display order with published problem counts.
   * Single database query using Prisma _count aggregate to prevent N+1 queries.
   */
  async findAll(): Promise<TopicItem[]> {
    const topics = await this.prisma.topic.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            problems: {
              where: {
                problem: {
                  status: 'PUBLISHED',
                },
              },
            },
          },
        },
      },
    });

    return topics.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description,
      icon: t.icon,
      order: t.order,
      problemCount: t._count.problems,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  /**
   * Retrieves a topic by slug with its published problem syllabus.
   */
  async findBySlug(slug: string) {
    const cleanSlug = slug.toLowerCase().trim();
    const topic = await this.prisma.topic.findUnique({
      where: { slug: cleanSlug },
      include: {
        _count: {
          select: {
            problems: {
              where: {
                problem: {
                  status: 'PUBLISHED',
                },
              },
            },
          },
        },
        problems: {
          where: {
            problem: {
              status: 'PUBLISHED',
            },
          },
          include: {
            problem: {
              select: {
                id: true,
                slug: true,
                title: true,
                difficulty: true,
                acceptanceRate: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with slug "${slug}" not found`);
    }

    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      icon: topic.icon,
      order: topic.order,
      problemCount: topic._count.problems,
      problems: topic.problems.map((pt) => ({
        id: pt.problem.id,
        slug: pt.problem.slug,
        title: pt.problem.title,
        difficulty: pt.problem.difficulty,
        acceptanceRate: pt.problem.acceptanceRate,
        isPrimary: pt.isPrimary,
        createdAt: pt.problem.createdAt,
      })),
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };
  }

  /**
   * Creates a new topic (Trainer / Admin).
   */
  async create(dto: CreateTopicDto) {
    const slug = (dto.slug || this.generateSlug(dto.name)).toLowerCase().trim();

    const existing = await this.prisma.topic.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Topic with slug "${slug}" already exists`);
    }

    const topic = await this.prisma.topic.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        icon: dto.icon?.trim() || null,
        order: dto.order ?? 0,
      },
    });

    return {
      id: topic.id,
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      icon: topic.icon,
      order: topic.order,
      problemCount: 0,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    };
  }

  /**
   * Updates an existing topic.
   */
  async update(id: string, dto: UpdateTopicDto) {
    const topic = await this.prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic with ID "${id}" not found`);
    }

    if (dto.slug && dto.slug !== topic.slug) {
      const cleanSlug = dto.slug.toLowerCase().trim();
      const conflict = await this.prisma.topic.findUnique({ where: { slug: cleanSlug } });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Topic with slug "${cleanSlug}" already exists`);
      }
    }

    return this.prisma.topic.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.slug !== undefined && { slug: dto.slug.toLowerCase().trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() || null }),
        ...(dto.icon !== undefined && { icon: dto.icon?.trim() || null }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    });
  }

  /**
   * Deletes a topic by ID (cascades junction links).
   */
  async delete(id: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      throw new NotFoundException(`Topic with ID "${id}" not found`);
    }

    await this.prisma.topic.delete({ where: { id } });
    return { message: `Topic "${topic.name}" deleted successfully` };
  }
}
