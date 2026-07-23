'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { SERVICE_REQUEST_STATUS_DEFINITIONS } from '@/workflow/statusDefinitions';

export interface WorkflowStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function WorkflowStatusBadge({ status, size = 'sm' }: WorkflowStatusBadgeProps) {
  const def = SERVICE_REQUEST_STATUS_DEFINITIONS[status];

  if (!def) {
    return <Badge variant="neutral" size={size}>{status}</Badge>;
  }

  return (
    <Badge variant={def.badgeVariant} size={size} dot={!def.terminal}>
      {def.label}
    </Badge>
  );
}
