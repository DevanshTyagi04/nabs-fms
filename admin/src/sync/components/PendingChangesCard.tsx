'use client';

import React from 'react';
import { QueueItem } from '../core/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface PendingChangesCardProps {
  item: QueueItem;
  onRetry?: (id: string) => void;
}

export function PendingChangesCard({ item, onRetry }: PendingChangesCardProps) {
  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant={item.status === 'COMPLETED' ? 'success' : item.status === 'FAILED' ? 'error' : 'primary'} size="sm">
            {item.type}
          </Badge>
          <span className="text-[11px] font-mono text-slate-400">Queue: {item.queueId}</span>
        </div>
        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block">
          Payload: {JSON.stringify(item.payload)}
        </span>
        <span className="text-[10px] text-slate-500 font-mono block">
          Queued At: {new Date(item.createdAt).toLocaleTimeString()} • Retries: {item.retryCount}
        </span>
      </div>

      {onRetry && item.status === 'FAILED' && (
        <Button variant="secondary" size="sm" onClick={() => onRetry(item.id)}>
          Retry Sync
        </Button>
      )}
    </div>
  );
}
