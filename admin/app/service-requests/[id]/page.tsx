'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { TopHeader } from '@/components/dashboard/top-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useServiceRequestDetails, useSecondaryRequestData } from '@/hooks/use-service-request-details';
import { Header } from '@/components/service-request-details/header';
import { Lifecycle } from '@/components/service-request-details/lifecycle';
import { Summary } from '@/components/service-request-details/summary';
import { Timeline } from '@/components/service-request-details/timeline';
import { CustomerCard } from '@/components/service-request-details/customer-card';
import { VendorCard } from '@/components/service-request-details/vendor-card';
import { SurveySummaryCard } from '@/components/service-request-details/survey-summary-card';
import { EstimateSummaryCard } from '@/components/service-request-details/estimate-summary-card';
import { WorkOrderSummaryCard } from '@/components/service-request-details/work-order-summary-card';
import { PaymentSummaryCard } from '@/components/service-request-details/payment-summary-card';
import { InternalNotes } from '@/components/service-request-details/internal-notes';
import { DetailsSidebar } from '@/components/service-request-details/details-sidebar';
import { AssignVendorModal } from '@/components/service-request-details/modals/assign-vendor-modal';
import { ChangeStatusModal } from '@/components/service-request-details/modals/change-status-modal';
import { serviceRequestsApi } from '@/lib/service-requests-api';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function ServiceRequestDetailsPage() {
  const params = useParams();
  const requestId = (params?.id as string) || '';
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // 1. Primary Request Data
  const { request, isLoading, isError, errorMessage, refetch: refetchMain } = useServiceRequestDetails(requestId);

  // 2. Parallel Secondary Data (only runs when primary request is loaded)
  const {
    surveys,
    loadingSurveys,
    estimates,
    loadingEstimates,
    workOrders,
    loadingWorkOrders,
    payments,
    invoices,
    loadingFinancials,
    timeline,
    loadingTimeline,
    vendors,
    loadingVendors,
    refetchTimeline,
  } = useSecondaryRequestData(requestId, !!request);

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);

  // Ref for notes section scrolling
  const notesRef = useRef<HTMLDivElement>(null);

  // Authentication protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Action: Assign / Reassign Vendor with targeted refetching
  const handleAssignVendor = async (vendorId: string, remarks?: string) => {
    if (!request) return;
    const isReassign = !!request.assignedVendor;
    if (isReassign) {
      await serviceRequestsApi.reassignVendor(request.id, vendorId, remarks);
    } else {
      await serviceRequestsApi.assignVendor(request.id, vendorId, remarks);
    }
    // Targeted query invalidation
    await Promise.all([refetchMain(), refetchTimeline()]);
  };

  // Action: Change Status with targeted refetching
  const handleChangeStatus = async (targetStatus: string, remarks?: string) => {
    if (!request) return;
    await serviceRequestsApi.changeStatus(request.id, targetStatus, remarks);
    // Targeted query invalidation
    await Promise.all([refetchMain(), refetchTimeline()]);
  };

  // Action: Add Internal Note with targeted refetching
  const handleAddNote = async (comment: string) => {
    if (!request) return;
    setIsAddingNote(true);
    try {
      await serviceRequestsApi.addInternalNote(request.id, comment);
      // Targeted query invalidation
      await Promise.all([refetchMain(), refetchTimeline()]);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleFocusNotes = () => {
    if (notesRef.current) {
      notesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (authLoading || (isLoading && !request && !isError)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <TopHeader />
        <div className="flex min-h-screen pt-14">
          <Sidebar />
          <main className="lg:ml-60 flex-1 p-6 max-w-7xl mx-auto w-full flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3 py-16">
              <RefreshCw className="w-8 h-8 text-[#006591] animate-spin" />
              <p className="text-xs font-semibold text-[#45464d]">
                Loading service request details...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isError || !request) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <TopHeader />
        <div className="flex min-h-screen pt-14">
          <Sidebar />
          <main className="lg:ml-60 flex-1 p-6 max-w-7xl mx-auto w-full">
            <div className="bg-white border border-[#c6c6cd] rounded-xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#0b1c30]">Service Request Not Found</h2>
              <p className="text-xs text-[#45464d] max-w-md mx-auto">
                {errorMessage || 'The requested service request ticket does not exist or failed to load.'}
              </p>
              <button
                onClick={refetchMain}
                className="px-4 py-2 bg-[#006591] text-white rounded-lg text-xs font-semibold hover:bg-[#005073] transition-colors"
              >
                Retry Request
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const primarySurvey = surveys.length > 0 ? surveys[0] : null;
  const primaryEstimate = estimates.length > 0 ? estimates[0] : null;
  const primaryWorkOrder = workOrders.length > 0 ? workOrders[0] : null;
  const primaryPayment = payments.length > 0 ? payments[0] : null;
  const primaryInvoice = invoices.length > 0 ? invoices[0] : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Fixed Sticky Header */}
      <Header
        request={request}
        onOpenAssignModal={() => setIsAssignModalOpen(true)}
        onOpenStatusModal={() => setIsStatusModalOpen(true)}
      />

      <div className="flex min-h-screen pt-16">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Workspace */}
        <main className="lg:ml-60 flex-1 pt-6 pb-16 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Lifecycle Progress Stepper */}
          <Lifecycle status={request.status} />

          <div className="grid grid-cols-12 gap-6 items-start">
            {/* Left Core Workspace (8 columns on large screens) */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* 1. Request Summary Card */}
              <Summary request={request} />

              {/* 2. Work Timeline */}
              <Timeline
                request={request}
                activityItems={timeline}
                isLoading={loadingTimeline}
              />

              {/* 3. Customer & Vendor Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomerCard request={request} />
                <VendorCard
                  request={request}
                  onOpenAssignModal={() => setIsAssignModalOpen(true)}
                />
              </div>

              {/* 4. Related Modules Summary Cards */}
              <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
                <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC]">
                  <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
                    Related Modules
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                  <SurveySummaryCard survey={primarySurvey} isLoading={loadingSurveys} />
                  <EstimateSummaryCard estimate={primaryEstimate} isLoading={loadingEstimates} />
                  <WorkOrderSummaryCard workOrder={primaryWorkOrder} isLoading={loadingWorkOrders} />
                  <PaymentSummaryCard
                    payment={primaryPayment}
                    invoice={primaryInvoice}
                    isLoading={loadingFinancials}
                  />
                </div>
              </div>

              {/* 5. Internal Notes */}
              <div ref={notesRef}>
                <InternalNotes
                  comments={request.comments}
                  onAddNote={handleAddNote}
                  isSubmitting={isAddingNote}
                />
              </div>
            </div>

            {/* Right Desktop Sidebar (4 columns on large screens) */}
            <div className="col-span-12 lg:col-span-4 sticky top-20">
              <DetailsSidebar
                request={request}
                onOpenAssignModal={() => setIsAssignModalOpen(true)}
                onOpenStatusModal={() => setIsStatusModalOpen(true)}
                onFocusNotes={handleFocusNotes}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Assign / Reassign Vendor Modal */}
      <AssignVendorModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssign={handleAssignVendor}
        vendors={vendors}
        currentVendorId={request.assignedVendor?.id}
        isLoadingVendors={loadingVendors}
      />

      {/* Change Status Modal */}
      <ChangeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onChangeStatus={handleChangeStatus}
        currentStatus={request.status}
      />
    </div>
  );
}
