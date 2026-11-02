'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingState } from '@/components/ui/loading-state';
import {
  notesService,
  type NoteItem,
  type NoteCategory,
} from '@/services/notes.service';
import {
  NoteCard,
  NoteStatsStrip,
  NoteToolbar,
  NoteFormModal,
  NoteDetailModal,
  NoteDeleteModal,
} from '@/components/notes';
import { Plus, Pin, FileText } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'pinned' | 'title'>('pinned');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteItem | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchNotes = async () => {
    try {
      const data = await notesService.getNotes();
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (note: NoteItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingNote(note);
    setIsFormModalOpen(true);
  };

  const handleSaveNote = async (noteData: {
    title: string;
    content: string;
    category: NoteItem['category'];
    color: NoteItem['color'];
    tags: string[];
    isPinned: boolean;
    linkedProblem?: { title: string; href: string } | undefined;
  }) => {
    if (editingNote) {
      await notesService.updateNote(editingNote.id, noteData);
    } else {
      await notesService.createNote(noteData);
    }
    await fetchNotes();
  };

  const handleDeleteNote = async (id: string) => {
    await notesService.deleteNote(id);
    setDeletingNoteId(null);
    if (viewingNote?.id === id) setViewingNote(null);
    await fetchNotes();
  };

  const handleTogglePin = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await notesService.togglePin(id);
    await fetchNotes();
    if (viewingNote?.id === id) {
      setViewingNote((prev) => (prev ? { ...prev, isPinned: !prev.isPinned } : null));
    }
  };

  const handleCopyContent = (note: NoteItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => set.add(t)));
    return Array.from(set).slice(0, 10);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    if (selectedCategory !== 'all') {
      result = result.filter((n) => n.category === selectedCategory);
    }

    if (selectedTag) {
      result = result.filter((n) =>
        n.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'pinned') {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [notes, selectedCategory, selectedTag, searchQuery, sortBy]);

  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.isPinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.isPinned), [filteredNotes]);

  return (
    <>
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pt-4 max-w-7xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <PageHeader
              title="Study Notes & Cheatsheets"
              description="Your personal engineering knowledge base. Capture key insights, code snippets, algorithmic patterns, and interview reflections."
              breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' },
                { label: 'Notes' },
              ]}
            />
            <button
              onClick={handleOpenCreateModal}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#0b5c39] hover:bg-[#08482c] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>

          {/* Metric Stats Strip */}
          <NoteStatsStrip notes={notes} />

          {/* Filter Bar, Search & Controls */}
          <NoteToolbar
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setSelectedTag(null);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            allTags={allTags}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Notes Content Section */}
          {loading ? (
            <div className="py-16">
              <LoadingState message="Loading your personal notes repository..." />
            </div>
          ) : filteredNotes.length === 0 ? (
            <EmptyState
              title={searchQuery || selectedCategory !== 'all' ? 'No matching notes found' : 'No notes yet'}
              description={
                searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search terms or selecting a different category filter.'
                  : 'Start capturing your algorithms, code snippets, and interview reflections!'
              }
              actionLabel={searchQuery || selectedCategory !== 'all' ? 'Clear Filters' : 'Create Note'}
              onAction={
                searchQuery || selectedCategory !== 'all'
                  ? () => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedTag(null);
                    }
                  : handleOpenCreateModal
              }
            />
          ) : (
            <div className="space-y-6">
              {/* Pinned Notes Section */}
              {pinnedNotes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <Pin className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pinned Notes ({pinnedNotes.length})</span>
                  </div>

                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-3'
                    }
                  >
                    {pinnedNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        viewMode={viewMode}
                        onView={() => setViewingNote(note)}
                        onEdit={(e) => handleOpenEditModal(note, e)}
                        onDelete={(e) => {
                          e.stopPropagation();
                          setDeletingNoteId(note.id);
                        }}
                        onTogglePin={(e) => handleTogglePin(note.id, e)}
                        onCopy={(e) => handleCopyContent(note, e)}
                        isCopied={copiedId === note.id}
                        onTagClick={(tag, e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Other Notes */}
              {otherNotes.length > 0 && (
                <div className="space-y-3">
                  {pinnedNotes.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pt-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Other Notes ({otherNotes.length})</span>
                    </div>
                  )}

                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                        : 'space-y-3'
                    }
                  >
                    {otherNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        viewMode={viewMode}
                        onView={() => setViewingNote(note)}
                        onEdit={(e) => handleOpenEditModal(note, e)}
                        onDelete={(e) => {
                          e.stopPropagation();
                          setDeletingNoteId(note.id);
                        }}
                        onTogglePin={(e) => handleTogglePin(note.id, e)}
                        onCopy={(e) => handleCopyContent(note, e)}
                        isCopied={copiedId === note.id}
                        onTagClick={(tag, e) => {
                          e.stopPropagation();
                          setSelectedTag(tag);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

      {/* ── Create / Edit Note Modal ── */}
      <NoteFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        editingNote={editingNote}
        onSave={handleSaveNote}
      />

      {/* ── View Detail Modal ── */}
      <NoteDetailModal
        note={viewingNote}
        onClose={() => setViewingNote(null)}
        onTogglePin={(id) => handleTogglePin(id)}
        onEdit={(note) => handleOpenEditModal(note)}
        onCopy={handleCopyContent}
        isCopied={copiedId === viewingNote?.id}
      />

      {/* ── Delete Confirmation Modal ── */}
      <NoteDeleteModal
        noteId={deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirmDelete={handleDeleteNote}
      />
    </>
  );
}
