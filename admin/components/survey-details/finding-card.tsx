'use client';

import React from 'react';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { SurveyItem } from '@/lib/types/surveys.types';

interface FindingCardProps {
  item: SurveyItem;
}

export function FindingCard({ item }: FindingCardProps) {
  const observedDateStr = item.observedAt
    ? new Date(item.observedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs flex flex-col">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-[#c6c6cd] bg-[#F8FAFC] flex justify-between items-start flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="text-sm font-bold text-[#0b1c30]">{item.element}</h4>
            <PriorityBadge priority={item.severity} variant="badge" />
            {item.isMandatory && (
              <span className="px-2 py-0.5 bg-[#131b2e] text-white text-[10px] rounded uppercase font-bold tracking-wider font-mono">
                MANDATORY
              </span>
            )}
            {item.photoRequired && (
              <span className="px-2 py-0.5 bg-[#eff4ff] border border-[#c6c6cd] text-[#45464d] text-[10px] rounded uppercase font-bold tracking-wider font-mono">
                PHOTO REQ
              </span>
            )}
          </div>
          {item.locationMetadata && (
            <p className="text-[11px] font-mono text-[#76777d] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#76777d] shrink-0" />
              <span>{item.locationMetadata}</span>
            </p>
          )}
        </div>
        {observedDateStr && (
          <span className="text-[11px] font-mono text-[#76777d] font-medium shrink-0 flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#76777d]" />
            <span>Observed: {observedDateStr}</span>
          </span>
        )}
      </div>

      {/* Observation & Recommendation Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold font-mono">
            Observation
          </p>
          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#c6c6cd]">
            <p className="text-xs text-[#0b1c30] leading-relaxed whitespace-pre-line">
              {item.observation || 'No observation details recorded.'}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold font-mono">
            Recommended Action
          </p>
          <div className="bg-[#F8FAFC] p-4 rounded-lg border border-[#c6c6cd]">
            <p className="text-xs text-[#0b1c30] leading-relaxed whitespace-pre-line">
              {item.recommendedAction || (item as any).actionRequired || 'No recommended action specified.'}
            </p>
          </div>
        </div>
      </div>

      {/* Evidentiary Photos (if present on item) */}
      {item.attachments && item.attachments.length > 0 && (
        <div className="px-6 pb-6 border-t border-[#c6c6cd] pt-4">
          <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold font-mono mb-3">
            Evidentiary Photos ({item.attachments.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {item.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg border border-[#c6c6cd] overflow-hidden relative group cursor-zoom-in bg-slate-100 block"
              >
                <img
                  src={att.url}
                  alt={att.fileName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-[9px] text-white font-mono truncate flex items-center justify-between">
                  <span className="truncate">{att.fileName}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-white shrink-0 ml-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
