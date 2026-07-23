'use client';

import React from 'react';
import { DataTable, Column, PaginationState, SortingState } from '@/components/crud/DataTable';
import { ActionMenu, ActionMenuItem } from '@/components/crud/ActionMenu';
import { Badge } from '@/components/ui/Badge';
import { Survey } from '../types';

export interface SurveyTableProps {
  surveys: Survey[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  onPaginationChange?: (p: PaginationState) => void;
  onSortingChange?: (s: SortingState) => void;
  onViewSurvey: (survey: Survey) => void;
  onReviewSurvey: (survey: Survey) => void;
}

export function SurveyTable({
  surveys,
  loading,
  pagination,
  sorting,
  onPaginationChange,
  onSortingChange,
  onViewSurvey,
  onReviewSurvey,
}: SurveyTableProps) {
  const columns: Column<Survey>[] = [
    {
      key: 'ticketNumber',
      header: 'Ticket & Survey',
      render: (s) => (
        <div>
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 block">{s.ticketNumber}</span>
          <span className="text-[11px] text-slate-500 font-semibold truncate block max-w-[200px]">{s.title}</span>
        </div>
      ),
    },
    {
      key: 'vendorName',
      header: 'Assigned Vendor',
      render: (s) => <Badge variant="primary" size="sm">{s.vendorName}</Badge>,
    },
    {
      key: 'version',
      header: 'Version',
      render: (s) => <span className="text-xs font-mono font-semibold">v{s.version}.0</span>,
    },
    {
      key: 'status',
      header: 'Review Status',
      sortable: true,
      render: (s) => (
        <Badge
          variant={
            s.status === 'APPROVED'
              ? 'success'
              : s.status === 'REJECTED'
              ? 'error'
              : s.status === 'SUBMITTED'
              ? 'warning'
              : 'neutral'
          }
          size="sm"
          dot={s.status === 'SUBMITTED'}
        >
          {s.status}
        </Badge>
      ),
    },
    {
      key: 'items',
      header: 'Inspection Items',
      render: (s) => <span className="text-xs text-slate-500 font-mono">{s.items.length} Items</span>,
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      render: (s) => <span className="text-slate-500 text-[11px]">{new Date(s.updatedAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (s) => {
        const menuItems: ActionMenuItem[] = [
          {
            id: 'view',
            label: 'View Inspection',
            icon: 'eye',
            onClick: () => onViewSurvey(s),
          },
        ];

        if (s.status === 'SUBMITTED') {
          menuItems.push({
            id: 'review',
            label: 'Review Decision',
            icon: 'check-circle',
            onClick: () => onReviewSurvey(s),
          });
        }

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={surveys}
      loading={loading}
      pagination={pagination}
      sorting={sorting}
      rowKey={(s) => s.id}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      onRowClick={onViewSurvey}
      emptyTitle="No Technical Surveys Found"
      emptyDescription="No surveys match your search or status filter parameters."
    />
  );
}
