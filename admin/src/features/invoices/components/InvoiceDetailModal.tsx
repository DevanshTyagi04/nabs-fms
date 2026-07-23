'use client';

import React from 'react';
import { EntityDetailModal, EntityHeader, DetailSection } from '@/components/crud/EntityDetailLayout';
import { BillingSummaryCard } from '@/documents/components/BillingSummaryCard';
import { PaymentStatusBadge } from '@/documents/components/PaymentStatusBadge';
import { LinkedEntitiesView } from '@/execution/components/LinkedEntitiesView';
import { LineItemTable } from '@/financial/components/LineItemTable';
import { FinancialSummary } from '@/financial/components/FinancialSummary';
import { Invoice } from '../types';

export interface InvoiceDetailModalProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function InvoiceDetailModal({ open, onClose, invoice }: InvoiceDetailModalProps) {
  if (!invoice) return null;

  return (
    <EntityDetailModal
      open={open}
      onClose={onClose}
      title="Invoice Billing Document"
      header={
        <EntityHeader
          title={`Invoice ${invoice.invoiceNumber}`}
          subtitle={`Customer: ${invoice.customerName} • Ticket: ${invoice.ticketNumber}`}
          badge={<PaymentStatusBadge status={invoice.status} />}
        />
      }
    >
      <div className="space-y-4">
        {/* Billing Summary */}
        <BillingSummaryCard
          grandTotal={invoice.grandTotal}
          amountDue={invoice.amountDue}
          dueDate={invoice.dueDate}
          status={invoice.status}
        />

        {/* Linked Operational Context */}
        <LinkedEntitiesView entities={invoice.linkedEntities} />

        {/* Overview */}
        <DetailSection
          title="Document Information"
          fields={[
            { label: 'Invoice Number', value: invoice.invoiceNumber },
            { label: 'Customer Account', value: invoice.customerName },
            { label: 'Assigned Vendor', value: invoice.vendorName },
            { label: 'Issue Date', value: new Date(invoice.createdAt).toLocaleDateString() },
          ]}
        />

        {/* Financial Billed Line Items */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Billed Financial Line Items
          </h4>
          <LineItemTable items={invoice.items} />
        </div>

        <FinancialSummary totals={invoice.totals} />

        {/* Phase 10 Payment Reconciliation Slot (Prepared for Payments Module) */}
        <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-xs text-slate-500">
          <span className="font-semibold block text-slate-700 dark:text-slate-300">Phase 10 Payments Integration Slot</span>
          <span>Payment processing, transaction receipts, and gateway reconciliation will attach here in Phase 10.</span>
        </div>
      </div>
    </EntityDetailModal>
  );
}
