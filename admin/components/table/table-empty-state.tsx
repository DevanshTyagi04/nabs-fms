'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface TableEmptyStateProps {
  title?: string;
  description?: string;
}

export function TableEmptyState({
  title = 'No records available',
  description = 'No matching entries were found for your current query or filter criteria.',
}: TableEmptyStateProps) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#76777d] mb-3 border border-[#c6c6cd]">
        <Inbox className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-[#0b1c30] mb-1">{title}</h3>
      <p className="text-xs text-[#76777d] max-w-sm">{description}</p>
    </div>
  );
}
