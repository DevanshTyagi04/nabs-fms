'use client';

import React from 'react';
import { WorkOrderSummary } from '@/lib/types/service-requests.types';

interface WorkOrderSummaryCardProps {
  workOrder?: WorkOrderSummary | null;
  isLoading?: boolean;
}

export function WorkOrderSummaryCard({ workOrder, isLoading = false }: WorkOrderSummaryCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl p-5 flex flex-col min-h-[160px] animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex flex-col min-h-[180px]">
        <div className="px-4 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
          <h4 className="text-xs font-bold text-[#0b1c30]">Work Order</h4>
          <span className="px-2 py-0.5 bg-slate-200 text-[#45464d] text-[10px] rounded uppercase font-bold tracking-wider">
            NOT STARTED
          </span>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-center text-center">
          <p className="text-xs text-[#76777d] italic">
            Next Step: Approve the estimate before generating a Work Order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex flex-col min-h-[180px]">
      <div className="px-4 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
        <h4 className="text-xs font-bold text-[#0b1c30]">Work Order</h4>
        <span
          className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold tracking-wider ${
            workOrder.status === 'COMPLETED'
              ? 'bg-[#10B981] text-white'
              : workOrder.status === 'IN_PROGRESS' || workOrder.status === 'SCHEDULED'
              ? 'bg-[#006591] text-white'
              : 'bg-slate-200 text-[#45464d]'
          }`}
        >
          {workOrder.status}
        </span>
      </div>

      <div className="p-5 flex-1 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#45464d]">WO Number</span>
          <span className="font-bold text-[#0b1c30] font-mono">{workOrder.workOrderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#45464d]">Scheduled Start</span>
          <span className="text-[#0b1c30] font-mono">
            {new Date(workOrder.scheduledStart).toLocaleDateString('en-IN')}
          </span>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-[#c6c6cd] bg-white flex justify-between items-center">
        <span className="text-xs font-bold text-[#006591]">Work Order Active</span>
      </div>
    </div>
  );
}
