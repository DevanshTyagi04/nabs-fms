'use client';

import React from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';

import { useSync } from '@/features/sync/hooks';
import { OfflineBanner } from '@/sync/components/OfflineBanner';
import { PendingChangesCard } from '@/sync/components/PendingChangesCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

export default function AdminSyncPage() {
  const toast = useToast();
  const { data, loading, refetch, retryItem } = useSync();

  const handleManualSync = async () => {
    await refetch();
    toast.success('Sync Completed', 'All background mutation queues processed.');
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Sync & Offline Queue Management"
              description="Monitor background mutation queues, retry offline pending operations, and inspect sync state."
            />

            {/* Offline & Queue Status Banner */}
            {data && (
              <OfflineBanner session={data.session} onRetry={handleManualSync} />
            )}

            {/* Header Controls */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Queued Offline Mutations ({data?.queuedItems.length || 0})
              </span>

              <Button variant="secondary" size="sm" onClick={handleManualSync}>
                Force Refresh Queues
              </Button>
            </div>

            {/* Queue Items List */}
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading sync queue status...</div>
            ) : !data || data.queuedItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                No pending offline mutations in queue. All systems synchronized.
              </div>
            ) : (
              <div className="space-y-3">
                {data.queuedItems.map((item) => (
                  <PendingChangesCard key={item.id} item={item} onRetry={retryItem} />
                ))}
              </div>
            )}
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
