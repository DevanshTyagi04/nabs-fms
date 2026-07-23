'use client';

import React from 'react';
import { EntityDetailModal, EntityHeader, DetailSection } from '@/components/crud/EntityDetailLayout';
import { LineItemTable } from '@/financial/components/LineItemTable';
import { FinancialSummary } from '@/financial/components/FinancialSummary';
import { Badge } from '@/components/ui/Badge';
import { Estimate } from '../types';

export interface EstimateDetailModalProps {
  open: boolean;
  onClose: () => void;
  estimate: Estimate | null;
}

export function EstimateDetailModal({ open, onClose, estimate }: EstimateDetailModalProps) {
  if (!estimate) return null;

  return (
    <EntityDetailModal
      open={open}
      onClose={onClose}
      title="Estimate Quotation Details"
      header={
        <EntityHeader
          title={estimate.title}
          subtitle={`Ticket: ${estimate.ticketNumber} • Version v${estimate.version}.0`}
          badge={
            <Badge
              variant={
                estimate.status === 'APPROVED'
                  ? 'success'
                  : estimate.status === 'REJECTED'
                  ? 'error'
                  : 'warning'
              }
            >
              {estimate.status}
            </Badge>
          }
        />
      }
    >
      <div className="space-y-4">
        {/* Overview */}
        <DetailSection
          title="Quotation Overview"
          fields={[
            { label: 'Customer Account', value: estimate.customerName },
            { label: 'Assigned Vendor', value: estimate.vendorName },
            { label: 'Validity Date', value: estimate.validUntil || 'N/A' },
            { label: 'Status', value: estimate.status },
          ]}
        />

        {/* Line Items Table */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Quotation Line Items
          </h4>
          <LineItemTable items={estimate.items} />
        </div>

        {/* Financial Breakdown */}
        <FinancialSummary totals={estimate.totals} />
      </div>
    </EntityDetailModal>
  );
}
