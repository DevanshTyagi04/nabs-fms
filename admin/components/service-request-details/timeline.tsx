'use client';

import React, { useState } from 'react';
import { TimelineItem, TimelineEventData } from './timeline-item';
import { ServiceRequestDetail, ActivityTimelineItem } from '@/lib/types/service-requests.types';

interface TimelineProps {
  request: ServiceRequestDetail;
  activityItems?: ActivityTimelineItem[];
  isLoading?: boolean;
}

export function Timeline({ request, activityItems = [], isLoading = false }: TimelineProps) {
  const [filter, setFilter] = useState<'ALL' | 'STATUS' | 'NOTES' | 'SYSTEM'>('ALL');

  // Build merged timeline events array from backend statusHistory, comments, and activity items
  const events: TimelineEventData[] = [];

  // 1. Map Status History
  if (request.statusHistory && request.statusHistory.length > 0) {
    for (const sh of request.statusHistory) {
      events.push({
        id: `sh-${sh.id}`,
        type: 'status_change',
        title: `Status Changed to ${sh.toStatus.replace(/_/g, ' ')}`,
        description: sh.remarks || `Status transitioned from ${sh.fromStatus || 'N/A'} to ${sh.toStatus}`,
        timestamp: sh.createdAt,
        actorEmail: sh.changedBy?.email,
        actorRole: sh.changedBy?.role,
      });
    }
  }

  // 2. Map Comments (Internal Notes)
  if (request.comments && request.comments.length > 0) {
    for (const c of request.comments) {
      events.push({
        id: `note-${c.id}`,
        type: 'note',
        title: 'Staff Internal Note Added',
        description: c.comment,
        timestamp: c.createdAt,
        actorEmail: c.user?.email,
        actorRole: c.user?.role,
      });
    }
  }

  // 3. Map Activity Timeline items
  if (activityItems && activityItems.length > 0) {
    for (const act of activityItems) {
      // Avoid exact duplicates if already in statusHistory
      if (!events.some((e) => e.timestamp === act.timestamp)) {
        events.push({
          id: `act-${act.id}`,
          type: act.action?.toLowerCase().includes('status') ? 'status_change' : 'system',
          title: act.title || act.action || 'System Event',
          description: act.description || 'Activity logged in backend.',
          timestamp: act.timestamp,
          actorEmail: act.actor?.email,
          actorRole: act.actor?.role,
        });
      }
    }
  }

  // Sort events newest first (descending timestamp)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter events based on active pill
  const filteredEvents = events.filter((ev) => {
    if (filter === 'ALL') return true;
    if (filter === 'STATUS') return ev.type === 'status_change' || ev.type === 'assignment';
    if (filter === 'NOTES') return ev.type === 'note';
    if (filter === 'SYSTEM') return ev.type === 'system' || ev.type === 'survey' || ev.type === 'work_order';
    return true;
  });

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC] flex justify-between items-center">
        <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
          Work Timeline
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pb-4 border-b border-[#c6c6cd]">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              filter === 'ALL'
                ? 'bg-[#000000] text-white'
                : 'bg-[#d3e4fe] text-[#45464d] hover:bg-[#b8d4fe]'
            }`}
          >
            All Activity ({events.length})
          </button>
          <button
            onClick={() => setFilter('STATUS')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              filter === 'STATUS'
                ? 'bg-[#000000] text-white'
                : 'bg-[#d3e4fe] text-[#45464d] hover:bg-[#b8d4fe]'
            }`}
          >
            Status Changes
          </button>
          <button
            onClick={() => setFilter('NOTES')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              filter === 'NOTES'
                ? 'bg-[#000000] text-white'
                : 'bg-[#d3e4fe] text-[#45464d] hover:bg-[#b8d4fe]'
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setFilter('SYSTEM')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
              filter === 'SYSTEM'
                ? 'bg-[#000000] text-white'
                : 'bg-[#d3e4fe] text-[#45464d] hover:bg-[#b8d4fe]'
            }`}
          >
            System Events
          </button>
        </div>

        {/* Timeline Items List */}
        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#76777d]">
            No timeline events match the selected filter.
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {filteredEvents.map((event, idx) => (
              <TimelineItem
                key={event.id || idx}
                event={event}
                isLast={idx === filteredEvents.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
