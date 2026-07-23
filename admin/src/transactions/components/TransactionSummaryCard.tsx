'use client';

import React from 'react';
import { MoneyDisplay } from '@/financial/components/MoneyDisplay';
import { GatewayStatusBadge } from './GatewayStatusBadge';

export interface TransactionSummaryCardProps {
  amount: number;
  status: string;
  paymentMethod?: string;
  transactionNumber: string;
  razorpayPaymentId?: string;
  paidAt?: string;
}

export function TransactionSummaryCard({
  amount,
  status,
  paymentMethod = 'Razorpay Gateway',
  transactionNumber,
  razorpayPaymentId,
  paidAt,
}: TransactionSummaryCardProps) {
  return (
    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Transaction Summary</span>
        <GatewayStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-slate-500 block">Transaction Reference</span>
          <span className="font-mono font-bold text-blue-700 dark:text-blue-300 block">{transactionNumber}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Paid Amount</span>
          <MoneyDisplay amount={amount} size="md" variant="success" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-200 dark:border-slate-800 pt-2">
        <div>
          <span className="text-slate-500 block">Payment Channel</span>
          <span className="font-medium text-slate-800 dark:text-slate-200">{paymentMethod}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Gateway Payment ID</span>
          <span className="font-mono text-slate-700 dark:text-slate-300">{razorpayPaymentId || 'N/A'}</span>
        </div>
      </div>

      {paidAt && (
        <div className="text-[11px] text-slate-500 pt-1">
          Settlement Timestamp: {new Date(paidAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
