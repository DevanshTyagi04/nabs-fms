'use client';

import React from 'react';
import { ClipboardList, ArrowUpRight } from 'lucide-react';
import { SurveySummary } from '@/lib/types/service-requests.types';

interface SurveySummaryCardProps {
  survey?: SurveySummary | null;
  isLoading?: boolean;
  onReview?: () => void;
}

export function SurveySummaryCard({ survey, isLoading = false, onReview }: SurveySummaryCardProps) {
  if (isLoading) {
    return (
      <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl p-5 flex flex-col min-h-[160px] animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4" />
        <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-1/2" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex flex-col min-h-[180px]">
        <div className="px-4 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
          <h4 className="text-xs font-bold text-[#0b1c30]">Technical Survey</h4>
          <span className="px-2 py-0.5 bg-slate-200 text-[#45464d] text-[10px] rounded uppercase font-bold tracking-wider">
            NOT CREATED
          </span>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-center text-center">
          <p className="text-xs text-[#76777d] italic">
            No technical site survey has been conducted for this request yet.
          </p>
        </div>
      </div>
    );
  }

  const itemsCount = survey.items?.length || 0;
  const photosCount = survey.attachments?.length || 0;

  return (
    <div className="bg-[#F8FAFC] border border-[#c6c6cd] rounded-xl flex flex-col min-h-[180px]">
      <div className="px-4 py-3 border-b border-[#c6c6cd] flex justify-between items-center bg-white">
        <h4 className="text-xs font-bold text-[#0b1c30]">Technical Survey</h4>
        <span
          className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold tracking-wider ${
            survey.status === 'APPROVED'
              ? 'bg-[#10B981] text-white'
              : survey.status === 'SUBMITTED'
              ? 'bg-[#F59E0B] text-white'
              : 'bg-slate-200 text-[#45464d]'
          }`}
        >
          {survey.status}
        </span>
      </div>

      <div className="p-5 flex-1 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#45464d]">Inspection Items</span>
          <span className="font-bold text-[#0b1c30]">{itemsCount} Items</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#45464d]">Photos Attached</span>
          <span className="font-bold text-[#0b1c30]">{photosCount}</span>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-[#c6c6cd] bg-white flex justify-between items-center">
        {survey.status === 'SUBMITTED' && onReview ? (
          <button onClick={onReview} className="text-xs font-bold text-[#006591] hover:underline">
            Review Survey
          </button>
        ) : (
          <span className="text-xs font-bold text-[#006591] flex items-center gap-1">
            <span>Survey Logged</span>
          </span>
        )}
      </div>
    </div>
  );
}
