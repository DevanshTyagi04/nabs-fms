'use client';

import React from 'react';
import { UserCheck, Star, ShieldCheck, UserPlus, Phone } from 'lucide-react';
import { ServiceRequestDetail } from '@/lib/types/service-requests.types';

interface VendorCardProps {
  request: ServiceRequestDetail;
  onOpenAssignModal: () => void;
}

export function VendorCard({ request, onOpenAssignModal }: VendorCardProps) {
  const vendor = request.assignedVendor;

  if (!vendor) {
    return (
      <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
        <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC]">
          <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
            Vendor Information
          </h2>
        </div>
        <div className="p-6 flex-1 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#76777d]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0b1c30]">No Vendor Assigned</h4>
            <p className="text-xs text-[#76777d] mt-1 max-w-xs">
              Assign a verified vendor to begin technical site inspection and service execution.
            </p>
          </div>
          <button
            onClick={onOpenAssignModal}
            className="mt-2 bg-[#000000] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity active:scale-95 shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Assign Vendor</span>
          </button>
        </div>
      </div>
    );
  }

  const ratingStr = typeof vendor.averageRating === 'number' ? vendor.averageRating.toFixed(1) : vendor.averageRating || '4.8';

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      <div className="px-6 py-3.5 border-b border-[#c6c6cd] bg-[#F8FAFC] flex justify-between items-center">
        <h2 className="text-xs font-mono uppercase tracking-widest font-bold text-[#45464d]">
          Vendor Information
        </h2>
        <button
          onClick={onOpenAssignModal}
          className="text-xs text-[#006591] font-bold hover:underline"
        >
          Reassign
        </button>
      </div>

      <div className="p-6 flex-1 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#0b1c30]">{vendor.businessName}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <span className="px-2 py-0.5 bg-[#10B981] text-white text-[10px] rounded uppercase font-bold tracking-wider flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified</span>
              </span>
              <span className="px-2 py-0.5 bg-[#39b8fd]/20 text-[#004666] text-[10px] rounded uppercase font-bold tracking-wider">
                {vendor.availabilityStatus || 'Available'}
              </span>
              <span className="px-2 py-0.5 bg-slate-100 text-[#0b1c30] text-[10px] rounded flex items-center gap-0.5 font-bold">
                <span>{ratingStr}</span>
                <Star className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#c6c6cd]">
          <div>
            <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold">Company Name</p>
            <p className="text-xs font-semibold text-[#0b1c30] mt-0.5">{vendor.companyName || vendor.businessName}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#76777d] uppercase tracking-wider font-bold">Verification Status</p>
            <p className="text-xs font-semibold text-[#0b1c30] mt-0.5">{vendor.verificationStatus || 'VERIFIED'}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 border-t border-[#c6c6cd] bg-[#F8FAFC] flex items-center gap-2">
        <button
          onClick={onOpenAssignModal}
          className="text-xs font-semibold text-[#006591] hover:underline"
        >
          Change Vendor Assignment
        </button>
      </div>
    </div>
  );
}
