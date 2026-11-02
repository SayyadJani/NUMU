import { Test, type TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('NotesService Persistence & Ownership', () => {
  let notesService: NotesService;

  const mockNoteClient = {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrisma = {
    note: mockNoteClient,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    notesService = module.get<NotesService>(NotesService);
  });

  describe('createNote', () => {
    it('should create and persist note in PostgreSQL bound to authenticated user', async () => {
      const input = {
        title: 'Dynamic Programming Patterns',
        content: 'Memoization vs Tabulation...',
        category: 'dsa',
        tags: ['DP', 'Algorithms'],
        isPinned: true,
        color: 'emerald',
      };

      mockNoteClient.create.mockResolvedValueOnce({
        id: 'note-cuid-1',
        userId: 'user-auth-123',
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await notesService.createNote('user-auth-123', input);

      expect(mockNoteClient.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-auth-123',
          title: 'Dynamic Programming Patterns',
          content: 'Memoization vs Tabulation...',
          category: 'dsa',
          tags: ['DP', 'Algorithms'],
          isPinned: true,
          color: 'emerald',
          linkedProblem: null,
        },
      });
      expect(result.id).toBe('note-cuid-1');
      expect(result.userId).toBe('user-auth-123');
    });
  });

  describe('getNotes', () => {
    it('should fetch notes scoped strictly to the authenticated user ID', async () => {
      mockNoteClient.findMany.mockResolvedValueOnce([
        { id: 'note-1', userId: 'user-auth-123', title: 'Note 1' },
      ]);

      const result = await notesService.getNotes('user-auth-123', { category: 'dsa' });

      expect(mockNoteClient.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-auth-123',
          category: 'dsa',
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('Ownership Enforcement', () => {
    it('should throw NotFoundException when attempting to access a note owned by another user', async () => {
      // User B tries to read User A's note
      mockNoteClient.findFirst.mockResolvedValueOnce(null);

      await expect(
        notesService.getNoteById('user-attacker-456', 'note-belonging-to-user-123'),
      ).rejects.toThrow(NotFoundException);

      expect(mockNoteClient.findFirst).toHaveBeenCalledWith({
        where: { id: 'note-belonging-to-user-123', userId: 'user-attacker-456' },
      });
    });

    it('should throw NotFoundException when attempting to update a note owned by another user', async () => {
      mockNoteClient.findFirst.mockResolvedValueOnce(null);

      await expect(
        notesService.updateNote('user-attacker-456', 'note-123', { title: 'Hacked Title' }),
      ).rejects.toThrow(NotFoundException);

      expect(mockNoteClient.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when attempting to delete a note owned by another user', async () => {
      mockNoteClient.findFirst.mockResolvedValueOnce(null);

      await expect(
        notesService.deleteNote('user-attacker-456', 'note-123'),
      ).rejects.toThrow(NotFoundException);

      expect(mockNoteClient.delete).not.toHaveBeenCalled();
    });
  });

  describe('updateNote & togglePin', () => {
    it('should update note fields when authenticated user is the owner', async () => {
      mockNoteClient.findFirst.mockResolvedValueOnce({
        id: 'note-123',
        userId: 'user-auth-123',
        title: 'Original Title',
      });
      mockNoteClient.update.mockResolvedValueOnce({
        id: 'note-123',
        userId: 'user-auth-123',
        title: 'Updated Title',
      });

      const result = await notesService.updateNote('user-auth-123', 'note-123', {
        title: 'Updated Title',
      });

      expect(mockNoteClient.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: { title: 'Updated Title' },
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should toggle isPinned state', async () => {
      mockNoteClient.findFirst.mockResolvedValueOnce({
        id: 'note-123',
        userId: 'user-auth-123',
        isPinned: false,
      });
      mockNoteClient.update.mockResolvedValueOnce({
        id: 'note-123',
        userId: 'user-auth-123',
        isPinned: true,
      });

      const result = await notesService.togglePin('user-auth-123', 'note-123');

      expect(mockNoteClient.update).toHaveBeenCalledWith({
        where: { id: 'note-123' },
        data: { isPinned: true },
      });
      expect(result.isPinned).toBe(true);
    });
  });
});
