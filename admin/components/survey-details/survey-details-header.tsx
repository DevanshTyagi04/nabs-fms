'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, MessageSquare, Check, X, ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { SurveyDetail } from '@/lib/types/surveys.types';
interface SurveyDetailsHeaderProps {
  survey: SurveyDetail;
  onOpenReviewModal: (decision: 'APPROVED' | 'REJECTED') => void;
  onFocusNotes?: () => void;
}
export function SurveyDetailsHeader({
  survey,
  onOpenReviewModal,
  onFocusNotes,
}: SurveyDetailsHeaderProps) {
  const isSubmitted = survey.status === 'SUBMITTED';
  const sr = survey.serviceRequest;
  const surveyNumber = `TS-${String(survey.id).slice(0, 8).toUpperCase()}`;
  return (
    <div className="sticky top-14 z-40 bg-white border-b border-[#c6c6cd] px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex flex-col min-w-0">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-1.5 text-xs text-[#76777d] mb-1 overflow-x-auto whitespace-nowrap">
          <Link href="/technical-surveys" className="hover:underline text-[#45464d] font-medium">
            Technical Surveys
          </Link>
          <ChevronRight className="w-3 h-3 text-[#76777d] shrink-0" />
          <span className="text-[#0b1c30] font-semibold truncate">{surveyNumber}</span>
        </div>
        {/* Survey Identifier & Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/technical-surveys"
            className="p-1 hover:bg-slate-100 rounded-lg text-[#0b1c30] transition-colors md:hidden"
            title="Back to Surveys List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-lg md:text-xl font-bold text-[#0b1c30] tracking-tight font-mono">
            {surveyNumber}
          </h1>
          <span className="font-mono text-[10px] font-bold text-[#45464d] bg-[#e5eeff] px-2 py-0.5 rounded">
            V{survey.version}
          </span>
          <StatusBadge status={survey.status} />
          {sr && (
            <>
              <div className="h-4 w-px bg-[#c6c6cd] mx-1 hidden sm:block"></div>
              <Link
                href={`/service-requests/${survey.serviceRequestId}`}
                className="text-[#006591] text-xs font-semibold hover:underline flex items-center gap-1 shrink-0"
              >
                <span>{sr.ticketNumber}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {onFocusNotes && (
          <button
            onClick={onFocusNotes}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#c6c6cd] text-[#0b1c30] text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#45464d]" />
            <span>Add Internal Note</span>
          </button>
        )}
        {isSubmitted && (
          <>
            <button
              onClick={() => onOpenReviewModal('REJECTED')}
              className="flex items-center gap-1.5 px-3.5 py-2 border border-red-300 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => onOpenReviewModal('APPROVED')}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#000000] text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity active:scale-95 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}