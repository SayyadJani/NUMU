'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import type { NoteItem, NoteColor } from '@/services/notes.service';
import { COLOR_MAP } from './note-types';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote: NoteItem | null;
  onSave: (noteData: {
    title: string;
    content: string;
    category: NoteItem['category'];
    color: NoteColor;
    tags: string[];
    isPinned: boolean;
    linkedProblem?: { title: string; href: string } | undefined;
  }) => Promise<void>;
}

export function NoteFormModal({
  isOpen,
  onClose,
  editingNote,
  onSave,
}: NoteFormModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteItem['category']>('dsa');
  const [color, setColor] = useState<NoteColor>('emerald');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [problemTitle, setProblemTitle] = useState('');
  const [problemLink, setProblemLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content);
      setCategory(editingNote.category);
      setColor(editingNote.color);
      setTags(editingNote.tags.join(', '));
      setIsPinned(editingNote.isPinned);
      setProblemTitle(editingNote.linkedProblem?.title || '');
      setProblemLink(editingNote.linkedProblem?.href || '');
    } else {
      setTitle('');
      setContent('');
      setCategory('dsa');
      setColor('emerald');
      setTags('');
      setIsPinned(false);
      setProblemTitle('');
      setProblemLink('');
    }
  }, [editingNote, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const linkedProblem =
        problemTitle.trim() && problemLink.trim()
          ? {
              title: problemTitle.trim(),
              href: problemLink.trim(),
            }
          : undefined;

      await onSave({
        title: title.trim(),
        content: content.trim(),
        category,
        color,
        tags: parsedTags,
        isPinned,
        linkedProblem,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingNote ? 'Edit Study Note' : 'Create New Study Note'}
      description="Write concise summaries, algorithms, code blocks, or placement prep insights."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Note Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sliding Window Invariants & Two Pointers Template"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>

        {/* Category & Color row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NoteItem['category'])}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="dsa">DSA & Algorithms</option>
              <option value="system-design">System Design</option>
              <option value="web-dev">Web Dev & Fullstack</option>
              <option value="interview">Interview Prep</option>
              <option value="cheatsheet">Cheatsheet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Accent Color</label>
            <div className="flex items-center gap-2 pt-1">
              {(['emerald', 'blue', 'purple', 'amber', 'rose', 'slate'] as NoteColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                    COLOR_MAP[c].dot
                  } ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Content & Insights
          </label>
          <textarea
            rows={8}
            placeholder="Write your explanation, bullet points, time complexity, or code snippets here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-600 focus:bg-white font-mono transition-all leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Tags <span className="text-[11px] text-slate-400 font-normal">(Comma separated)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Sliding Window, Deque, O(N), Knapsack"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>

        {/* Linked Problem reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Linked Problem/Resource Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. LeetCode 239 - Sliding Window Maximum"
              value={problemTitle}
              onChange={(e) => setProblemTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Resource Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. /dashboard/dsa/problems"
              value={problemLink}
              onChange={(e) => setProblemLink(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Pin toggle */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="isPinned"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="isPinned" className="text-xs font-bold text-slate-700 cursor-pointer">
            Pin note to top of dashboard
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-[#0b5c39] hover:bg-[#08482c] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            {editingNote ? 'Save Changes' : 'Create Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
