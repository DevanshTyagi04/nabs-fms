'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';

import { Payment } from '@/features/payments/types';
import { usePayments, useReconcilePayment } from '@/features/payments/hooks';
import { PaymentTable } from '@/features/payments/components/PaymentTable';
import { PaymentDetailModal } from '@/features/payments/components/PaymentDetailModal';
import { useToast } from '@/hooks/useToast';

const PAYMENT_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search payment #, ticket #, customer, vendor...',
  },
  {
    key: 'status',
    type: 'status',
    label: 'Gateway Status',
    placeholder: 'All Gateway Statuses',
    options: [
      { label: 'Pending Session', value: 'PENDING' },
      { label: 'Success / Captured', value: 'SUCCESS' },
      { label: 'Failed / Declined', value: 'FAILED' },
      { label: 'Refunded', value: 'REFUNDED' },
    ],
  },
];

export default function AdminPaymentsPage() {
  const toast = useToast();
  const { payments, total, loading, filters, setFilters, refetch } = usePayments({
    page: 1,
    pageSize: 10,
    search: '',
    status: 'ALL',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const { reconcilePayment } = useReconcilePayment();
  const [detailPayment, setDetailPayment] = useState<Payment | null>(null);

  const handleReconcile = async (p: Payment) => {
    try {
      await reconcilePayment(p.id, 'SUCCESS', 'Manual admin reconciliation verified');
      toast.success('Payment Reconciled', `Payment ${p.paymentNumber} manually marked as SUCCESS.`);
      setDetailPayment(null);
      refetch();
    } catch {
      toast.error('Reconciliation Failed', 'Failed to record payment reconciliation.');
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Payment & Transaction Management"
              description="Track online Razorpay transactions, review settlement receipts, monitor gateway statuses, and manually reconcile offline payments."
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={PAYMENT_FILTER_SCHEMA}
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

            {/* Controlled Payment Table */}
            <PaymentTable
              payments={payments}
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
              onViewPayment={(p) => setDetailPayment(p)}
              onReconcilePayment={(p) => handleReconcile(p)}
            />

            {/* Payment Detail Modal */}
            <PaymentDetailModal
              open={Boolean(detailPayment)}
              onClose={() => setDetailPayment(null)}
              payment={detailPayment}
              onReconcile={handleReconcile}
            />
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
