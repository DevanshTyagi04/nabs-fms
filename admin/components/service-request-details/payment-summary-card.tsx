'use client';

import React from 'react';
import { InvoiceSummary, PaymentSummary } from '@/lib/types/service-requests.types';

interface PaymentSummaryCardProps {
  payment?: PaymentSummary | null;
  invoice?: InvoiceSummary | null;
  isLoading?: boolean;
}

export function PaymentSummaryCard({ payment, invoice, isLoading = false }: PaymentSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl p-5 flex flex-col min-h-[160px] animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex flex-col min-h-[180px]">
        <div className="px-4 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
          <h4 className="text-xs font-bold text-[#0b1c30]">Payments &amp; Invoice</h4>
          <span className="px-2 py-0.5 bg-slate-200 text-[#45464d] text-[10px] rounded uppercase font-bold tracking-wider">
            PENDING
          </span>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-center text-center">
          <p className="text-xs text-[#76777d] italic">
            Waiting for work completion before financial processing begins.
          </p>
        </div>
      </div>
    );
  }

  const payAmount = typeof payment.amount === 'number' ? payment.amount : parseFloat(payment.amount) || 0;

  return (
    <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex flex-col min-h-[180px]">
      <div className="px-4 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
        <h4 className="text-xs font-bold text-[#0b1c30]">Payments &amp; Invoice</h4>
        <span
          className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold tracking-wider ${
            payment.status === 'SUCCESS' || invoice?.status === 'PAID'
              ? 'bg-[#10B981] text-white'
              : payment.status === 'FAILED'
              ? 'bg-red-600 text-white'
              : 'bg-[#006591] text-white'
          }`}
        >
          {invoice ? `INVOICE ${invoice.status}` : payment.status}
        </span>
      </div>

      <div className="p-5 flex-1 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#45464d]">Payment #</span>
          <span className="font-bold text-[#0b1c30] font-mono">{payment.paymentNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#45464d]">Paid Amount</span>
          <span className="font-bold text-[#0b1c30] text-sm">₹{payAmount.toLocaleString('en-IN')}</span>
        </div>
        {invoice && (
          <div className="flex justify-between">
            <span className="text-[#45464d]">Invoice #</span>
            <span className="font-bold text-[#006591] font-mono">{invoice.invoiceNumber}</span>
          </div>
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-[#c6c6cd] bg-white flex justify-between items-center">
        <span className="text-xs font-bold text-[#006591]">Financial Record Settled</span>
      </div>
    </div>
  );
}
