'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';

import { WorkOrder } from '@/features/work-orders/types';
import { useWorkOrders, useVerifyWorkOrder } from '@/features/work-orders/hooks';
import { WorkOrderTable } from '@/features/work-orders/components/WorkOrderTable';
import { WorkOrderDetailModal } from '@/features/work-orders/components/WorkOrderDetailModal';
import { useToast } from '@/hooks/useToast';

const WORK_ORDER_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search WO #, ticket #, title, vendor...',
  },
  {
    key: 'status',
    type: 'status',
    label: 'Execution Status',
    placeholder: 'All Execution Statuses',
    options: [
      { label: 'Created', value: 'CREATED' },
      { label: 'Assigned', value: 'ASSIGNED' },
      { label: 'Scheduled', value: 'SCHEDULED' },
      { label: 'In Progress', value: 'IN_PROGRESS' },
      { label: 'On Hold (Paused)', value: 'ON_HOLD' },
      { label: 'Completed (Pending QA)', value: 'COMPLETED' },
      { label: 'Verified (QA Verified)', value: 'VERIFIED' },
    ],
  },
];

export default function AdminWorkOrdersPage() {
  const toast = useToast();
  const { workOrders, total, loading, filters, setFilters, refetch } = useWorkOrders({
    page: 1,
    pageSize: 10,
    search: '',
    status: 'ALL',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const { verifyWorkOrder } = useVerifyWorkOrder();
  const [detailWorkOrder, setDetailWorkOrder] = useState<WorkOrder | null>(null);

  const handleVerify = async (wo: WorkOrder) => {
    try {
      await verifyWorkOrder(wo.id, 'Verified by System Admin');
      toast.success('Work Order Verified', `Work Order ${wo.workOrderNumber} verified for invoicing.`);
      setDetailWorkOrder(null);
      refetch();
    } catch {
      toast.error('Verification Failed', 'Failed to record QA verification milestone.');
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Work Order Management & Execution"
              description="Track job execution progress, monitor scheduled technician visits, verify completed work orders, and review linked platform context."
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={WORK_ORDER_FILTER_SCHEMA}
              values={filters}
              onChange={(newVals) => setFilters({ ...filters, ...newVals, page: 1 })}
              onReset={() =>
                setFilters({
                  page: 1,
                  pageSize: 10,
                  search: '',
                  status: 'ALL',
                  sortBy: 'updatedAt',
                  sortOrder: 'desc',
                })
              }
            />

            {/* Controlled Work Order Table */}
            <WorkOrderTable
              workOrders={workOrders}
              loading={loading}
              pagination={{
                page: filters.page,
                pageSize: filters.pageSize,
                total,
              }}
              sorting={{
                sortBy: filters.sortBy || 'updatedAt',
                sortOrder: filters.sortOrder || 'desc',
              }}
              onPaginationChange={(p) => setFilters({ ...filters, page: p.page, pageSize: p.pageSize })}
              onSortingChange={(s) => setFilters({ ...filters, sortBy: s.sortBy, sortOrder: s.sortOrder })}
              onViewWorkOrder={(wo) => setDetailWorkOrder(wo)}
              onVerifyWorkOrder={(wo) => handleVerify(wo)}
            />

            {/* Work Order Detail Modal */}
            <WorkOrderDetailModal
              open={Boolean(detailWorkOrder)}
              onClose={() => setDetailWorkOrder(null)}
              workOrder={detailWorkOrder}
              onVerify={handleVerify}
            />
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
