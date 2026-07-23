'use client';

import React from 'react';
import { DataTable, Column, PaginationState, SortingState } from '@/components/crud/DataTable';
import { ActionMenu, ActionMenuItem } from '@/components/crud/ActionMenu';
import { WorkflowStatusBadge } from '@/components/workflow/WorkflowStatusBadge';
import { Badge } from '@/components/ui/Badge';
import { ServiceRequest } from '../types';

export interface ServiceRequestTableProps {
  requests: ServiceRequest[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  onPaginationChange?: (p: PaginationState) => void;
  onSortingChange?: (s: SortingState) => void;
  onViewRequest: (sr: ServiceRequest) => void;
  onAssignVendor: (sr: ServiceRequest) => void;
  onChangeStatus: (sr: ServiceRequest) => void;
}

export function ServiceRequestTable({
  requests,
  loading,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  onViewRequest,
  onAssignVendor,
  onChangeStatus,
}: ServiceRequestTableProps) {
  const columns: Column<ServiceRequest>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      render: (sr) => (
        <div>
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 block">{sr.ticketNumber}</span>
          <span className="text-[11px] text-slate-500 font-semibold truncate block max-w-[200px]">{sr.title}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (sr) => <span className="font-medium text-slate-700 dark:text-slate-300">{sr.category}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (sr) => (
        <Badge
          variant={
            sr.priority === 'URGENT'
              ? 'error'
              : sr.priority === 'HIGH'
              ? 'warning'
              : sr.priority === 'MEDIUM'
              ? 'info'
              : 'neutral'
          }
          size="sm"
        >
          {sr.priority}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Workflow Status',
      sortable: true,
      render: (sr) => <WorkflowStatusBadge status={sr.status} />,
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (sr) => <span className="text-slate-600 dark:text-slate-400">{sr.customerName || 'N/A'}</span>,
    },
    {
      key: 'assignedVendorName',
      header: 'Assigned Vendor',
      render: (sr) => (
        <span className="text-slate-600 dark:text-slate-400">
          {sr.assignedVendorName ? (
            <Badge variant="primary" size="sm">{sr.assignedVendorName}</Badge>
          ) : (
            <span className="text-slate-400 italic">Unassigned</span>
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      render: (sr) => (
        <span className="text-slate-500 text-[11px]">
          {new Date(sr.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (sr) => {
        const menuItems: ActionMenuItem[] = [
          {
            id: 'view',
            label: 'View Details',
            icon: 'check-circle',
            onClick: () => onViewRequest(sr),
          },
        ];

        if (sr.status === 'CREATED' || sr.status === 'ASSIGNED') {
          menuItems.push({
            id: 'assign',
            label: 'Assign Vendor',
            icon: 'user',
            onClick: () => onAssignVendor(sr),
          });
        }

        if (sr.status !== 'COMPLETED' && sr.status !== 'CANCELLED') {
          menuItems.push({
            id: 'status',
            label: 'Transition Status',
            icon: 'refresh',
            onClick: () => onChangeStatus(sr),
          });
        }

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={requests}
      loading={loading}
      pagination={pagination}
      sorting={sorting}
      rowKey={(sr) => sr.id}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      onRowClick={onViewRequest}
      emptyTitle="No Service Requests Found"
      emptyDescription="No service requests match your search or filter parameters."
    />
  );
}
