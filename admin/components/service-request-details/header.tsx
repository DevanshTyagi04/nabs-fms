'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, UserPlus, SlidersHorizontal, MoreVertical } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { ServiceRequestDetail } from '@/lib/types/service-requests.types';

interface HeaderProps {
  request: ServiceRequestDetail;
  onOpenAssignModal: () => void;
  onOpenStatusModal: () => void;
  onExport?: () => void;
}

export function Header({ request, onOpenAssignModal, onOpenStatusModal, onExport }: HeaderProps) {
  const createdDateStr = new Date(request.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const updatedDateStr = new Date(request.updatedAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const isAssigned = !!request.assignedVendor;

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-[#c6c6cd] flex justify-between items-center px-4 md:px-8 h-16 shadow-xs">
      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
        <Link
          href="/service-requests"
          className="p-2 hover:bg-slate-100 transition-colors rounded-lg text-[#0b1c30] shrink-0"
          title="Back to Service Requests"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg md:text-xl font-bold text-[#0b1c30] tracking-tight truncate max-w-md">
              {request.title}
            </h1>
            <span className="font-mono text-xs text-[#45464d] px-2 py-0.5 bg-[#e5eeff] rounded font-bold shrink-0">
              {request.ticketNumber}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
            {request.serviceCategory?.name && (
              <span className="font-semibold px-2 py-0.5 bg-[#c9e6ff] text-[#001e2f] rounded uppercase text-[10px] tracking-wider shrink-0">
                {request.serviceCategory.name}
              </span>
            )}
            <PriorityBadge priority={request.priority} />
            <StatusBadge status={request.status} />

            <span className="font-mono text-[11px] text-[#76777d] ml-1 hidden lg:inline truncate">
              Created: {createdDateStr} • Updated: {updatedDateStr}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onExport && (
          <button
            onClick={onExport}
            className="hidden sm:flex text-xs font-semibold text-[#45464d] items-center gap-1.5 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors border border-[#c6c6cd]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        )}

        <button
          onClick={onOpenAssignModal}
          className="text-xs font-semibold bg-[#000000] text-white px-3.5 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity active:scale-95 shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{isAssigned ? 'Reassign Vendor' : 'Assign Vendor'}</span>
        </button>

        <button
          onClick={onOpenStatusModal}
          className="text-xs font-semibold border border-[#c6c6cd] text-[#0b1c30] px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 active:scale-95"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#45464d]" />
          <span className="hidden sm:inline">Change Status</span>
        </button>

        <button className="p-2 hover:bg-slate-100 text-[#45464d] rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
