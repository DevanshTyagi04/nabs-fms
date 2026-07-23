'use client';

import React from 'react';
import { DataTable, Column, PaginationState, SortingState } from '@/components/crud/DataTable';
import { ActionMenu, ActionMenuItem } from '@/components/crud/ActionMenu';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { User } from '../types';

export interface UserTableProps {
  users: User[];
  loading?: boolean;
  pagination?: PaginationState;
  sorting?: SortingState;
  selection?: string[];
  onPaginationChange?: (p: PaginationState) => void;
  onSortingChange?: (s: SortingState) => void;
  onSelectionChange?: (ids: string[]) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onToggleStatus: (user: User) => void;
}

export function UserTable({
  users,
  loading,
  pagination,
  sorting,
  selection,
  onPaginationChange,
  onSortingChange,
  onSelectionChange,
  onViewUser,
  onEditUser,
  onToggleStatus,
}: UserTableProps) {
  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'Account User',
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar name={u.firstName || u.email} size="sm" status="online" />
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {u.firstName ? `${u.firstName} ${u.lastName || ''}` : u.email.split('@')[0]}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: (u) => (
        <Badge
          variant={u.role === 'ADMIN' ? 'primary' : u.role === 'VENDOR' ? 'info' : 'secondary'}
          size="sm"
        >
          {u.role}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (u) => (
        <Badge
          variant={u.status === 'ACTIVE' ? 'success' : u.status === 'SUSPENDED' ? 'error' : 'warning'}
          size="sm"
          dot
        >
          {u.status}
        </Badge>
      ),
    },
    {
      key: 'phone',
      header: 'Phone Number',
      render: (u) => <span className="font-mono text-slate-600 dark:text-slate-400">{u.phone || 'N/A'}</span>,
    },
    {
      key: 'lastLogin',
      header: 'Last Active',
      render: (u) => (
        <span className="text-slate-500">
          {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      width: '60px',
      render: (u) => {
        const menuItems: ActionMenuItem[] = [
          {
            id: 'view',
            label: 'View Details',
            icon: 'check-circle',
            onClick: () => onViewUser(u),
          },
          {
            id: 'edit',
            label: 'Edit User',
            icon: 'settings',
            onClick: () => onEditUser(u),
          },
          {
            id: 'toggle-status',
            label: u.status === 'ACTIVE' ? 'Deactivate User' : 'Activate User',
            icon: u.status === 'ACTIVE' ? 'x' : 'check-circle',
            variant: u.status === 'ACTIVE' ? 'danger' : 'default',
            onClick: () => onToggleStatus(u),
          },
        ];

        return <ActionMenu items={menuItems} />;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
      pagination={pagination}
      sorting={sorting}
      selection={selection}
      rowKey={(u) => u.id}
      onPaginationChange={onPaginationChange}
      onSortingChange={onSortingChange}
      onSelectionChange={onSelectionChange}
      onRowClick={onViewUser}
      emptyTitle="No Users Found"
      emptyDescription="No account users match your query parameters."
    />
  );
}
