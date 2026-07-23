'use client';

import React from 'react';
import { SearchEngine } from '../core/Engines';
import { SearchResultItem } from '../core/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface SearchResultCardProps {
  item: SearchResultItem;
  onNavigate?: (url: string) => void;
}

export function SearchResultCard({ item, onNavigate }: SearchResultCardProps) {
  const { route, formattedDate } = SearchEngine.evaluateResult(item);

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
      <div className="space-y-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-300">
            {item.referenceNumber}
          </span>
          <Badge variant="primary" size="sm">
            {item.entityType.replace(/_/g, ' ')}
          </Badge>
          {item.status && <Badge variant="neutral" size="sm">{item.status}</Badge>}
        </div>
        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block">
          {item.title}
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
        <span className="text-[10px] text-slate-400 font-mono block">Updated: {formattedDate}</span>
      </div>

      {onNavigate && (
        <Button variant="secondary" size="sm" onClick={() => onNavigate(route)}>
          View Entity
        </Button>
      )}
    </div>
  );
}
