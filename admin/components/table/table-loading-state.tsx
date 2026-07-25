'use client';

import React from 'react';

interface TableLoadingStateProps {
  rows?: number;
  cols?: number;
}

export function TableLoadingState({ rows = 5, cols = 6 }: TableLoadingStateProps) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 animate-pulse">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <div
              key={cIdx}
              className={`h-5 bg-slate-100 rounded ${
                cIdx === 0 ? 'w-24 bg-slate-200' : 'flex-1'
              }`}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
