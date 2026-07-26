'use client';

import React from 'react';
import { AddNote } from './add-note';
import { InternalCommentItem } from '@/lib/types/service-requests.types';

interface InternalNotesProps {
  comments?: InternalCommentItem[];
  onAddNote: (comment: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function InternalNotes({ comments = [], onAddNote, isSubmitting = false }: InternalNotesProps) {
  // Sort comments chronologically (oldest first or newest first)
  const sortedComments = [...comments].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC]">
        <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
          Internal Notes ({comments.length})
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Feed */}
        {sortedComments.length === 0 ? (
          <p className="text-xs text-[#76777d] italic text-center py-4">
            No internal staff notes recorded yet. Add the first administrative note below.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {sortedComments.map((note) => {
              const email = note.user?.email || 'System Staff';
              const role = note.user?.role || 'ADMIN';
              const initials = email.slice(0, 2).toUpperCase();

              const createdDateStr = new Date(note.createdAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <div key={note.id} className="p-4 bg-[#F8FAFC] rounded-lg border border-[#c6c6cd]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#dae2fd] flex items-center justify-center text-[10px] font-bold text-[#131b2e]">
                        {initials}
                      </div>
                      <span className="text-xs font-bold text-[#0b1c30]">
                        {email} <span className="text-[10px] text-[#76777d] font-normal">({role})</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#76777d]">{createdDateStr}</span>
                  </div>
                  <p className="text-xs text-[#45464d] leading-relaxed whitespace-pre-line">
                    {note.comment}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Note Form */}
        <AddNote onAddNote={onAddNote} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
