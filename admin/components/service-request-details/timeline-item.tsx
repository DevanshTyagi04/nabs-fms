'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  FileCheck,
  Wrench,
  CreditCard,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export interface TimelineEventData {
  id: string;
  type: 'status_change' | 'assignment' | 'note' | 'survey' | 'estimate' | 'work_order' | 'payment' | 'system';
  title: string;
  description: string;
  timestamp: string; // ISO string
  actorEmail?: string | null;
  actorRole?: string | null;
}

interface TimelineItemProps {
  event: TimelineEventData;
  isLast: boolean;
}

export function TimelineItem({ event, isLast }: TimelineItemProps) {
  const formattedDateTime = new Date(event.timestamp).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Icon mapping per event type
  const renderIcon = () => {
    switch (event.type) {
      case 'status_change':
        return <CheckCircle2 className="w-4 h-4 text-[#006591]" />;
      case 'assignment':
        return <UserCheck className="w-4 h-4 text-[#10B981]" />;
      case 'note':
        return <MessageSquare className="w-4 h-4 text-[#F59E0B]" />;
      case 'survey':
        return <FileCheck className="w-4 h-4 text-[#6366F1]" />;
      case 'estimate':
        return <FileText className="w-4 h-4 text-[#006591]" />;
      case 'work_order':
        return <Wrench className="w-4 h-4 text-[#10B981]" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-[#10B981]" />;
      case 'system':
      default:
        return <Sparkles className="w-4 h-4 text-[#45464d]" />;
    }
  };

  return (
    <div className="relative flex items-start gap-4">
      {/* Connector vertical line */}
      {!isLast && (
        <div className="absolute top-10 left-5 -ml-px h-[calc(100%+16px)] w-0.5 bg-[#c6c6cd] z-0" />
      )}

      {/* Circle Icon Node */}
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#d3e4fe] border border-[#c6c6cd] z-10 shrink-0 shadow-2xs">
        {renderIcon()}
      </div>

      {/* Content Box */}
      <div className="flex-1 pt-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-[#0b1c30]">{event.title}</h4>
            {event.actorEmail && (
              <span className="text-[10px] font-mono text-[#76777d] px-1.5 py-0.5 bg-slate-100 rounded">
                {event.actorEmail} {event.actorRole ? `(${event.actorRole})` : ''}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#76777d] font-medium shrink-0">
            {formattedDateTime}
          </span>
        </div>
        <p className="text-xs text-[#45464d] leading-relaxed">{event.description}</p>
      </div>
    </div>
  );
}
