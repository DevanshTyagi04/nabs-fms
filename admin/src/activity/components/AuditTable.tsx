'use client';

import React from 'react';
import { TimelineItem } from '../core/types';
import { Badge } from '@/components/ui/Badge';

export interface AuditTableProps {
  items: TimelineItem[];
}

export function AuditTable({ items }: AuditTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
      <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
        <thead className="bg-slate-100 dark:bg-slate-800/60 font-semibold text-slate-900 dark:text-slate-100">
          <tr>
            <th className="p-3">Timestamp</th>
            <th className="p-3">Actor</th>
            <th className="p-3">Action</th>
            <th className="p-3">Entity Type</th>
            <th className="p-3">Entity ID</th>
            <th className="p-3">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
              <td className="p-3 font-mono text-[11px] text-slate-400">
                {new Date(item.createdAt).toLocaleString()}
              </td>
              <td className="p-3 font-medium">
                {item.actorName} ({item.actorRole})
              </td>
              <td className="p-3">
                <Badge variant="primary" size="sm">
                  {item.action}
                </Badge>
              </td>
              <td className="p-3 font-mono">{item.entityType}</td>
              <td className="p-3 font-mono text-slate-500">{item.entityId}</td>
              <td className="p-3">{item.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
