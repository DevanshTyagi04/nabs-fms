'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { FormField, FormLabel } from '@/components/forms/FormField';

export interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  loading?: boolean;
  onReview: (decision: 'APPROVED' | 'REJECTED', remarks?: string) => Promise<void>;
}

export function ReviewDialog({
  open,
  onClose,
  title = 'Review Inspection / Form Submission',
  description = 'Evaluate submission content and issue approval decision',
  loading = false,
  onReview,
}: ReviewDialogProps) {
  const [remarks, setRemarks] = useState('');

  const handleDecision = async (decision: 'APPROVED' | 'REJECTED') => {
    await onReview(decision, remarks);
    setRemarks('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <div className="space-y-4 pt-2">
        <FormField>
          <FormLabel>Review Comments / Remarks</FormLabel>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Feedback, approval notes, or rejection reason..."
            rows={3}
            className="w-full p-2.5 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDecision('REJECTED')} loading={loading}>
            Reject Submission
          </Button>
          <Button variant="primary" onClick={() => handleDecision('APPROVED')} loading={loading}>
            Approve Submission
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
