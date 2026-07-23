'use client';

import React from 'react';
import { LinkedEntity } from '../core/types';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

export interface LinkedEntitiesViewProps {
  entities: LinkedEntity[];
}

export function LinkedEntitiesView({ entities }: LinkedEntitiesViewProps) {
  if (!entities || entities.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Linked Platform Context
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {entities.map((entity) => (
          <div
            key={entity.id}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Icon name="file-text" size="sm" className="text-slate-400" />
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">{entity.label}</span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 block">
                  {entity.referenceNumber}
                </span>
              </div>
            </div>
            <Badge size="sm" variant="neutral">
              {entity.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
