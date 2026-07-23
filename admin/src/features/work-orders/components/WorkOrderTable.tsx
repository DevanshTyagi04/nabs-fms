'use client';

import React from 'react';
import { DataTable, Column, PaginationState, SortingState } from '@/components/crud/DataTable';
import { ActionMenu, ActionMenuItem } from '@/components/crud/ActionMenu';
import { Badge } from '@/components/ui/Badge';
import { MoneyDisplay } from '@/financial/components/MoneyDisplay';
import { WorkOrder } from '../types';

export interface WorkOrderTableProps {
  workOrders: WorkOrder[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  onPaginationChange?: (p: PaginationState) => void;
  onSortingChange?: (s: SortingState) => void;
  onViewWorkOrder: (wo: WorkOrder) => void;
  onVerifyWorkOrder?: (wo: WorkOrder) => void;
}

export function WorkOrderTable({
  workOrders,
  loading,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  onViewWorkOrder,
  onVerifyWorkOrder,
}: WorkOrderTableProps) {
  const columns: Column<WorkOrder>[] = [
    {
      key: 'workOrderNumber',
      header: 'WO # & Ticket',
      render: (wo) => (
        <div>
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 block">{wo.workOrderNumber}</span>
          <span className="text-[11px] text-slate-500 font-semibold truncate block max-w-[200px]">{wo.ticketNumber}</span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Job Title',
      render: (wo) => <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate block max-w-[220px]">{wo.title}</span>,
    },
    {
      key: 'vendorName',
      header: 'Assigned Vendor',
      render: (wo) => <Badge variant="primary" size="sm">{wo.vendorName}</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (wo) => (
        <Badge
          variant={
            wo.status === 'VERIFIED'
              ? 'success'
              : wo.status === 'COMPLETED'
              ? 'success'
              : wo.status === 'IN_PROGRESS'
              ? 'warning'
              : wo.status === 'ON_HOLD'
              ? 'error'
              : 'neutral'
          }
          size="sm"
          dot={wo.status === 'IN_PROGRESS'}
        >
          {wo.status}
        </Badge>
      ),
    },
    {
      key: 'progress',
      header: 'Execution Progress',
      render: (wo) => (
        <div className="w-28">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
            <span>{wo.progress.percentage}%</span>
            <span>{wo.progress.completedTasks}/{wo.progress.totalTasks} Tasks</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 transition-all rounded-full"
              style={{ width: `${wo.progress.percentage}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'totals',
      header: 'Order Value',
      render: (wo) => <MoneyDisplay amount={wo.totals.grandTotal} size="sm" variant="primary" />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (wo) => {
        const menuItems: ActionMenuItem[] = [
          {
            id: 'view',
            label: 'View Execution Context',
            icon: 'eye',
            onClick: () => onViewWorkOrder(wo),
          },
        ];

        if (wo.status === 'COMPLETED' && onVerifyWorkOrder) {
          menuItems.push({
            id: 'verify',
            label: 'Verify Completion (QA)',
            icon: 'check',
            onClick: () => onVerifyWorkOrder(wo),
          });
        }

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={workOrders}
      loading={loading}
      pagination={pagination}
      sorting={sorting}
      rowKey={(wo) => wo.id}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      onRowClick={onViewWorkOrder}
      emptyTitle="No Work Orders Found"
      emptyDescription="No work orders match your search or status filter parameters."
    />
  );
}
