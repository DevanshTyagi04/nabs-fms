'use client';

import React from 'react';
import { DashboardAnnouncement } from '@/types/dashboard';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

export interface InfoCardProps {
  announcements: DashboardAnnouncement[];
  title?: string;
}

export function InfoCard({ announcements, title = 'System Updates' }: InfoCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <Icon name="bell" size="sm" className="text-slate-400" />
      </div>

      <div className="space-y-3">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-2"
          >
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="sm">{item.category}</Badge>
              <span className="text-xs text-slate-400 font-mono">{item.date}</span>
            </div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">{item.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
