'use client';

import React from 'react';
import { DashboardMetric } from '@/types/dashboard';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface MetricCardProps {
  metric: DashboardMetric;
  className?: string;
}

export function MetricCard({ metric, className }: MetricCardProps) {
  const isPositive = metric.trendType === 'positive';
  const isNegative = metric.trendType === 'negative';

  return (
    <Card className={cn('p-5 hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-0 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {metric.label}
          </span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Icon name={metric.icon} size="md" />
          </div>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {metric.value}
          </span>

          {metric.trend && (
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-0.5',
                isPositive && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                isNegative && 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
                !isPositive && !isNegative && 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {metric.trend}
            </span>
          )}
        </div>

        {metric.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{metric.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
