'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardQuickAction } from '@/types/dashboard';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

export interface QuickActionCardProps {
  actions: DashboardQuickAction[];
  title?: string;
}

export function QuickActionCard({ actions, title = 'Quick Actions' }: QuickActionCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((act) => (
          <Link
            key={act.id}
            href={act.disabled ? '#' : act.href}
            className={cn(
              'flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:border-blue-300 dark:hover:border-blue-700 transition-all text-center gap-2',
              act.disabled && 'opacity-50 pointer-events-none'
            )}
          >
            <div className="p-2.5 rounded-full bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs">
              <Icon name={act.icon} size="md" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{act.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function InfoPanel({ title = 'System Operational Status' }: { title?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          All Systems Operational
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Phase 3 dashboard foundation active. API contracts frozen and ready for feature module integration.
      </p>
    </div>
  );
}
