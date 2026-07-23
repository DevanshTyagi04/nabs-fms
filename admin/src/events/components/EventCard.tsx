'use client';

import React from 'react';
import { EventRegistry, NotificationRouter } from '../core/Engines';
import { NotificationItem } from '../core/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface EventCardProps {
  item: NotificationItem;
  onMarkRead?: (id: string) => void;
  onNavigate?: (url: string) => void;
}

export function EventCard({ item, onMarkRead, onNavigate }: EventCardProps) {
  const config = EventRegistry.getConfig(item.type);
  const route = NotificationRouter.resolveRoute(item);

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        item.isRead
          ? 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
          : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-800 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            {!item.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />}
            <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{item.title}</span>
            <Badge variant={config.severity === 'error' ? 'error' : config.severity === 'success' ? 'success' : 'primary'} size="sm">
              {config.category}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">{item.message}</p>
          <span className="text-[10px] text-slate-400 font-mono block">
            {new Date(item.createdAt).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!item.isRead && onMarkRead && (
            <Button variant="ghost" size="sm" onClick={() => onMarkRead(item.id)}>
              Mark Read
            </Button>
          )}
          {onNavigate && (
            <Button variant="secondary" size="sm" onClick={() => onNavigate(route)}>
              View Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
