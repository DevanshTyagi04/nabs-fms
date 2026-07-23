'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/hooks/useToast';

import { User, CreateUserDto, UpdateUserDto } from '@/features/users/types';
import { useUsers, useCreateUser, useUpdateUser, useChangeUserStatus } from '@/features/users/hooks';
import { UserTable } from '@/features/users/components/UserTable';
import { UserFormDialog } from '@/features/users/components/UserFormDialog';
import { UserDetailModal } from '@/features/users/components/UserDetailModal';

const USER_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search name, email, company...',
  },
  {
    key: 'role',
    type: 'select',
    label: 'Roles',
    placeholder: 'All Account Roles',
    options: [
      { label: 'System Administrator', value: 'ADMIN' },
      { label: 'Vendor / Contractor', value: 'VENDOR' },
      { label: 'Customer Account', value: 'CUSTOMER' },
    ],
  },
  {
    key: 'status',
    type: 'status',
    label: 'Statuses',
    placeholder: 'All Account Statuses',
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Inactive', value: 'INACTIVE' },
      { label: 'Suspended', value: 'SUSPENDED' },
    ],
  },
];

export default function AdminUserManagementPage() {
  const toast = useToast();

  const { users, total, loading, filters, setFilters, refetch } = useUsers({
    page: 1,
    pageSize: 10,
    search: '',
    role: 'ALL',
    status: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { createUser, loading: createLoading, error: createError } = useCreateUser();
  const { updateUser, loading: updateLoading, error: updateError } = useUpdateUser();
  const { changeStatus } = useChangeUserStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [statusConfirmUser, setStatusConfirmUser] = useState<User | null>(null);

  const handleCreateSubmit = async (dto: CreateUserDto | UpdateUserDto) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, dto as UpdateUserDto);
      toast.success('User Updated', `Account attributes for ${selectedUser.email} were saved.`);
    } else {
      await createUser(dto as CreateUserDto);
      toast.success('User Created', `New user account was created successfully.`);
    }
    setFormOpen(false);
    setSelectedUser(null);
    refetch();
  };

  const handleToggleStatusConfirm = async () => {
    if (!statusConfirmUser) return;
    const newStatus = statusConfirmUser.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await changeStatus(statusConfirmUser.id, newStatus);
    toast.success('Status Updated', `User ${statusConfirmUser.email} status changed to ${newStatus}.`);
    setStatusConfirmUser(null);
    refetch();
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="User Management"
              description="Provision accounts, assign platform roles, and manage user statuses."
              actions={
                <Button
                  variant="primary"
                  leftIcon="user"
                  onClick={() => {
                    setSelectedUser(null);
                    setFormOpen(true);
                  }}
                >
                  Create New User
                </Button>
              }
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={USER_FILTER_SCHEMA}
              values={filters}
              onChange={(newVals) => setFilters({ ...filters, ...newVals, page: 1 })}
              onReset={() =>
                setFilters({
                  page: 1,
                  pageSize: 10,
                  search: '',
                  role: 'ALL',
                  status: 'ALL',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                })
              }
            />

            {/* Fully Controlled UserTable */}
            <UserTable
              users={users}
              loading={loading}
              pagination={{
                page: filters.page,
                pageSize: filters.pageSize,
                total,
              }}
              sorting={{
                sortBy: filters.sortBy || 'createdAt',
                sortOrder: filters.sortOrder || 'desc',
              }}
              onPaginationChange={(p) => setFilters({ ...filters, page: p.page, pageSize: p.pageSize })}
              onSortingChange={(s) => setFilters({ ...filters, sortBy: s.sortBy, sortOrder: s.sortOrder })}
              onViewUser={(u) => setDetailUser(u)}
              onEditUser={(u) => {
                setSelectedUser(u);
                setFormOpen(true);
              }}
              onToggleStatus={(u) => setStatusConfirmUser(u)}
            />

            {/* Form Dialog for Create & Edit */}
            <UserFormDialog
              open={formOpen}
              onClose={() => {
                setFormOpen(false);
                setSelectedUser(null);
              }}
              userToEdit={selectedUser}
              loading={createLoading || updateLoading}
              error={createError || updateError}
              onSubmit={handleCreateSubmit}
            />

            {/* Entity Detail Modal */}
            <UserDetailModal
              open={Boolean(detailUser)}
              onClose={() => setDetailUser(null)}
              user={detailUser}
            />

            {/* Confirm Status Change Dialog */}
            <ConfirmDialog
              open={Boolean(statusConfirmUser)}
              onClose={() => setStatusConfirmUser(null)}
              onConfirm={handleToggleStatusConfirm}
              title={`${statusConfirmUser?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'} User Account`}
              description={`Are you sure you want to change the account status for ${statusConfirmUser?.email}?`}
            />
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
