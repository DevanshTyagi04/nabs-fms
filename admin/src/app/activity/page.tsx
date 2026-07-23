'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';

import { useActivityTimeline } from '@/features/activity/hooks';
import { TimelineCard } from '@/activity/components/TimelineCard';
import { AuditTable } from '@/activity/components/AuditTable';
import { Button } from '@/components/ui/Button';

const ACTIVITY_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'category',
    type: 'status',
    label: 'Category',
    placeholder: 'All Categories',
    options: [
      { label: 'Financial Operations', value: 'FINANCIAL' },
      { label: 'Workflow State Changes', value: 'WORKFLOW' },
      { label: 'Storage & Assets', value: 'STORAGE' },
      { label: 'Lifecycle Audits', value: 'LIFECYCLE' },
    ],
  },
  {
    key: 'actorRole',
    type: 'status',
    label: 'Actor Role',
    placeholder: 'All Roles',
    options: [
      { label: 'System Admin', value: 'ADMIN' },
      { label: 'Vendor Partner', value: 'VENDOR' },
      { label: 'Customer', value: 'CUSTOMER' },
    ],
  },
];

export default function AdminActivityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'timeline' | 'audit'>('timeline');

  const { items, loading, filters, setFilters } = useActivityTimeline({
    page: 1,
    pageSize: 20,
    category: 'ALL',
    actorRole: 'ALL',
  });

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Platform Activity & Audit Center"
              description="Monitor platform activity stream, entity state transitions, user action logs, and system audit trails."
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={ACTIVITY_FILTER_SCHEMA}
              values={filters}
              onChange={(newVals) => setFilters({ ...filters, ...newVals, page: 1 })}
              onReset={() =>
                setFilters({
                  page: 1,
                  pageSize: 20,
                  category: 'ALL',
                  actorRole: 'ALL',
                })
              }
            />

            {/* View Selection Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Button
                variant={activeTab === 'timeline' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('timeline')}
              >
                Chronological Timeline
              </Button>
              <Button
                variant={activeTab === 'audit' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('audit')}
              >
                System Audit Log Table
              </Button>
            </div>

            {/* View Content */}
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading activity timeline...</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                No activity entries match your filter criteria.
              </div>
            ) : activeTab === 'timeline' ? (
              <div className="space-y-3">
                {items.map((item) => (
                  <TimelineCard
                    key={item.id}
                    item={item}
                    onNavigate={(url) => router.push(url as any)}
                  />
                ))}
              </div>
            ) : (
              <AuditTable items={items} />
            )}
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
