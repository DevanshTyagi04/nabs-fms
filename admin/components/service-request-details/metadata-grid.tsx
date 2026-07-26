'use client';

import React from 'react';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { ServiceRequestDetail } from '@/lib/types/service-requests.types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MetadataGridProps {
  request: ServiceRequestDetail;
}

export function MetadataGrid({ request }: MetadataGridProps) {
  const createdDate = new Date(request.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const updatedDate = new Date(request.updatedAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const preferredDate = request.preferredDate
    ? new Date(request.preferredDate).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Not Specified';

  // Format readable current phase
  const formattedPhase = request.status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Derive SLA Status cleanly
  const isUrgent = request.priority === 'URGENT' || request.priority === 'HIGH';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#c6c6cd]">
      <div className="space-y-1">
        <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">Service Category</p>
        <p className="text-xs font-bold text-[#0b1c30]">{request.serviceCategory?.name || 'General'}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">Priority</p>
        <div>
          <PriorityBadge priority={request.priority} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">Current Phase</p>
        <p className="text-xs font-bold text-[#0b1c30]">{formattedPhase}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">Service Source</p>
        <p className="text-xs font-bold text-[#0b1c30]">{request.source || 'ONE_TIME'}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">Preferred Visit Date</p>
        <p className="text-xs font-medium text-[#0b1c30] font-mono">{preferredDate}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">Created On</p>
        <p className="text-xs font-medium text-[#0b1c30] font-mono">{createdDate}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">Last Updated</p>
        <p className="text-xs font-medium text-[#0b1c30] font-mono">{updatedDate}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-mono text-[#76777d] uppercase tracking-wider font-bold">SLA Status</p>
        {isUrgent ? (
          <div className="flex items-center gap-1 text-[#F59E0B]">
            <AlertTriangle className="w-3.5 h-3.5" />
            <p className="text-xs font-bold">High Priority SLA</p>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[#10B981]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <p className="text-xs font-bold">Within Normal SLA</p>
          </div>
        )}
      </div>
    </div>
  );
}
