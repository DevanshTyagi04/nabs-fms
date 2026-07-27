'use client';

import React from 'react';
import { FileText, Download, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { TableEmptyState } from '@/components/table/table-empty-state';
import { SurveyAttachment, SurveyItem } from '@/lib/types/surveys.types';

interface SurveyAttachmentsProps {
  attachments?: SurveyAttachment[];
  items?: SurveyItem[];
}

export function SurveyAttachments({ attachments = [], items = [] }: SurveyAttachmentsProps) {
  // Aggregate all attachments from top-level survey attachments and item attachments
  const allAttachments: SurveyAttachment[] = [...attachments];

  items.forEach((item) => {
    if (item.attachments && item.attachments.length > 0) {
      item.attachments.forEach((att) => {
        if (!allAttachments.some((existing) => existing.id === att.id)) {
          allAttachments.push(att);
        }
      });
    }
  });

  const docs = allAttachments.filter((att) => !att.mimeType?.startsWith('image/'));
  const images = allAttachments.filter((att) => att.mimeType?.startsWith('image/'));

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC]">
        <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
          Attachments ({allAttachments.length})
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {allAttachments.length === 0 ? (
          <TableEmptyState
            title="No Attachments"
            description="There are no documents or images attached to this survey."
          />
        ) : (
          <>
            {/* General Documents Section */}
            {docs.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">
                  General Documents ({docs.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex items-center justify-between hover:border-[#000000] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <FileText className="w-8 h-8 text-[#006591] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0b1c30] truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-[11px] font-mono text-[#76777d]">
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={doc.fileName}
                        className="p-2 text-[#76777d] hover:text-[#0b1c30] hover:bg-slate-200 rounded-lg transition-colors shrink-0"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Section */}
            {images.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">
                  Images & Photo Evidence ({images.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl overflow-hidden group cursor-pointer relative block shadow-2xs"
                    >
                      <img
                        src={img.url}
                        alt={img.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
