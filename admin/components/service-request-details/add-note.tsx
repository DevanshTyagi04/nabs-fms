'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface AddNoteProps {
  onAddNote: (comment: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddNote({ onAddNote, isSubmitting = false }: AddNoteProps) {
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Note content cannot be empty.');
      return;
    }

    try {
      setErrorMsg('');
      await onAddNote(comment.trim());
      setComment('');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to post internal note.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pt-4 border-t border-[#c6c6cd] space-y-2">
      {errorMsg && <p className="text-xs text-red-600 font-semibold">{errorMsg}</p>}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isSubmitting}
        rows={3}
        className="w-full bg-[#F8FAFC] border border-[#c6c6cd] rounded-lg p-3 text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#000000] resize-none"
        placeholder="Add an administrative note for internal staff..."
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="bg-[#000000] text-white px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-40"
        >
          {isSubmitting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Post Note</span>
        </button>
      </div>
    </form>
  );
}
