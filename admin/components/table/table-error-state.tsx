'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface TableErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function TableErrorState({
  message = 'Failed to load records from the server',
  onRetry,
}: TableErrorStateProps) {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center justify-center bg-red-50/50">
      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3 border border-red-200">
        <AlertCircle className="w-5 h-5" />
      </div>
      <p className="text-xs font-semibold text-red-700 mb-3">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm active:scale-95"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry Request</span>
      </button>
    </div>
  );
}
