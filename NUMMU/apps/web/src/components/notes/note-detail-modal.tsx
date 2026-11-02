'use client';

import React from 'react';
import Link from 'next/link';
import { Modal } from '@/components/ui/modal';
import { Pin, Calendar, Check, Copy, Edit3, Code2, ExternalLink } from 'lucide-react';
import type { NoteItem } from '@/services/notes.service';
import { COLOR_MAP } from './note-types';

interface NoteDetailModalProps {
  note: NoteItem | null;
  onClose: () => void;
  onTogglePin: (id: string) => void;
  onEdit: (note: NoteItem) => void;
  onCopy: (note: NoteItem) => void;
  isCopied: boolean;
}

export function NoteDetailModal({
  note,
  onClose,
  onTogglePin,
  onEdit,
  onCopy,
  isCopied,
}: NoteDetailModalProps) {
  if (!note) return null;

  const colorTheme = COLOR_MAP[note.color] || COLOR_MAP.emerald;

  return (
    <Modal isOpen={!!note} onClose={onClose} title={note.title} maxWidth="3xl">
      <div className="space-y-4 pt-1 text-left">
        {/* Header badges & actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${colorTheme.badgeBg} ${colorTheme.badgeText}`}
            >
              {note.category.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Updated {note.updatedAt}</span>
            </span>
          </div>

          {/* Action buttons inside modal */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                note.isPinned
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title={note.isPinned ? 'Unpin' : 'Pin'}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{note.isPinned ? 'Pinned' : 'Pin'}</span>
            </button>

            <button
              onClick={() => onCopy(note)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onEdit(note);
                onClose();
              }}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Content view with monospace code formatting */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70 text-slate-800 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed select-text">
          {note.content}
        </div>

        {/* Linked Problem banner */}
        {note.linkedProblem && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-emerald-900">
                Linked Problem: {note.linkedProblem.title}
              </span>
            </div>
            <Link
              href={note.linkedProblem.href as React.ComponentProps<typeof Link>['href']}
              className="text-xs text-[#0b5c39] font-bold hover:underline flex items-center gap-1"
            >
              <span>Practice Problem</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Tag Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2">
          {note.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>
    </Modal>
  );
}
