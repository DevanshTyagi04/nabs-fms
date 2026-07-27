'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertOctagon, Loader2 } from 'lucide-react';

interface ReviewSurveyModalProps {
  isOpen: boolean;
  initialDecision?: 'APPROVED' | 'REJECTED';
  onClose: () => void;
  onConfirmReview: (decision: 'APPROVED' | 'REJECTED', remarks?: string) => Promise<void>;
}

export function ReviewSurveyModal({
  isOpen,
  initialDecision = 'APPROVED',
  onClose,
  onConfirmReview,
}: ReviewSurveyModalProps) {
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED'>(initialDecision);
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setDecision(initialDecision);
      setRemarks('');
      setErrorMsg('');
    }
  }, [isOpen, initialDecision]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onConfirmReview(decision, remarks.trim() || undefined);
      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Failed to submit survey review decision.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border border-[#c6c6cd] rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#c6c6cd] bg-[#F8FAFC] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#006591]" />
            <h3 className="text-sm font-bold text-[#0b1c30]">Review Technical Survey</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#76777d] hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#0b1c30]">Select Review Decision *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDecision('APPROVED')}
                className={`py-2.5 px-4 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  decision === 'APPROVED'
                    ? 'bg-[#000000] text-white border-[#000000]'
                    : 'bg-[#F8FAFC] text-[#45464d] border-[#c6c6cd] hover:bg-slate-100'
                }`}
              >
                <span>Approve Survey</span>
              </button>
              <button
                type="button"
                onClick={() => setDecision('REJECTED')}
                className={`py-2.5 px-4 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  decision === 'REJECTED'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-[#F8FAFC] text-[#45464d] border-[#c6c6cd] hover:bg-slate-100'
                }`}
              >
                <span>Reject Survey</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#0b1c30]">
              Review Remarks / Feedback (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              placeholder="Provide reason or feedback regarding your review decision..."
              className="w-full bg-[#F8FAFC] border border-[#c6c6cd] rounded-lg p-2.5 text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#000000] resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[#c6c6cd]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-[#c6c6cd] text-[#0b1c30] rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 active:scale-95 disabled:opacity-40 ${
                decision === 'APPROVED' ? 'bg-[#000000]' : 'bg-red-600'
              }`}
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Confirm {decision === 'APPROVED' ? 'Approval' : 'Rejection'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
