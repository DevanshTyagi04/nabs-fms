'use client';

import React from 'react';
import { ReportsEngine } from '../core/Engines';
import { DashboardMetric } from '../core/types';
import { Button } from '@/components/ui/Button';

export interface MetricCardProps {
  metric: DashboardMetric;
  onDrillDown?: (route: string) => void;
}

export function MetricCard({ metric, onDrillDown }: MetricCardProps) {
  const { widget, formattedVal, trendText } = ReportsEngine.evaluateMetric(metric);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between gap-3">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
          {metric.title}
        </span>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
          {formattedVal}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className={`font-medium ${metric.isPositive !== false ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
          {trendText}
        </span>

        {onDrillDown && (
          <Button variant="ghost" size="sm" onClick={() => onDrillDown(widget.drillDownRoute)}>
            View Breakdown
          </Button>
        )}
      </div>
    </div>
  );
}
