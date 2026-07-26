'use client';

import React, { useState } from 'react';
import { X, SlidersHorizontal, Loader2 } from 'lucide-react';

interface ChangeStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (targetStatus: string, remarks?: string) => Promise<void>;
  currentStatus: string;
}

const ALL_STATUSES = [
  { value: 'CREATED', label: 'Created' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'SURVEY_PENDING', label: 'Survey Pending' },
  { value: 'SURVEY_SUBMITTED', label: 'Survey Submitted' },
  { value: 'SURVEY_APPROVED', label: 'Survey Approved' },
  { value: 'ESTIMATE_CREATED', label: 'Estimate Created' },
  { value: 'AWAITING_APPROVAL', label: 'Awaiting Approval' },
  { value: 'ADVANCE_PENDING', label: 'Advance Pending' },
  { value: 'ADVANCE_RECEIVED', label: 'Advance Received' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WORK_COMPLETED', label: 'Work Completed' },
  { value: 'QUALITY_CHECK', label: 'Quality Check' },
  { value: 'FINAL_PAYMENT_PENDING', label: 'Final Payment Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Backend FSM Allowed State Transitions
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['ASSIGNED', 'CREATED', 'SCHEDULED', 'IN_PROGRESS', 'CANCELLED'],
  SURVEY_PENDING: ['SURVEY_SUBMITTED', 'CANCELLED'],
  SURVEY_SUBMITTED: ['SURVEY_APPROVED', 'CANCELLED'],
  SURVEY_APPROVED: ['ESTIMATE_CREATED', 'SCHEDULED', 'IN_PROGRESS', 'CANCELLED'],
  ESTIMATE_CREATED: ['AWAITING_APPROVAL', 'CANCELLED'],
  AWAITING_APPROVAL: ['SCHEDULED', 'IN_PROGRESS', 'CANCELLED'],
  ADVANCE_PENDING: ['ADVANCE_RECEIVED', 'CANCELLED'],
  ADVANCE_RECEIVED: ['SCHEDULED', 'IN_PROGRESS', 'CANCELLED'],
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WORK_COMPLETED', 'CANCELLED'],
  WORK_COMPLETED: ['QUALITY_CHECK', 'COMPLETED', 'CANCELLED'],
  QUALITY_CHECK: ['FINAL_PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
  FINAL_PAYMENT_PENDING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: ['ARCHIVED'],
  ARCHIVED: [],
  CANCELLED: [],
};

export function ChangeStatusModal({
  isOpen,
  onClose,
  onChangeStatus,
  currentStatus,
}: ChangeStatusModalProps) {
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const validTargetStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];
  const selectableOptions = ALL_STATUSES.filter((s) => validTargetStatuses.includes(s.value));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStatus) {
      setErrorMsg('Please select a target status.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onChangeStatus(targetStatus, remarks.trim() || undefined);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Failed to update request status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        <div className="px-6 py-4 border-b border-[#c6c6cd] bg-[#F8FAFC] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#006591]" />
            <h3 className="text-sm font-bold text-[#0b1c30]">Change Request Status</h3>
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

          <div>
            <span className="text-xs text-[#76777d]">Current Status: </span>
            <span className="text-xs font-mono font-bold text-[#0b1c30]">{currentStatus}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0b1c30]">Select Target Status *</label>
            {selectableOptions.length === 0 ? (
              <p className="text-xs text-[#76777d] italic py-2">
                No further state machine transitions available from status [{currentStatus}].
              </p>
            ) : (
              <select
                value={targetStatus}
                onChange={(e) => setTargetStatus(e.target.value)}
                required
                className="w-full bg-[#F8FAFC] border border-[#c6c6cd] rounded-lg p-2 text-xs font-medium text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#000000]"
              >
                <option value="">-- Select Allowed Status --</option>
                {selectableOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label} ({s.value})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0b1c30]">Transition Remarks (Optional)</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Provide reason for manual status update..."
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
              disabled={isSubmitting || !targetStatus}
              className="px-4 py-2 bg-[#000000] text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <SlidersHorizontal className="w-3.5 h-3.5" />
              )}
              <span>Update Status</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
