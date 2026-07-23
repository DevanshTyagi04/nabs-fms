'use client';

import React from 'react';
import { EntityDetailModal, EntityHeader, DetailSection } from '@/components/crud/EntityDetailLayout';
import { TransactionSummaryCard } from '@/transactions/components/TransactionSummaryCard';
import { GatewayStatusBadge } from '@/transactions/components/GatewayStatusBadge';
import { LinkedEntitiesView } from '@/execution/components/LinkedEntitiesView';
import { FinancialSummary } from '@/financial/components/FinancialSummary';
import { Button } from '@/components/ui/Button';
import { Payment } from '../types';

export interface PaymentDetailModalProps {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
  onReconcile?: (p: Payment) => void;
}

export function PaymentDetailModal({ open, onClose, payment, onReconcile }: PaymentDetailModalProps) {
  if (!payment) return null;

  return (
    <EntityDetailModal
      open={open}
      onClose={onClose}
      title="Payment Transaction Receipt"
      header={
        <EntityHeader
          title={`Payment ${payment.paymentNumber}`}
          subtitle={`Customer: ${payment.customerName} • Ticket: ${payment.ticketNumber}`}
          badge={<GatewayStatusBadge status={payment.status} />}
        />
      }
    >
      <div className="space-y-4">
        {/* Transaction Summary */}
        <TransactionSummaryCard
          amount={payment.amount}
          status={payment.status}
          paymentMethod={payment.paymentMethod}
          transactionNumber={payment.paymentNumber}
          razorpayPaymentId={payment.razorpayPaymentId}
          paidAt={payment.paidAt}
        />

        {/* Linked Platform Entities */}
        <LinkedEntitiesView entities={payment.linkedEntities} />

        {/* Overview Details */}
        <DetailSection
          title="Payment Metadata"
          fields={[
            { label: 'Payment Reference', value: payment.paymentNumber },
            { label: 'Customer Account', value: payment.customerName },
            { label: 'Assigned Vendor', value: payment.vendorName },
            { label: 'Razorpay Order ID', value: payment.razorpayOrderId || 'N/A' },
          ]}
        />

        <FinancialSummary totals={payment.totals} />

        {/* Admin Manual Reconciliation Action Button */}
        {payment.status === 'PENDING' && onReconcile && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => onReconcile(payment)}>
              Manually Reconcile Payment (QA / Bank Transfer)
            </Button>
          </div>
        )}
      </div>
    </EntityDetailModal>
  );
}
