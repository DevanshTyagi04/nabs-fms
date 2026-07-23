'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';
import { Button } from '@/components/ui/Button';

import { useNotifications, useMarkAsRead } from '@/features/notifications/hooks';
import { EventCard } from '@/events/components/EventCard';

const NOTIFICATION_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search notification title or message...',
  },
  {
    key: 'category',
    type: 'status',
    label: 'Event Category',
    placeholder: 'All Categories',
    options: [
      { label: 'Workflow Events', value: 'WORKFLOW' },
      { label: 'Execution Events', value: 'EXECUTION' },
      { label: 'Financial Events', value: 'FINANCIAL' },
      { label: 'Document Events', value: 'DOCUMENT' },
      { label: 'Transaction Events', value: 'TRANSACTION' },
    ],
  },
];

export default function AdminNotificationsPage() {
  const router = useRouter();
  const { notifications, loading, filters, setFilters, refetch } = useNotifications({
    page: 1,
    pageSize: 20,
    search: '',
    category: 'ALL',
  });

  const { markAsRead, markAllAsRead } = useMarkAsRead();

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    refetch();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetch();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Platform Communication & Notifications"
              description="Review real-time cross-platform events, workflow state changes, billing alerts, and system notifications."
              actions={
                unreadCount > 0 ? (
                  <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
                    Mark All as Read ({unreadCount})
                  </Button>
                ) : undefined
              }
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={NOTIFICATION_FILTER_SCHEMA}
              values={filters}
              onChange={(newVals) => setFilters({ ...filters, ...newVals, page: 1 })}
              onReset={() =>
                setFilters({
                  page: 1,
                  pageSize: 20,
                  search: '',
                  category: 'ALL',
                })
              }
            />

            {/* Notification Event Cards List */}
            <div className="space-y-3">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  No notifications match your search or filter parameters.
                </div>
              ) : (
                notifications.map((item) => (
                  <EventCard
                    key={item.id}
                    item={item}
                    onMarkRead={handleMarkRead}
                    onNavigate={(url) => router.push(url as any)}
                  />
                ))
              )}
            </div>
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
