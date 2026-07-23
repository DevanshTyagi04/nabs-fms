'use client';

import React from 'react';
import { DocumentStatusRegistry } from '../core/Engines';
import { Badge } from '@/components/ui/Badge';

export interface PaymentStatusBadgeProps {
  status: string;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = DocumentStatusRegistry.getConfig(status);
  return (
    <Badge variant={config.variant} size="sm" dot={status === 'ISSUED' || status === 'SENT'}>
      {config.label}
    </Badge>
  );
}
