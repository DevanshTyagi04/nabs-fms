'use client';

import React from 'react';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const normalized = priority.toUpperCase();

  let dotColor = 'bg-slate-400';
  let textColor = 'text-slate-600';

  switch (normalized) {
    case 'URGENT':
    case 'CRITICAL':
      dotColor = 'bg-red-600';
      textColor = 'text-red-700 font-extrabold';
      break;
    case 'HIGH':
      dotColor = 'bg-amber-500';
      textColor = 'text-amber-700 font-bold';
      break;
    case 'MEDIUM':
      dotColor = 'bg-sky-500';
      textColor = 'text-sky-700 font-medium';
      break;
    case 'LOW':
      dotColor = 'bg-emerald-500';
      textColor = 'text-emerald-700 font-medium';
      break;
    default:
      dotColor = 'bg-slate-400';
      textColor = 'text-slate-600 font-medium';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-tighter ${textColor} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {normalized}
    </span>
  );
}
