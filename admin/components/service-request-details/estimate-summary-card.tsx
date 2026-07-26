'use client';

import React from 'react';
import { Calculator } from 'lucide-react';
import { EstimateSummary } from '@/lib/types/service-requests.types';

interface EstimateSummaryCardProps {
  estimate?: EstimateSummary | null;
  isLoading?: boolean;
}

export function EstimateSummaryCard({ estimate, isLoading = false }: EstimateSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl p-5 flex flex-col min-h-[160px] animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex flex-col min-h-[180px]">
        <div className="px-4 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
          <h4 className="text-xs font-bold text-[#0b1c30]">Estimate</h4>
          <span className="px-2 py-0.5 bg-slate-200 text-[#45464d] text-[10px] rounded uppercase font-bold tracking-wider">
            NOT CREATED
          </span>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-center text-center">
          <p className="text-xs text-[#76777d] italic">
            No price estimate quotation has been generated for this request yet.
          </p>
        </div>
      </div>
    );
  }

  const totalAmount = typeof estimate.totalAmount === 'number' ? estimate.totalAmount : parseFloat(estimate.totalAmount) || 0;

  return (
    <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex flex-col min-h-[180px]">
      <div className="px-4 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
        <h4 className="text-xs font-bold text-[#0b1c30]">Estimate</h4>
        <span
          className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold tracking-wider ${
            estimate.status === 'APPROVED'
              ? 'bg-[#10B981] text-white'
              : estimate.status === 'PENDING_APPROVAL'
              ? 'bg-[#F59E0B] text-white'
              : 'bg-slate-200 text-[#45464d]'
          }`}
        >
          {estimate.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="p-5 flex-1 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#45464d]">Total Amount</span>
          <span className="font-bold text-[#0b1c30] text-sm">₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#45464d]">Includes GST</span>
          <span className="text-[#0b1c30]">18% GST Included</span>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-[#c6c6cd] bg-white flex justify-between items-center">
        <span className="text-xs font-bold text-[#006591]">Estimate Logged</span>
      </div>
    </div>
  );
}
