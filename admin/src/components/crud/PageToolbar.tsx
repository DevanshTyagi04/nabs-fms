'use client';

import React from 'react';

export interface PageToolbarProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageToolbar({ title, description, actions }: PageToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>

      {actions && <div className="flex items-center gap-3 self-start sm:self-auto">{actions}</div>}
    </div>
  );
}
