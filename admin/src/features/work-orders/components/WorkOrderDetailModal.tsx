'use client';

import React from 'react';
import { EntityDetailModal, EntityHeader, DetailSection } from '@/components/crud/EntityDetailLayout';
import { ExecutionProgressCard } from '@/execution/components/ExecutionProgressCard';
import { ScheduleCard } from '@/execution/components/ScheduleCard';
import { LinkedEntitiesView } from '@/execution/components/LinkedEntitiesView';
import { LineItemTable } from '@/financial/components/LineItemTable';
import { FinancialSummary } from '@/financial/components/FinancialSummary';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { WorkOrder } from '../types';

export interface WorkOrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  onVerify?: (wo: WorkOrder) => void;
}

export function WorkOrderDetailModal({ open, onClose, workOrder, onVerify }: WorkOrderDetailModalProps) {
  if (!workOrder) return null;

  return (
    <EntityDetailModal
      open={open}
      onClose={onClose}
      title="Work Order Execution Context"
      header={
        <EntityHeader
          title={workOrder.title}
          subtitle={`WO: ${workOrder.workOrderNumber} • Ticket: ${workOrder.ticketNumber}`}
          badge={
            <Badge
              variant={
                workOrder.status === 'VERIFIED' || workOrder.status === 'COMPLETED'
                  ? 'success'
                  : workOrder.status === 'IN_PROGRESS'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {workOrder.status}
            </Badge>
          }
        />
      }
    >
      <div className="space-y-4">
        {/* Confirmed Visit Schedule */}
        <ScheduleCard appointment={workOrder.scheduledAppointment} />

        {/* Execution Progress */}
        <ExecutionProgressCard progress={workOrder.progress} />

        {/* Linked Platform Entities */}
        <LinkedEntitiesView entities={workOrder.linkedEntities} />

        {/* Overview Details */}
        <DetailSection
          title="Execution Overview"
          fields={[
            { label: 'Customer Account', value: workOrder.customerName },
            { label: 'Assigned Vendor', value: workOrder.vendorName },
            { label: 'Execution Status', value: workOrder.status },
            { label: 'Created Timestamp', value: new Date(workOrder.createdAt).toLocaleString() },
          ]}
        />

        {/* Financial Quotation Summary */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Approved Financial Quotation Items
          </h4>
          <LineItemTable items={workOrder.items} />
        </div>

        <FinancialSummary totals={workOrder.totals} />

        {/* Admin QA Verification Button */}
        {workOrder.status === 'COMPLETED' && onVerify && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => onVerify(workOrder)}>
              Verify Completion (QA Milestone)
            </Button>
          </div>
        )}
      </div>
    </EntityDetailModal>
  );
}
