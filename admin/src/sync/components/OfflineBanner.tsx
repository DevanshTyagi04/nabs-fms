'use client';

import React from 'react';
import { SyncSession } from '../core/types';
import { SyncEngine } from '../core/Engines';

export interface OfflineBannerProps {
  session: SyncSession;
  onRetry?: () => void;
}

export function OfflineBanner({ session, onRetry }: OfflineBannerProps) {
  const { isOffline, statusLabel } = SyncEngine.evaluateSession(session);

  if (!isOffline && session.pendingOperationsCount === 0) return null;

  return (
    <div className={`p-3 rounded-lg flex items-center justify-between text-xs font-semibold ${
      isOffline ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
    }`}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        <span>{statusLabel}</span>
        {session.pendingOperationsCount > 0 && (
          <span className="font-normal text-slate-500">
            ({session.pendingOperationsCount} pending mutation(s) queued)
          </span>
        )}
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="underline hover:no-underline font-bold text-current"
        >
          Sync Now
        </button>
      )}
    </div>
  );
}
