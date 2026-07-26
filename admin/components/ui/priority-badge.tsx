'use client';

import React from 'react';

interface PriorityBadgeProps {
  priority: string;
  className?: string;
  variant?: 'inline' | 'badge';
}

export function PriorityBadge({ priority, className = '', variant = 'inline' }: PriorityBadgeProps) {
  const normalized = priority.toUpperCase();

  if (variant === 'badge') {
    let badgeStyle = 'bg-slate-50 text-slate-600 border-slate-200';
    let dotColor = 'bg-slate-400';

    switch (normalized) {
      case 'URGENT':
      case 'CRITICAL':
        badgeStyle = 'bg-red-50 text-red-700 border-red-100';
        dotColor = 'bg-red-600';
        break;
      case 'HIGH':
        badgeStyle = 'bg-orange-50 text-orange-700 border-orange-100';
        dotColor = 'bg-orange-500';
        break;
      case 'MEDIUM':
        badgeStyle = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        dotColor = 'bg-yellow-500';
        break;
      case 'LOW':
        badgeStyle = 'bg-blue-50 text-blue-700 border-blue-100';
        dotColor = 'bg-blue-600';
        break;
      default:
        badgeStyle = 'bg-slate-50 text-slate-600 border-slate-200';
        dotColor = 'bg-slate-400';
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeStyle} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`}></span>
        {normalized}
      </span>
    );
  }

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
