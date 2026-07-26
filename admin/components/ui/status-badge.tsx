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
    case 'APPROVED':
    case 'SURVEY_APPROVED':
    case 'COMPLETED':
    case 'WORK_COMPLETED':
      badgeStyle = 'bg-green-50 text-green-700 border-green-100';
      break;
    case 'SUBMITTED':
    case 'SURVEY_SUBMITTED':
      badgeStyle = 'bg-blue-50 text-blue-700 border-blue-100';
      break;
    case 'ASSIGNED':
    case 'IN_PROGRESS':
    case 'SCHEDULED':
      badgeStyle = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'DRAFT':
      badgeStyle = 'bg-white text-slate-500 border-slate-300';
      break;
    case 'SUPERSEDED':
      badgeStyle = 'bg-slate-100 text-slate-400 border-slate-200 line-through';
      break;
    case 'CREATED':
    case 'SURVEY_PENDING':
      badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';
      break;
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
      className={`inline-flex items-center font-mono font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded border ${badgeStyle} ${className}`}
    >
      {displayText}
    </span>
  );
}
