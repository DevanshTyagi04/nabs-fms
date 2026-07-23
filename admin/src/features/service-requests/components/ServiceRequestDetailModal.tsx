'use client';

import React from 'react';
import { EntityDetailModal, EntityHeader, DetailSection } from '@/components/crud/EntityDetailLayout';
import { WorkflowSummary, WorkflowActionsBar } from '@/components/workflow/WorkflowComponents';
import { WorkflowTimeline } from '@/components/workflow/WorkflowTimeline';
import { Badge } from '@/components/ui/Badge';
import { ServiceRequest } from '../types';

export interface ServiceRequestDetailModalProps {
  open: boolean;
  onClose: () => void;
  request: ServiceRequest | null;
  onAction: (targetStatus: string) => void;
}

export function ServiceRequestDetailModal({
  open,
  onClose,
  request,
  onAction,
}: ServiceRequestDetailModalProps) {
  if (!request) return null;

  return (
    <EntityDetailModal
      open={open}
      onClose={onClose}
      title="Service Request Details & Workflow"
      header={
        <EntityHeader
          title={request.title}
          subtitle={`Ticket Number: ${request.ticketNumber}`}
          badge={<Badge variant="primary">{request.category}</Badge>}
        />
      }
    >
      <div className="space-y-4">
        {/* Workflow Summary */}
        <WorkflowSummary
          ticketNumber={request.ticketNumber}
          title={request.title}
          category={request.category}
          priority={request.priority}
          status={request.status}
        />

        {/* Workflow Actions Bar */}
        <WorkflowActionsBar currentStatus={request.status} onAction={onAction} />

        {/* Detail Sections */}
        <DetailSection
          title="Request Overview"
          fields={[
            { label: 'Customer Account', value: request.customerName || request.customerId },
            {
              label: 'Assigned Vendor',
              value: request.assignedVendorName ? (
                <Badge variant="primary">{request.assignedVendorName}</Badge>
              ) : (
                'Unassigned'
              ),
            },
            { label: 'Priority Level', value: request.priority },
            { label: 'Service Address', value: request.serviceAddress || 'N/A' },
          ]}
        />

        <DetailSection
          title="Problem Description"
          fields={[{ label: 'Description Notes', value: request.description }]}
        />

        {/* Workflow Timeline */}
        <WorkflowTimeline events={request.history || []} title="Audit & Transition Timeline" />
      </div>
    </EntityDetailModal>
  );
}
