'use client';

import React from 'react';
import { ExecutionProgress } from '../core/types';
import { Badge } from '@/components/ui/Badge';

export interface ExecutionProgressCardProps {
  progress: ExecutionProgress;
  title?: string;
}

export function ExecutionProgressCard({ progress, title = 'Work Execution Progress' }: ExecutionProgressCardProps) {
  return (
    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
        <Badge variant={progress.isComplete ? 'success' : 'primary'} size="sm">
          {progress.percentage}% Completed
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 rounded-full"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>Checklist Items Finished</span>
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
          {progress.completedTasks} / {progress.totalTasks} Tasks
        </span>
      </div>
    </div>
  );
}
