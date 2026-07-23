'use client';

import React from 'react';
import { ActivityEngine } from '../core/Engines';
import { TimelineItem } from '../core/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface TimelineCardProps {
  item: TimelineItem;
  onNavigate?: (url: string) => void;
}

export function TimelineCard({ item, onNavigate }: TimelineCardProps) {
  const { definition, route, changeSummary, formattedDate } = ActivityEngine.evaluateItem(item);

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start justify-between gap-4">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <Badge variant={definition.severity === 'SUCCESS' ? 'success' : definition.severity === 'WARNING' ? 'warning' : 'primary'} size="sm">
            {definition.badge}
          </Badge>
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {item.actorName} ({item.actorRole})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">{formattedDate}</span>
        </div>

        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{item.description}</p>
        
        {changeSummary && (
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
            {changeSummary}
          </div>
        )}
      </div>

      {onNavigate && (
        <Button variant="ghost" size="sm" onClick={() => onNavigate(route)}>
          View Entity
        </Button>
      )}
    </div>
  );
}
