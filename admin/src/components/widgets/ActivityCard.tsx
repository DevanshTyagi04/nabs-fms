'use client';

import React from 'react';
import { DashboardActivity } from '@/types/dashboard';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

export interface ActivityCardProps {
  activities: DashboardActivity[];
  title?: string;
}

export function ActivityCard({ activities, title = 'Recent Activity' }: ActivityCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <span className="text-xs text-slate-500 font-medium">Timeline</span>
      </div>

      <div className="space-y-3">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Icon name="check-circle" size="sm" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h4>
                {item.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</p>
                )}
                <span className="text-[10px] text-slate-400 block mt-1">{item.timestamp}</span>
              </div>
            </div>

            {item.statusLabel && (
              <Badge
                variant={
                  item.type === 'success'
                    ? 'success'
                    : item.type === 'warning'
                    ? 'warning'
                    : item.type === 'error'
                    ? 'error'
                    : 'info'
                }
                size="sm"
              >
                {item.statusLabel}
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
