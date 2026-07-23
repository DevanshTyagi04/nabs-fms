'use client';

import React from 'react';
import { FinancialLineItem } from '../core/types';
import { MoneyDisplay } from './MoneyDisplay';

export interface LineItemTableProps {
  items: FinancialLineItem[];
}

export function LineItemTable({ items }: LineItemTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-3 py-2">Item & Description</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Unit Price</th>
            <th className="px-3 py-2 text-right">Tax Rate</th>
            <th className="px-3 py-2 text-right">Line Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">{item.description}</td>
              <td className="px-3 py-2 text-right font-mono">{item.quantity}</td>
              <td className="px-3 py-2 text-right font-mono"><MoneyDisplay amount={item.unitPrice} size="sm" /></td>
              <td className="px-3 py-2 text-right font-mono text-slate-500">{item.taxRate || 0}%</td>
              <td className="px-3 py-2 text-right font-mono"><MoneyDisplay amount={item.total || item.quantity * item.unitPrice} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
