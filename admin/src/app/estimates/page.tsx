'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';

import { Estimate } from '@/features/estimates/types';
import { useEstimates } from '@/features/estimates/hooks';
import { EstimateTable } from '@/features/estimates/components/EstimateTable';
import { EstimateDetailModal } from '@/features/estimates/components/EstimateDetailModal';

const ESTIMATE_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search ticket #, title, vendor...',
  },
  {
    key: 'status',
    type: 'status',
    label: 'Estimate Status',
    placeholder: 'All Estimate Statuses',
    options: [
      { label: 'Draft', value: 'DRAFT' },
      { label: 'Pending Customer Approval', value: 'PENDING_APPROVAL' },
      { label: 'Approved', value: 'APPROVED' },
      { label: 'Rejected', value: 'REJECTED' },
    ],
  },
];

export default function AdminEstimatesPage() {
  const { estimates, total, loading, filters, setFilters } = useEstimates({
    page: 1,
    pageSize: 10,
    search: '',
    status: 'ALL',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const [detailEstimate, setDetailEstimate] = useState<Estimate | null>(null);

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Estimate Quotation Management"
              description="Review vendor quotation estimates, verify line-item pricing breakdowns, and track customer approval statuses."
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={ESTIMATE_FILTER_SCHEMA}
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

            {/* Controlled Estimate Table */}
            <EstimateTable
              estimates={estimates}
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
              onViewEstimate={(e) => setDetailEstimate(e)}
            />

            {/* Estimate Detail Modal */}
            <EstimateDetailModal
              open={Boolean(detailEstimate)}
              onClose={() => setDetailEstimate(null)}
              estimate={detailEstimate}
            />
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
