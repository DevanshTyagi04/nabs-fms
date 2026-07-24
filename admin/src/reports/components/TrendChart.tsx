'use client';

import React from 'react';

export interface TrendChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
}

export function TrendChart({ title, data }: TrendChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>

      <div className="flex items-end gap-3 h-40 pt-4">
        {data.map((d, i) => {
          const heightPercent = Math.round((d.value / maxValue) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[10px] font-mono text-slate-400">{d.value}</span>
              <div
                style={{ height: `${heightPercent}%` }}
                className="w-full bg-blue-600 dark:bg-blue-500 rounded-t transition-all min-h-[4px]"
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate block w-full text-center">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
