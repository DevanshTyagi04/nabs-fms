'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';
import { TopHeader } from '@/components/dashboard/top-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useSurveyDetails, useSurveyVersions } from '@/hooks/use-survey-details';
import { SurveyDetailsHeader } from '@/components/survey-details/survey-details-header';
import { SurveySummaryBanner } from '@/components/survey-details/survey-summary-banner';
import { VersionHistoryBar } from '@/components/survey-details/version-history-bar';
import { InspectionFindings } from '@/components/survey-details/inspection-findings';
import { SurveyAttachments } from '@/components/survey-details/survey-attachments';
import { SurveyLifecycleSidebar } from '@/components/survey-details/survey-lifecycle-sidebar';
import { ReviewSurveyModal } from '@/components/survey-details/review-survey-modal';
import { SurveyDetailsSkeleton } from '@/components/survey-details/survey-details-skeleton';
import { InternalNotes } from '@/components/service-request-details/internal-notes';
import { TableErrorState } from '@/components/table/table-error-state';
import { surveysApi } from '@/lib/surveys-api';
import { Star, ShieldCheck, User, Phone, ExternalLink } from 'lucide-react';

export default function TechnicalSurveyDetailsPage() {
  const params = useParams();
  const surveyId = (params?.id as string) || '';
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // 1. Primary Survey Data
  const { survey, isLoading, isError, errorMessage, refetch } = useSurveyDetails(surveyId);

  // 2. Parallel Secondary Survey Versions (only enabled when serviceRequestId is available)
  const { versions, isLoadingVersions, refetchVersions } = useSurveyVersions(
    survey?.serviceRequestId,
    !!survey?.serviceRequestId
  );

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewDecision, setReviewDecision] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [isPostingNote, setIsPostingNote] = useState<boolean>(false);

  // Ref for notes scrolling
  const notesRef = useRef<HTMLDivElement>(null);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Open Review Modal with initial decision
  const handleOpenReviewModal = (decision: 'APPROVED' | 'REJECTED') => {
    setReviewDecision(decision);
    setIsReviewModalOpen(true);
  };

  // Action: Review Survey (Approve or Reject) + Targeted Query Invalidation
  const handleConfirmReview = async (decision: 'APPROVED' | 'REJECTED', remarks?: string) => {
    if (!survey) return;
    await surveysApi.reviewSurvey(survey.id, decision, remarks);
    // Invalidate and refetch survey details and version history
    await Promise.all([refetch(), refetchVersions()]);
  };

  // Action: Add Internal Comment + Targeted Query Invalidation
  const handleAddNote = async (comment: string) => {
    if (!survey) return;
    setIsPostingNote(true);
    try {
      await surveysApi.addSurveyComment(survey.id, comment);
      await refetch();
    } finally {
      setIsPostingNote(false);
    }
  };

  const handleFocusNotes = () => {
    if (notesRef.current) {
      notesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (authLoading || (isLoading && !survey && !isError)) {
    return <SurveyDetailsSkeleton />;
  }

  if (isError || !survey) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <TopHeader />
        <div className="flex min-h-screen pt-14">
          <Sidebar />
          <main className="lg:ml-60 flex-1 p-6 max-w-7xl mx-auto w-full">
            <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
              <TableErrorState
                message={errorMessage || 'Technical survey ticket not found or failed to load.'}
                onRetry={refetch}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const sr = survey.serviceRequest;
  const customer = sr?.customer;
  const vendor = survey.vendor;

  const customerName = customer
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Valued Customer'
    : 'N/A';

  const vendorName = vendor?.businessName || 'Unassigned';
  const vendorRating =
    typeof vendor?.averageRating === 'number'
      ? vendor.averageRating.toFixed(1)
      : vendor?.averageRating || '4.8';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* App Shell Top Header */}
      <TopHeader />

      <div className="flex min-h-screen pt-14">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Workspace */}
        <div className="lg:ml-60 flex-1 flex flex-col min-w-0">
          {/* Sticky Sub-Header */}
          <SurveyDetailsHeader
            survey={survey}
            onOpenReviewModal={handleOpenReviewModal}
            onFocusNotes={handleFocusNotes}
          />

          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Main Content Column (8 cols on lg) */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* 1. Survey Summary Banner */}
                <SurveySummaryBanner survey={survey} />

                {/* 2. Version History Bar */}
                <VersionHistoryBar
                  versions={versions}
                  currentSurveyId={survey.id}
                  currentVersion={survey.version}
                  isLoading={isLoadingVersions}
                />

                {/* 3. Inspection Findings */}
                <InspectionFindings items={survey.items} />

                {/* 4. Attachments */}
                <SurveyAttachments attachments={survey.attachments} items={survey.items} />

                {/* 5. Internal Notes */}
                <div ref={notesRef}>
                  <InternalNotes
                    comments={survey.comments as any[]}
                    onAddNote={handleAddNote}
                    isSubmitting={isPostingNote}
                  />
                </div>
              </div>

              {/* Right Sidebar Column (4 cols on lg) */}
              <div className="col-span-12 lg:col-span-4 sticky top-36 space-y-6">
                {/* 1. Survey Lifecycle */}
                <SurveyLifecycleSidebar survey={survey} />

                {/* 2. Customer Profile Card */}
                <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0b1c30] mb-3">
                    Customer Profile
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-[#d3e4fe] flex items-center justify-center text-[#0b1c30] font-bold text-xs">
                      {customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#0b1c30] truncate">{customerName}</p>
                      <p className="text-[10px] text-[#76777d] truncate">
                        {customer?.companyName || 'Individual Account'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-[#45464d] pt-2 border-t border-[#c6c6cd]">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#76777d]">Point of Contact</span>
                      <span className="font-semibold text-[#0b1c30] truncate max-w-[140px]">
                        {customerName}
                      </span>
                    </div>
                    {customer?.user?.phone && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#76777d]">Phone</span>
                        <span className="font-mono text-[#0b1c30]">{customer.user.phone}</span>
                      </div>
                    )}
                    {customer?.user?.email && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#76777d]">Email</span>
                        <span className="truncate text-[#0b1c30] max-w-[140px]">
                          {customer.user.email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Vendor Details Card */}
                <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0b1c30] mb-3">
                    Vendor Details
                  </h3>
                  {vendor ? (
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-[#c9e6ff] flex items-center justify-center text-[#001e2f] font-bold text-xs">
                          {vendorName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#0b1c30] truncate">{vendorName}</p>
                          <p className="text-[10px] text-[#76777d] truncate">
                            {vendor.companyName || vendorName}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs text-[#45464d] pt-2 border-t border-[#c6c6cd]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                          <span className="text-[11px]">Verified Service Provider</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
                          <span className="text-[11px] font-bold">{vendorRating} Rating</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#76777d] italic">No vendor assigned yet.</p>
                  )}
                </div>

                {/* 4. Linked Service Request Card */}
                {sr && (
                  <div className="bg-[#131b2e] text-white rounded-xl p-5 shadow-xs">
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#7c839b] mb-2">
                      Linked Service Request
                    </h3>
                    <p className="text-lg font-bold font-mono mb-1">{sr.ticketNumber}</p>
                    <p className="text-xs text-[#bec6e0] mb-4 line-clamp-2 leading-relaxed">
                      "{sr.title}"
                    </p>
                    <Link
                      href={`/service-requests/${survey.serviceRequestId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:underline"
                    >
                      <span>View Full Service Request</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Approve / Reject Review Dialog Modal */}
      <ReviewSurveyModal
        isOpen={isReviewModalOpen}
        initialDecision={reviewDecision}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirmReview={handleConfirmReview}
      />
    </div>
  );
}
