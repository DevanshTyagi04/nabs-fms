'use client';

import React from 'react';
import { DataTable, Column, PaginationState, SortingState } from '@/components/crud/DataTable';
import { ActionMenu, ActionMenuItem } from '@/components/crud/ActionMenu';
import { MoneyDisplay } from '@/financial/components/MoneyDisplay';
import { GatewayStatusBadge } from '@/transactions/components/GatewayStatusBadge';
import { Payment } from '../types';

export interface PaymentTableProps {
  payments: Payment[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  onPaginationChange?: (p: PaginationState) => void;
  onSortingChange?: (s: SortingState) => void;
  onViewPayment: (p: Payment) => void;
  onReconcilePayment?: (p: Payment) => void;
}

export function PaymentTable({
  payments,
  loading,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  onViewPayment,
  onReconcilePayment,
}: PaymentTableProps) {
  const columns: Column<Payment>[] = [
    {
      key: 'paymentNumber',
      header: 'Payment Reference',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 block">{p.paymentNumber}</span>
          <span className="text-[11px] text-slate-500 font-semibold block">{p.ticketNumber}</span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer Account',
      render: (p) => <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{p.customerName}</span>,
    },
    {
      key: 'paymentMethod',
      header: 'Method / Channel',
      render: (p) => <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{p.paymentMethod}</span>,
    },
    {
      key: 'status',
      header: 'Gateway Status',
      sortable: true,
      render: (p) => <GatewayStatusBadge status={p.status} />,
    },
    {
      key: 'amount',
      header: 'Transaction Amount',
      render: (p) => <MoneyDisplay amount={p.amount} size="sm" variant="success" />,
    },
    {
      key: 'paidAt',
      header: 'Paid At',
      render: (p) => (
        <span className="text-slate-500 text-[11px] font-mono">
          {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (p) => {
        const menuItems: ActionMenuItem[] = [
          {
            id: 'view',
            label: 'View Receipt & Context',
            icon: 'eye',
            onClick: () => onViewPayment(p),
          },
        ];

        if (p.status === 'PENDING' && onReconcilePayment) {
          menuItems.push({
            id: 'reconcile',
            label: 'Manual Reconcile',
            icon: 'check',
            onClick: () => onReconcilePayment(p),
          });
        }

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={payments}
      loading={loading}
      pagination={pagination}
      sorting={sorting}
      rowKey={(p) => p.id}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      onRowClick={onViewPayment}
      emptyTitle="No Payments Found"
      emptyDescription="No payment transactions match your search or status filter parameters."
    />
  );
}
