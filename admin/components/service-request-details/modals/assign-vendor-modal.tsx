'use client';

import React, { useState } from 'react';
import { X, UserPlus, Loader2, Search } from 'lucide-react';
import { VendorOptionItem } from '@/lib/types/service-requests.types';

interface AssignVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (vendorId: string, remarks?: string) => Promise<void>;
  vendors: VendorOptionItem[];
  currentVendorId?: string | null;
  isLoadingVendors?: boolean;
}

export function AssignVendorModal({
  isOpen,
  onClose,
  onAssign,
  vendors,
  currentVendorId,
  isLoadingVendors = false,
}: AssignVendorModalProps) {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(currentVendorId || '');
  const [remarks, setRemarks] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const filteredVendors = vendors.filter((v) =>
    v.businessName.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId) {
      setErrorMsg('Please select a vendor.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onAssign(selectedVendorId, remarks.trim() || undefined);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to assign vendor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-[#c6c6cd] bg-[#F8FAFC] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-[#006591]" />
            <h3 className="text-sm font-bold text-[#0b1c30]">
              {currentVendorId ? 'Reassign Vendor' : 'Assign Vendor'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#76777d] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0b1c30]">Search Vendor</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#76777d] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search vendor by business name..."
                className="w-full bg-[#F8FAFC] border border-[#c6c6cd] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#000000]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0b1c30]">Select Verified Vendor *</label>
            {isLoadingVendors ? (
              <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
            ) : filteredVendors.length === 0 ? (
              <p className="text-xs text-[#76777d] italic py-2">No matching vendors found.</p>
            ) : (
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                required
                className="w-full bg-[#F8FAFC] border border-[#c6c6cd] rounded-lg p-2 text-xs font-medium text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#000000]"
              >
                <option value="">-- Select Vendor --</option>
                {filteredVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.businessName} ({v.verificationStatus || 'VERIFIED'}) - Rating: {v.averageRating || '4.8'}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0b1c30]">Assignment Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="e.g. Assigned based on HVAC category skill match and proximity."
              className="w-full bg-[#F8FAFC] border border-[#c6c6cd] rounded-lg p-2.5 text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#000000] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#c6c6cd]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c6c6cd] text-[#0b1c30] rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedVendorId}
              className="px-4 py-2 bg-[#000000] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Confirm Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
