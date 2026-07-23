'use client';

import React from 'react';
import { TransactionStatusRegistry } from '../core/Engines';
import { Badge } from '@/components/ui/Badge';

export interface GatewayStatusBadgeProps {
  status: string;
}

export function GatewayStatusBadge({ status }: GatewayStatusBadgeProps) {
  const config = TransactionStatusRegistry.getConfig(status);
  return (
    <Badge variant={config.variant} size="sm" dot={status === 'PENDING'}>
      {config.label}
    </Badge>
  );
}
