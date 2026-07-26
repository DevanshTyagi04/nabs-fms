'use client';

import React from 'react';
import { MetadataGrid } from './metadata-grid';
import { ServiceRequestDetail } from '@/lib/types/service-requests.types';

interface SummaryProps {
  request: ServiceRequestDetail;
}

export function Summary({ request }: SummaryProps) {
  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs">
      <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC] flex justify-between items-center">
        <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
          Request Summary
        </h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#0b1c30] tracking-tight">{request.title}</h3>
          <div className="bg-[#eff4ff]/60 p-4 rounded-lg border border-[#c6c6cd]">
            <p className="text-sm text-[#45464d] leading-relaxed whitespace-pre-line">
              {request.description}
            </p>
          </div>
        </div>

        <MetadataGrid request={request} />
      </div>
    </div>
  );
}
