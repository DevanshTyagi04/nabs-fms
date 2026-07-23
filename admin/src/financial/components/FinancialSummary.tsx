'use client';

import React from 'react';
import { TotalsBreakdown } from '../core/types';
import { MoneyDisplay } from './MoneyDisplay';

export interface FinancialSummaryProps {
  totals: TotalsBreakdown;
  title?: string;
}

export function FinancialSummary({ totals, title = 'Quotation & Pricing Breakdown' }: FinancialSummaryProps) {
  return (
    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2">
        {title}
      </h4>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
        <MoneyDisplay amount={totals.subtotal} size="sm" />
      </div>

      {totals.discountTotal > 0 && (
        <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-medium">
          <span>Discount Savings</span>
          <span>-{totals.formattedDiscountTotal}</span>
        </div>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-600 dark:text-slate-400">Estimated Taxes (GST/HST)</span>
        <MoneyDisplay amount={totals.taxTotal} size="sm" />
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Grand Total</span>
        <MoneyDisplay amount={totals.grandTotal} size="lg" variant="primary" />
      </div>
    </div>
  );
}
