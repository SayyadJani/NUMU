/**
 * Notes Service Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Persists personal study notes, cheatsheets, code annotations, and pattern summaries
 * directly to PostgreSQL via authenticated backend APIs.
 * Zero browser storage persistence (no localStorage, sessionStorage, or IndexedDB).
 */

import { apiClient } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/api/endpoints';

export type NoteCategory = 'all' | 'dsa' | 'system-design' | 'web-dev' | 'interview' | 'cheatsheet';
export type NoteColor = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'slate';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: 'dsa' | 'system-design' | 'web-dev' | 'interview' | 'cheatsheet';
  tags: string[];
  isPinned: boolean;
  color: NoteColor;
  updatedAt: string;
  createdAt: string;
  linkedProblem?: {
    title: string;
    href: string;
  } | undefined;
}

export interface NoteFilters extends Record<string, string | number | boolean | undefined> {
  category?: string | undefined;
  search?: string | undefined;
  tag?: string | undefined;
}

export interface NotesService {
  getNotes(filters?: NoteFilters): Promise<NoteItem[]>;
  getNoteById(id: string): Promise<NoteItem>;
  createNote(input: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteItem>;
  updateNote(id: string, updates: Partial<NoteItem>): Promise<NoteItem>;
  deleteNote(id: string): Promise<boolean>;
  togglePin(id: string): Promise<NoteItem>;
}

function normalizeNote(raw: any): NoteItem {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    category: raw.category || 'dsa',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    isPinned: Boolean(raw.isPinned),
    color: raw.color || 'emerald',
    linkedProblem: raw.linkedProblem || undefined,
    createdAt: raw.createdAt ? new Date(raw.createdAt).toISOString().split('T')[0]! : new Date().toISOString().split('T')[0]!,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
  };
}

class ApiNotesService implements NotesService {
  async getNotes(filters?: NoteFilters): Promise<NoteItem[]> {
    const data = await apiClient.get<any[]>(ENDPOINTS.NOTES.LIST, {
      params: filters,
    });
    return Array.isArray(data) ? data.map(normalizeNote) : [];
  }

  async getNoteById(id: string): Promise<NoteItem> {
    const raw = await apiClient.get<any>(ENDPOINTS.NOTES.BY_ID(id));
    return normalizeNote(raw);
  }

  async createNote(input: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteItem> {
    const raw = await apiClient.post<any>(ENDPOINTS.NOTES.CREATE, input);
    return normalizeNote(raw);
  }

  async updateNote(id: string, updates: Partial<NoteItem>): Promise<NoteItem> {
    const raw = await apiClient.put<any>(ENDPOINTS.NOTES.UPDATE(id), updates);
    return normalizeNote(raw);
  }

  async deleteNote(id: string): Promise<boolean> {
    await apiClient.delete(ENDPOINTS.NOTES.DELETE(id));
    return true;
  }

  async togglePin(id: string): Promise<NoteItem> {
    const raw = await apiClient.patch<any>(ENDPOINTS.NOTES.TOGGLE_PIN(id), {});
    return normalizeNote(raw);
  }
}

export const notesService: NotesService = new ApiNotesService();
