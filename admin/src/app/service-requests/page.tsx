'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';
import { AssignmentDialog } from '@/components/workflow/WorkflowComponents';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

import { ServiceRequest, CreateServiceRequestDto } from '@/features/service-requests/types';
import {
  useServiceRequests,
  useCreateServiceRequest,
  useAssignVendor,
  useChangeRequestStatus,
} from '@/features/service-requests/hooks';
import { ServiceRequestTable } from '@/features/service-requests/components/ServiceRequestTable';
import { ServiceRequestFormDialog } from '@/features/service-requests/components/ServiceRequestFormDialog';
import { ServiceRequestDetailModal } from '@/features/service-requests/components/ServiceRequestDetailModal';

const SERVICE_REQUEST_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search ticket #, title, category...',
  },
  {
    key: 'status',
    type: 'status',
    label: 'Workflow Status',
    placeholder: 'All Workflow Statuses',
    options: [
      { label: 'Created', value: 'CREATED' },
      { label: 'Vendor Assigned', value: 'ASSIGNED' },
      { label: 'In Progress', value: 'IN_PROGRESS' },
      { label: 'Completed', value: 'COMPLETED' },
      { label: 'Cancelled', value: 'CANCELLED' },
    ],
  },
  {
    key: 'priority',
    type: 'select',
    label: 'Priority',
    placeholder: 'All Priorities',
    options: [
      { label: 'Low', value: 'LOW' },
      { label: 'Medium', value: 'MEDIUM' },
      { label: 'High', value: 'HIGH' },
      { label: 'Urgent', value: 'URGENT' },
    ],
  },
];

const MOCK_VENDOR_ASSIGNEES = [
  { id: 'usr-vendor-01', name: 'Apex Field Services LLC', subtitle: 'HVAC & Electrical • Score: 4.9' },
  { id: 'usr-vendor-02', name: 'ProPlumb Solutions Inc.', subtitle: 'Plumbing • Score: 4.8' },
  { id: 'usr-vendor-03', name: 'VoltMaster Electrical', subtitle: 'Electrical Safety • Score: 4.7' },
];

export default function AdminServiceRequestsPage() {
  const toast = useToast();

  const { requests, total, loading, filters, setFilters, refetch } = useServiceRequests({
    page: 1,
    pageSize: 10,
    search: '',
    status: 'ALL',
    priority: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { createRequest, loading: createLoading, error: createError } = useCreateServiceRequest();
  const { assignVendor, loading: assignLoading } = useAssignVendor();
  const { changeStatus } = useChangeRequestStatus();

  const [formOpen, setFormOpen] = useState(false);
  const [detailRequest, setDetailRequest] = useState<ServiceRequest | null>(null);
  const [assignRequest, setAssignRequest] = useState<ServiceRequest | null>(null);

  const handleCreateSubmit = async (dto: CreateServiceRequestDto) => {
    await createRequest(dto);
    toast.success('Request Created', 'New service request ticket submitted successfully.');
    setFormOpen(false);
    refetch();
  };

  const handleAssignVendorSubmit = async (vendorId: string, notes?: string) => {
    if (!assignRequest) return;
    const vendor = MOCK_VENDOR_ASSIGNEES.find((v) => v.id === vendorId);
    const vendorName = vendor ? vendor.name : 'Assigned Vendor';

    await assignVendor(assignRequest.id, vendorId, vendorName, notes);
    toast.success('Vendor Assigned', `Assigned ${vendorName} to ${assignRequest.ticketNumber}.`);
    setAssignRequest(null);
    refetch();
  };

  const handleWorkflowAction = async (targetStatus: string) => {
    if (!detailRequest) return;
    await changeStatus(detailRequest.id, targetStatus as any);
    toast.success('Status Updated', `Ticket ${detailRequest.ticketNumber} transitioned to ${targetStatus}.`);
    setDetailRequest(null);
    refetch();
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Service Request Management"
              description="Manage ticket lifecycles, assign field vendors, and track real-time resolution timelines."
              actions={
                <Button
                  variant="primary"
                  leftIcon="briefcase"
                  onClick={() => setFormOpen(true)}
                >
                  Create Service Request
                </Button>
              }
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={SERVICE_REQUEST_FILTER_SCHEMA}
              values={filters}
              onChange={(newVals) => setFilters({ ...filters, ...newVals, page: 1 })}
              onReset={() =>
                setFilters({
                  page: 1,
                  pageSize: 10,
                  search: '',
                  status: 'ALL',
                  priority: 'ALL',
                  sortBy: 'createdAt',
                  sortOrder: 'desc',
                })
              }
            />

            {/* Fully Controlled Table */}
            <ServiceRequestTable
              requests={requests}
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
              onViewRequest={(sr) => setDetailRequest(sr)}
              onAssignVendor={(sr) => setAssignRequest(sr)}
              onChangeStatus={(sr) => setDetailRequest(sr)}
            />

            {/* Create Form Dialog */}
            <ServiceRequestFormDialog
              open={formOpen}
              onClose={() => setFormOpen(false)}
              loading={createLoading}
              error={createError}
              onSubmit={handleCreateSubmit}
            />

            {/* Detail & Workflow Modal */}
            <ServiceRequestDetailModal
              open={Boolean(detailRequest)}
              onClose={() => setDetailRequest(null)}
              request={detailRequest}
              onAction={handleWorkflowAction}
            />

            {/* Assign Vendor Dialog */}
            <AssignmentDialog
              open={Boolean(assignRequest)}
              onClose={() => setAssignRequest(null)}
              title={`Assign Vendor to ${assignRequest?.ticketNumber}`}
              assignees={MOCK_VENDOR_ASSIGNEES}
              loading={assignLoading}
              onAssign={handleAssignVendorSubmit}
            />
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
