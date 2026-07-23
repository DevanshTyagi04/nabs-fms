'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';

import { Invoice } from '@/features/invoices/types';
import { useInvoices } from '@/features/invoices/hooks';
import { InvoiceTable } from '@/features/invoices/components/InvoiceTable';
import { InvoiceDetailModal } from '@/features/invoices/components/InvoiceDetailModal';

const INVOICE_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search invoice #, ticket #, customer, vendor...',
  },
  {
    key: 'status',
    type: 'status',
    label: 'Billing Status',
    placeholder: 'All Billing Statuses',
    options: [
      { label: 'Draft', value: 'DRAFT' },
      { label: 'Issued', value: 'ISSUED' },
      { label: 'Sent to Customer', value: 'SENT' },
      { label: 'Viewed', value: 'VIEWED' },
      { label: 'Paid in Full', value: 'PAID' },
      { label: 'Overdue', value: 'OVERDUE' },
      { label: 'Cancelled / Void', value: 'CANCELLED' },
    ],
  },
];

export default function AdminInvoicesPage() {
  const { invoices, total, loading, filters, setFilters } = useInvoices({
    page: 1,
    pageSize: 10,
    search: '',
    status: 'ALL',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const [detailInvoice, setDetailInvoice] = useState<Invoice | null>(null);

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Invoice Management & Billing"
              description="Review customer billing statements, track balance due amounts, monitor payment statuses, and view linked execution context."
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={INVOICE_FILTER_SCHEMA}
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

            {/* Controlled Invoice Table */}
            <InvoiceTable
              invoices={invoices}
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
              onViewInvoice={(inv) => setDetailInvoice(inv)}
            />

            {/* Invoice Detail Modal */}
            <InvoiceDetailModal
              open={Boolean(detailInvoice)}
              onClose={() => setDetailInvoice(null)}
              invoice={detailInvoice}
            />
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
