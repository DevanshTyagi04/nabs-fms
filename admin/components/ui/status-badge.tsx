'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');

  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (normalized) {
    case 'COMPLETED':
    case 'WORK_COMPLETED':
      badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'ASSIGNED':
    case 'IN_PROGRESS':
    case 'SCHEDULED':
      badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'CREATED':
    case 'SURVEY_PENDING':
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
    case 'SURVEY_SUBMITTED':
    case 'SURVEY_APPROVED':
    case 'ESTIMATE_CREATED':
    case 'AWAITING_APPROVAL':
      badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'CANCELLED':
    case 'REJECTED':
      badgeStyle = 'bg-red-50 text-red-700 border-red-200';
      break;
    default:
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
  }

  const displayText = status.replace(/_/g, ' ');

  return (
    <span
      className={`inline-flex items-center font-mono font-bold text-[10px] tracking-wider uppercase px-2.5 py-0.5 rounded border ${badgeStyle} ${className}`}
    >
      {displayText}
    </span>
  );
}
