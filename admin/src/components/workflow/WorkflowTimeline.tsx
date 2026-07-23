'use client';

import React from 'react';
import { Icon } from '@/components/ui/Icon';
import { WorkflowStatusBadge } from './WorkflowStatusBadge';

export interface WorkflowEvent {
  id: string;
  type: string;
  actor: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface WorkflowTimelineProps {
  events: WorkflowEvent[];
  title?: string;
}

export function WorkflowTimeline({ events, title = 'Audit & Workflow History' }: WorkflowTimelineProps) {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
        <span className="text-[10px] text-slate-400 font-mono">{events.length} Events</span>
      </div>

      <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {events.map((evt) => (
          <div key={evt.id} className="flex items-start gap-3 relative pl-7">
            <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shrink-0" />
            <div className="flex-1 text-xs space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-slate-100">{evt.description}</span>
                <span className="text-[10px] text-slate-400 font-mono">{evt.timestamp}</span>
              </div>
              <p className="text-[11px] text-slate-500">By {evt.actor}</p>
              {evt.metadata?.toStatus && (
                <div className="pt-1">
                  <WorkflowStatusBadge status={evt.metadata.toStatus} size="sm" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
