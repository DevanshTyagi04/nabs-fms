'use client';

import React from 'react';
import { EntityDetailModal, EntityHeader, DetailSection } from '@/components/crud/EntityDetailLayout';
import { FormEngine } from '@/forms/engine/FormEngine';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Survey } from '../types';

export interface SurveyDetailModalProps {
  open: boolean;
  onClose: () => void;
  survey: Survey | null;
  onOpenReview?: (survey: Survey) => void;
}

export function SurveyDetailModal({
  open,
  onClose,
  survey,
  onOpenReview,
}: SurveyDetailModalProps) {
  if (!survey) return null;

  return (
    <EntityDetailModal
      open={open}
      onClose={onClose}
      title="Technical Inspection Survey Details"
      header={
        <EntityHeader
          title={survey.title}
          subtitle={`Ticket: ${survey.ticketNumber} • Version v${survey.version}.0`}
          badge={
            <Badge
              variant={
                survey.status === 'APPROVED'
                  ? 'success'
                  : survey.status === 'REJECTED'
                  ? 'error'
                  : 'warning'
              }
            >
              {survey.status}
            </Badge>
          }
        />
      }
    >
      <div className="space-y-4">
        {/* Detail Overview */}
        <DetailSection
          title="Survey Overview"
          fields={[
            { label: 'Assigned Vendor', value: survey.vendorName },
            { label: 'Form Template', value: survey.formDefinition.title },
            { label: 'Version Number', value: `v${survey.version}.0` },
            { label: 'Submission Status', value: survey.status },
          ]}
        />

        {/* Vendor Technical Notes */}
        {survey.notes && (
          <DetailSection
            title="Vendor Technical Summary"
            fields={[{ label: 'Notes', value: survey.notes }]}
          />
        )}

        {/* FormEngine Read-Only Render */}
        <div className="pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Inspection Form & Responses
          </h4>
          <FormEngine
            definition={survey.formDefinition}
            initialResponses={survey.responses}
            readOnly
          />
        </div>

        {/* Review Action Trigger */}
        {survey.status === 'SUBMITTED' && onOpenReview && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <Button variant="primary" onClick={() => onOpenReview(survey)}>
              Review & Issue Decision
            </Button>
          </div>
        )}
      </div>
    </EntityDetailModal>
  );
}
