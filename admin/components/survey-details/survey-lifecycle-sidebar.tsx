'use client';

import React from 'react';
import { Check, Clock, Lock } from 'lucide-react';
import { SurveyDetail } from '@/lib/types/surveys.types';

interface SurveyLifecycleSidebarProps {
  survey: SurveyDetail;
}

export function SurveyLifecycleSidebar({ survey }: SurveyLifecycleSidebarProps) {
  const isApproved = survey.status === 'APPROVED';
  const isRejected = survey.status === 'REJECTED';
  const isSubmitted = survey.status === 'SUBMITTED';

  const createdDateStr = new Date(survey.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const startedDateStr = survey.startedAt
    ? new Date(survey.startedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : survey.createdAt
    ? createdDateStr
    : 'N/A';

  const submittedDateStr = survey.submittedAt
    ? new Date(survey.submittedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Pending Submission';

  const approvedDateStr = survey.approvedAt
    ? new Date(survey.approvedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : isApproved
    ? 'Approved'
    : isRejected
    ? 'Rejected'
    : 'Awaiting Decision';

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0b1c30]">
          Survey Lifecycle
        </h3>
        <span className="font-mono text-[10px] font-bold text-[#006591] bg-[#e5eeff] px-2 py-0.5 rounded">
          LIVE
        </span>
      </div>

      <div className="space-y-4 relative pl-1">
        {/* Background vertical connector line */}
        <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-[#c6c6cd] z-0" />

        {/* Step 1: Created */}
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0b1c30]">Created</p>
            <p className="text-[11px] font-mono text-[#76777d]">{createdDateStr}</p>
          </div>
        </div>

        {/* Step 2: In Progress */}
        <div className="flex items-start gap-3 relative z-10">
          <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0b1c30]">In Progress</p>
            <p className="text-[11px] font-mono text-[#76777d]">{startedDateStr}</p>
          </div>
        </div>

        {/* Step 3: Submitted */}
        <div className="flex items-start gap-3 relative z-10">
          {isSubmitted ? (
            <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-white flex items-center justify-center shrink-0 ring-4 ring-[#F59E0B]/20 shadow-2xs">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
            </div>
          ) : isApproved || isRejected ? (
            <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-200 text-[#76777d] flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <div>
            <p
              className={`text-xs font-bold ${
                isSubmitted ? 'text-[#F59E0B]' : 'text-[#0b1c30]'
              }`}
            >
              Submitted {isSubmitted ? '(Current)' : ''}
            </p>
            <p className="text-[11px] font-mono text-[#76777d]">{submittedDateStr}</p>
          </div>
        </div>

        {/* Step 4: Finalized */}
        <div className="flex items-start gap-3 relative z-10">
          {isApproved ? (
            <div className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Check className="w-3.5 h-3.5" />
            </div>
          ) : isRejected ? (
            <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <span className="text-[10px] font-bold">✕</span>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-200 text-[#76777d] flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-[#0b1c30]">
              {isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Finalized'}
            </p>
            <p className="text-[11px] font-mono text-[#76777d]">{approvedDateStr}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
