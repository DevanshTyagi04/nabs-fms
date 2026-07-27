'use client';

import React from 'react';
import Link from 'next/link';
import { Star, ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { SurveyDetail } from '@/lib/types/surveys.types';

interface SurveySummaryBannerProps {
  survey: SurveyDetail;
}

export function SurveySummaryBanner({ survey }: SurveySummaryBannerProps) {
  const sr = survey.serviceRequest;
  const customer = sr?.customer;
  const vendor = survey.vendor;

  const customerName = customer
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'
    : 'N/A';

  const vendorName = vendor?.businessName || 'Unassigned';
  const vendorRating =
    typeof vendor?.averageRating === 'number'
      ? vendor.averageRating.toFixed(1)
      : vendor?.averageRating || '4.8';

  const submittedDateStr = survey.submittedAt
    ? new Date(survey.submittedAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Not Submitted';

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC]">
        <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
          Survey Summary
        </h2>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 1. Survey Info */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">
            Survey Info
          </p>
          <p className="text-xs font-bold text-[#0b1c30]">Version V{survey.version}</p>
          <p className="text-[12px] text-[#45464d]">Submitted: {submittedDateStr}</p>
        </div>

        {/* 2. Service Request */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">
            Service Request
          </p>
          {sr ? (
            <>
              <Link
                href={`/service-requests/${survey.serviceRequestId}`}
                className="text-xs font-bold text-[#006591] hover:underline inline-flex items-center gap-1"
              >
                <span>{sr.ticketNumber}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={sr.status} />
              </div>
            </>
          ) : (
            <p className="text-xs text-[#76777d]">N/A</p>
          )}
        </div>

        {/* 3. Customer */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">
            Customer
          </p>
          <p className="text-xs font-bold text-[#0b1c30] truncate">{customerName}</p>
          <p className="text-[12px] text-[#45464d] truncate">
            {customer?.companyName || 'Individual Customer'}
          </p>
        </div>

        {/* 4. Vendor */}
        <div className="space-y-1">
          <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">
            Vendor
          </p>
          <p className="text-xs font-bold text-[#0b1c30] truncate">{vendorName}</p>
          {vendor && (
            <div className="flex items-center text-[12px] text-[#F59E0B] font-bold gap-1">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B]" />
              <span>{vendorRating} Rating</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
