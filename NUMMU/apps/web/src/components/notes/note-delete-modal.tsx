'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';

interface NoteDeleteModalProps {
  noteId: string | null;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<void>;
}

export function NoteDeleteModal({
  noteId,
  onClose,
  onConfirmDelete,
}: NoteDeleteModalProps) {
  if (!noteId) return null;

  return (
    <Modal
      isOpen={!!noteId}
      onClose={onClose}
      title="Delete Study Note?"
      description="Are you sure you want to permanently delete this note? This action cannot be undone."
      maxWidth="sm"
    >
      <div className="flex items-center justify-end gap-2 pt-4">
        <button
          onClick={onClose}
          className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirmDelete(noteId)}
          className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          Delete Permanently
        </button>
      </div>
    </Modal>
  );
}
