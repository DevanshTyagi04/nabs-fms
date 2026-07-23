'use client';

import React from 'react';
import { ReviewDialog } from '@/forms/engine/ReviewDialog';
import { Survey } from '../types';

export interface SurveyReviewDialogProps {
  open: boolean;
  onClose: () => void;
  survey: Survey | null;
  loading?: boolean;
  onReview: (decision: 'APPROVED' | 'REJECTED', remarks?: string) => Promise<void>;
}

export function SurveyReviewDialog({
  open,
  onClose,
  survey,
  loading = false,
  onReview,
}: SurveyReviewDialogProps) {
  if (!survey) return null;

  return (
    <ReviewDialog
      open={open}
      onClose={onClose}
      title={`Review Technical Survey - ${survey.ticketNumber}`}
      description={`Issue approval or rejection decision for ${survey.title} submitted by ${survey.vendorName}`}
      loading={loading}
      onReview={onReview}
    />
  );
}
