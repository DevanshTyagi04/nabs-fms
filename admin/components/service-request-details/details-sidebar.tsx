'use client';

import React from 'react';
import { Mail, Printer, MessageSquarePlus, AlertOctagon, MapPin, Phone, Star, ShieldCheck, User } from 'lucide-react';
import { ServiceRequestDetail } from '@/lib/types/service-requests.types';

interface DetailsSidebarProps {
  request: ServiceRequestDetail;
  onOpenAssignModal: () => void;
  onOpenStatusModal: () => void;
  onFocusNotes?: () => void;
}

export function DetailsSidebar({
  request,
  onOpenAssignModal,
  onOpenStatusModal,
  onFocusNotes,
}: DetailsSidebarProps) {
  const customer = request.customer;
  const vendor = request.assignedVendor;
  const address = request.address;

  const customerName = customer
    ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Valued Customer'
    : 'N/A';
  const customerPhone = customer?.user?.phone || 'N/A';

  const fullAddress = address
    ? [address.addressLine1, address.city, address.state].filter(Boolean).join(', ')
    : 'N/A';

  const vendorName = vendor?.businessName || 'Unassigned';
  const vendorRating = typeof vendor?.averageRating === 'number' ? vendor.averageRating.toFixed(1) : vendor?.averageRating || '4.8';

  const formattedPhase = request.status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <aside className="space-y-4">
      {/* 1. Current Status Card */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0b1c30]">
            Current Status
          </h3>
          <span className="font-mono text-[10px] font-bold text-[#006591] bg-[#e5eeff] px-2 py-0.5 rounded">
            LIVE
          </span>
        </div>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center border-b border-[#c6c6cd] pb-2">
            <span className="text-[#45464d]">Primary Phase</span>
            <span className="font-bold text-[#0b1c30]">{formattedPhase}</span>
          </div>
          <div className="flex justify-between items-center border-b border-[#c6c6cd] pb-2">
            <span className="text-[#45464d]">Request Version</span>
            <span className="font-mono font-bold text-[#0b1c30]">v{request.version}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#45464d]">Request Source</span>
            <span className="font-bold text-[#0b1c30]">{request.source || 'ONE_TIME'}</span>
          </div>
        </div>
      </div>

      {/* 2. Customer Snapshot Card */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0b1c30] mb-3">
          Customer Snapshot
        </h3>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#d3e4fe] flex items-center justify-center text-[#0b1c30] font-bold text-xs">
            {customerName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#0b1c30] truncate">{customerName}</p>
            {customer?.companyName && (
              <p className="text-[10px] text-[#76777d] truncate">{customer.companyName}</p>
            )}
          </div>
        </div>
        <div className="space-y-2 text-xs text-[#45464d] pt-2 border-t border-[#c6c6cd]">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#76777d] shrink-0" />
            <span className="text-[11px] truncate">{fullAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#76777d] shrink-0" />
            <span className="text-[11px] font-mono">{customerPhone}</span>
          </div>
        </div>
      </div>

      {/* 3. Vendor Snapshot Card */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0b1c30]">
            Vendor Snapshot
          </h3>
          <button onClick={onOpenAssignModal} className="text-[11px] font-bold text-[#006591] hover:underline">
            {vendor ? 'Reassign' : 'Assign'}
          </button>
        </div>
        {vendor ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#c9e6ff] flex items-center justify-center text-[#001e2f] font-bold text-xs">
                {vendorName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0b1c30] truncate">{vendorName}</p>
                <p className="text-[10px] text-[#76777d] truncate">{vendor.companyName || vendorName}</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-[#45464d] pt-2 border-t border-[#c6c6cd]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                <span className="text-[11px]">Verified Provider</span>
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

      {/* 4. Quick Actions Grid */}
      <div className="bg-white border border-[#c6c6cd] rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-[#0b1c30] mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {customer?.user?.email && (
            <a
              href={`mailto:${customer.user.email}`}
              className="p-3 border border-[#c6c6cd] rounded-lg hover:bg-slate-50 transition-colors flex flex-col items-center gap-1 text-center"
            >
              <Mail className="w-4 h-4 text-[#45464d]" />
              <span className="text-[11px] font-semibold text-[#0b1c30]">Email</span>
            </a>
          )}
          <button
            onClick={handlePrint}
            className="p-3 border border-[#c6c6cd] rounded-lg hover:bg-slate-50 transition-colors flex flex-col items-center gap-1 text-center"
          >
            <Printer className="w-4 h-4 text-[#45464d]" />
            <span className="text-[11px] font-semibold text-[#0b1c30]">Print SR</span>
          </button>
          {onFocusNotes && (
            <button
              onClick={onFocusNotes}
              className="p-3 border border-[#c6c6cd] rounded-lg hover:bg-slate-50 transition-colors flex flex-col items-center gap-1 text-center"
            >
              <MessageSquarePlus className="w-4 h-4 text-[#45464d]" />
              <span className="text-[11px] font-semibold text-[#0b1c30]">Add Note</span>
            </button>
          )}
          <button
            onClick={onOpenStatusModal}
            className="p-3 border border-[#c6c6cd] rounded-lg hover:bg-slate-50 transition-colors flex flex-col items-center gap-1 text-center"
          >
            <AlertOctagon className="w-4 h-4 text-[#45464d]" />
            <span className="text-[11px] font-semibold text-[#0b1c30]">Status</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
