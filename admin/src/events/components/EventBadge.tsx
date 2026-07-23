'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';

export interface EventBadgeProps {
  count: number;
}

export function EventBadge({ count }: EventBadgeProps) {
  if (count <= 0) return null;

  return (
    <Badge variant="error" size="sm" dot>
      {count > 99 ? '99+' : count}
    </Badge>
  );
}
