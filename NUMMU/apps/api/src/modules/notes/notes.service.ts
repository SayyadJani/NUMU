import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

export interface NoteFilters {
  category?: string;
  search?: string;
  tag?: string;
}

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private get noteClient(): any {
    return (this.prisma as any).note;
  }

  async getNotes(userId: string, filters?: NoteFilters) {
    const where: any = { userId };

    if (filters?.category && filters.category !== 'all') {
      where.category = filters.category;
    }

    if (filters?.tag) {
      where.tags = {
        has: filters.tag,
      };
    }

    if (filters?.search) {
      const q = filters.search.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
      ];
    }

    try {
      return await this.noteClient.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      });
    } catch (err) {
      this.logger.error(`Failed to fetch notes for user ${userId}: ${(err as Error).message}`);
      throw err;
    }
  }

  async getNoteById(userId: string, id: string) {
    const note = await this.noteClient.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    return note;
  }

  async createNote(userId: string, dto: CreateNoteDto) {
    return await this.noteClient.create({
      data: {
        userId,
        title: dto.title,
        content: dto.content,
        category: dto.category || 'dsa',
        tags: dto.tags || [],
        isPinned: dto.isPinned || false,
        color: dto.color || 'emerald',
        linkedProblem: dto.linkedProblem || null,
      },
    });
  }

  async updateNote(userId: string, id: string, dto: UpdateNoteDto) {
    // Verify ownership
    await this.getNoteById(userId, id);

    return await this.noteClient.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.linkedProblem !== undefined && { linkedProblem: dto.linkedProblem }),
      },
    });
  }

  async deleteNote(userId: string, id: string) {
    // Verify ownership
    await this.getNoteById(userId, id);

    await this.noteClient.delete({
      where: { id },
    });

    return { success: true };
  }

  async togglePin(userId: string, id: string) {
    const current = await this.getNoteById(userId, id);

    return await this.noteClient.update({
      where: { id },
      data: {
        isPinned: !current.isPinned,
      },
    });
  }
}
