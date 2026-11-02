'use client';

import React from 'react';
import { Pin, PinOff, Copy, Check, Edit3, Trash2, ExternalLink } from 'lucide-react';
import type { NoteItem } from '@/services/notes.service';
import { COLOR_MAP } from './note-types';

export interface NoteCardProps {
  note: NoteItem;
  viewMode: 'grid' | 'list';
  onView: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  isCopied: boolean;
  onTagClick: (tag: string, e: React.MouseEvent) => void;
}

export function NoteCard({
  note,
  viewMode,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onCopy,
  isCopied,
  onTagClick,
}: NoteCardProps) {
  const colorTheme = COLOR_MAP[note.color] || COLOR_MAP.emerald;

  if (viewMode === 'list') {
    return (
      <div
        onClick={onView}
        className={`group bg-white rounded-2xl border p-4 shadow-2xs transition-all hover:shadow-md cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${colorTheme.border}`}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${colorTheme.dot}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${colorTheme.badgeBg} ${colorTheme.badgeText}`}
              >
                {note.category.toUpperCase()}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                {note.title}
              </h3>
              {note.isPinned && (
                <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-mono">
              {note.content}
            </p>

            <div className="flex items-center gap-2 mt-2">
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  onClick={(e) => onTagClick(tag, e)}
                  className="text-[10px] bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 px-1.5 py-0.5 rounded transition-colors"
                >
                  #{tag}
                </span>
              ))}
              <span className="text-[10px] text-slate-400">· {note.updatedAt}</span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <button
            onClick={onTogglePin}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              note.isPinned
                ? 'text-amber-600 bg-amber-50'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={note.isPinned ? 'Unpin' : 'Pin note'}
          >
            {note.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Copy content"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div
      onClick={onView}
      className={`group bg-white rounded-3xl border p-5 shadow-2xs transition-all hover:shadow-md cursor-pointer flex flex-col justify-between text-left relative overflow-hidden ${colorTheme.border} ${colorTheme.bg}`}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorTheme.accent}`} />

      <div>
        {/* Card Header Row: Category Badge + Pin Button */}
        <div className="flex items-center justify-between gap-2 pb-2">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border tracking-wider ${colorTheme.badgeBg} ${colorTheme.badgeText}`}
          >
            {note.category.toUpperCase()}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isPinned
                  ? 'text-amber-500 fill-amber-500 bg-amber-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
          {note.title}
        </h3>

        {/* Note Content preview */}
        <div className="mt-2 text-xs text-slate-600 font-mono bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 line-clamp-4 leading-relaxed">
          {note.content}
        </div>

        {/* Linked Problem badge if exists */}
        {note.linkedProblem && (
          <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50/60 border border-emerald-200/70 px-2 py-1 rounded-lg truncate">
            <ExternalLink className="w-3 h-3 shrink-0 text-emerald-600" />
            <span className="truncate">{note.linkedProblem.title}</span>
          </div>
        )}

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mt-3">
          {note.tags.map((tag) => (
            <span
              key={tag}
              onClick={(e) => onTagClick(tag, e)}
              className="text-[10px] font-medium bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 px-2 py-0.5 rounded-md transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Date & Action icons */}
      <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-100/90 text-[11px] text-slate-400">
        <span>{note.updatedAt}</span>

        <div className="flex items-center gap-1">
          <button
            onClick={onCopy}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Copy content"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onEdit}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Edit note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
