import { BadgeVariant, DomainStatus } from '@nabs/shared-types';

export const APP_NAME = 'NABS Field Service Management';

export const DOMAIN_STATUS_MAP: Record<DomainStatus, { label: string; variant: BadgeVariant }> = {
  PENDING: { label: 'Pending', variant: 'warning' },
  SCHEDULED: { label: 'Scheduled', variant: 'info' },
  IN_PROGRESS: { label: 'In Progress', variant: 'primary' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'error' },
  DRAFT: { label: 'Draft', variant: 'neutral' },
};

export const DEFAULT_THEME = 'system';
