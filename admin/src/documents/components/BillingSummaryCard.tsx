'use client';

import React from 'react';
import { MoneyDisplay } from '@/financial/components/MoneyDisplay';
import { PaymentStatusBadge } from './PaymentStatusBadge';

export interface BillingSummaryCardProps {
  grandTotal: number;
  amountDue: number;
  dueDate: string;
  status: string;
}

export function BillingSummaryCard({ grandTotal, amountDue, dueDate, status }: BillingSummaryCardProps) {
  const isOverdue = status === 'OVERDUE' || (new Date(dueDate) < new Date() && status !== 'PAID');

  return (
    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Billing Summary</span>
        <PaymentStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[11px] text-slate-500 block">Total Invoiced Amount</span>
          <MoneyDisplay amount={grandTotal} size="md" />
        </div>
        <div>
          <span className="text-[11px] text-slate-500 block">Current Balance Due</span>
          <MoneyDisplay amount={amountDue} size="md" variant={amountDue > 0 ? 'primary' : 'success'} />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-slate-500">Payment Due Date:</span>
        <span className={`font-mono font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
          {new Date(dueDate).toLocaleDateString()} {isOverdue && '(Past Due)'}
        </span>
      </div>
    </div>
  );
}
