'use client';

import React from 'react';
import { DataTable, Column, PaginationState, SortingState } from '@/components/crud/DataTable';
import { ActionMenu, ActionMenuItem } from '@/components/crud/ActionMenu';
import { MoneyDisplay } from '@/financial/components/MoneyDisplay';
import { PaymentStatusBadge } from '@/documents/components/PaymentStatusBadge';
import { Invoice } from '../types';

export interface InvoiceTableProps {
  invoices: Invoice[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  onPaginationChange?: (p: PaginationState) => void;
  onSortingChange?: (s: SortingState) => void;
  onViewInvoice: (inv: Invoice) => void;
}

export function InvoiceTable({
  invoices,
  loading,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  onViewInvoice,
}: InvoiceTableProps) {
  const columns: Column<Invoice>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice # & Ticket',
      render: (inv) => (
        <div>
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 block">{inv.invoiceNumber}</span>
          <span className="text-[11px] text-slate-500 font-semibold block">{inv.ticketNumber}</span>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer Account',
      render: (inv) => <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{inv.customerName}</span>,
    },
    {
      key: 'status',
      header: 'Billing Status',
      sortable: true,
      render: (inv) => <PaymentStatusBadge status={inv.status} />,
    },
    {
      key: 'grandTotal',
      header: 'Total Billed',
      render: (inv) => <MoneyDisplay amount={inv.grandTotal} size="sm" />,
    },
    {
      key: 'amountDue',
      header: 'Balance Due',
      render: (inv) => (
        <MoneyDisplay
          amount={inv.amountDue}
          size="sm"
          variant={inv.amountDue > 0 ? 'primary' : 'success'}
        />
      ),
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => (
        <span className="text-slate-500 text-[11px] font-mono">
          {new Date(inv.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (inv) => {
        const menuItems: ActionMenuItem[] = [
          {
            id: 'view',
            label: 'View Billing Details',
            icon: 'eye',
            onClick: () => onViewInvoice(inv),
          },
        ];

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={invoices}
      loading={loading}
      pagination={pagination}
      sorting={sorting}
      rowKey={(inv) => inv.id}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      onRowClick={onViewInvoice}
      emptyTitle="No Invoices Found"
      emptyDescription="No billing statements match your search or status filter parameters."
    />
  );
}
