'use client';

import React from 'react';
import { DataTable, Column, PaginationState, SortingState } from '@/components/crud/DataTable';
import { ActionMenu, ActionMenuItem } from '@/components/crud/ActionMenu';
import { Badge } from '@/components/ui/Badge';
import { MoneyDisplay } from '@/financial/components/MoneyDisplay';
import { Estimate } from '../types';

export interface EstimateTableProps {
  estimates: Estimate[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  onPaginationChange?: (p: PaginationState) => void;
  onSortingChange?: (s: SortingState) => void;
  onViewEstimate: (estimate: Estimate) => void;
}

export function EstimateTable({
  estimates,
  loading,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  onViewEstimate,
}: EstimateTableProps) {
  const columns: Column<Estimate>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket & Quotation',
      render: (e) => (
        <div>
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 block">{e.ticketNumber}</span>
          <span className="text-[11px] text-slate-500 font-semibold truncate block max-w-[220px]">{e.title}</span>
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor',
      render: (e) => <Badge variant="primary" size="sm">{e.vendorName}</Badge>,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (e) => <span className="text-xs text-slate-600 dark:text-slate-400">{e.customerName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (e) => (
        <Badge
          variant={
            e.status === 'APPROVED'
              ? 'success'
              : e.status === 'REJECTED'
              ? 'error'
              : e.status === 'PENDING_APPROVAL'
              ? 'warning'
              : 'neutral'
          }
          size="sm"
          dot={e.status === 'PENDING_APPROVAL'}
        >
          {e.status}
        </Badge>
      ),
    },
    {
      key: 'totals',
      header: 'Grand Total',
      render: (e) => <MoneyDisplay amount={e.totals.grandTotal} size="sm" variant="primary" />,
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      render: (e) => <span className="text-slate-500 text-[11px] font-mono">{e.validUntil || 'N/A'}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (e) => {
        const menuItems: ActionMenuItem[] = [
          {
            id: 'view',
            label: 'View Quotation Details',
            icon: 'eye',
            onClick: () => onViewEstimate(e),
          },
        ];

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={estimates}
      loading={loading}
      pagination={pagination}
      sorting={sorting}
      rowKey={(e) => e.id}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      onRowClick={onViewEstimate}
      emptyTitle="No Estimate Quotations Found"
      emptyDescription="No estimates match your search or status filter parameters."
    />
  );
}
