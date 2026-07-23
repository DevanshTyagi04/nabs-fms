'use client';

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';
import { FilterBar, FilterSchemaField } from '@/components/crud/FilterBar';
import { useToast } from '@/hooks/useToast';

import { Survey } from '@/features/surveys/types';
import { useSurveys, useReviewSurvey } from '@/features/surveys/hooks';
import { SurveyTable } from '@/features/surveys/components/SurveyTable';
import { SurveyDetailModal } from '@/features/surveys/components/SurveyDetailModal';
import { SurveyReviewDialog } from '@/features/surveys/components/SurveyReviewDialog';

const SURVEY_FILTER_SCHEMA: FilterSchemaField[] = [
  {
    key: 'search',
    type: 'text',
    placeholder: 'Search ticket #, title, vendor...',
  },
  {
    key: 'status',
    type: 'status',
    label: 'Review Status',
    placeholder: 'All Review Statuses',
    options: [
      { label: 'Draft', value: 'DRAFT' },
      { label: 'Submitted for Review', value: 'SUBMITTED' },
      { label: 'Approved', value: 'APPROVED' },
      { label: 'Rejected', value: 'REJECTED' },
    ],
  },
];

export default function AdminSurveysPage() {
  const toast = useToast();

  const { surveys, total, loading, filters, setFilters, refetch } = useSurveys({
    page: 1,
    pageSize: 10,
    search: '',
    status: 'ALL',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  const { reviewSurvey, loading: reviewLoading } = useReviewSurvey();

  const [detailSurvey, setDetailSurvey] = useState<Survey | null>(null);
  const [reviewSurveyItem, setReviewSurveyItem] = useState<Survey | null>(null);

  const handleReviewDecision = async (decision: 'APPROVED' | 'REJECTED', remarks?: string) => {
    if (!reviewSurveyItem) return;
    await reviewSurvey(reviewSurveyItem.id, { status: decision, remarks });
    toast.success('Review Decision Issued', `Survey for ${reviewSurveyItem.ticketNumber} marked as ${decision}.`);
    setReviewSurveyItem(null);
    setDetailSurvey(null);
    refetch();
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Survey & Technical Inspection Management"
              description="Review field technical inspection assessments, verify diagnostic photos, and approve vendor surveys."
            />

            {/* Schema-Driven FilterBar */}
            <FilterBar
              fields={SURVEY_FILTER_SCHEMA}
              values={filters}
              onChange={(newVals) => setFilters({ ...filters, ...newVals, page: 1 })}
              onReset={() =>
                setFilters({
                  page: 1,
                  pageSize: 10,
                  search: '',
                  status: 'ALL',
                  sortBy: 'updatedAt',
                  sortOrder: 'desc',
                })
              }
            />

            {/* Controlled Survey Table */}
            <SurveyTable
              surveys={surveys}
              loading={loading}
              pagination={{
                page: filters.page,
                pageSize: filters.pageSize,
                total,
              }}
              sorting={{
                sortBy: filters.sortBy || 'updatedAt',
                sortOrder: filters.sortOrder || 'desc',
              }}
              onPaginationChange={(p) => setFilters({ ...filters, page: p.page, pageSize: p.pageSize })}
              onSortingChange={(s) => setFilters({ ...filters, sortBy: s.sortBy, sortOrder: s.sortOrder })}
              onViewSurvey={(s) => setDetailSurvey(s)}
              onReviewSurvey={(s) => setReviewSurveyItem(s)}
            />

            {/* Survey Detail Modal with FormEngine */}
            <SurveyDetailModal
              open={Boolean(detailSurvey)}
              onClose={() => setDetailSurvey(null)}
              survey={detailSurvey}
              onOpenReview={(s) => setReviewSurveyItem(s)}
            />

            {/* Survey Review Dialog */}
            <SurveyReviewDialog
              open={Boolean(reviewSurveyItem)}
              onClose={() => setReviewSurveyItem(null)}
              survey={reviewSurveyItem}
              loading={reviewLoading}
              onReview={handleReviewDecision}
            />
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
