'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface HeroCardProps {
  title: string;
  subtitle: string;
  badgeLabel?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function HeroCard({
  title,
  subtitle,
  badgeLabel = 'Phase 3 Foundation',
  actionLabel,
  onAction,
}: HeroCardProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-lg">
      <div className="space-y-1.5">
        {badgeLabel && (
          <Badge variant="primary" className="bg-blue-700/50 text-blue-100 border-blue-500/30">
            {badgeLabel}
          </Badge>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-blue-100 max-w-2xl">{subtitle}</p>
      </div>

      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
