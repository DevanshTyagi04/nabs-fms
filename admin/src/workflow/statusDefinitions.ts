import { IconName, BadgeVariant } from '@packages/shared-types';

export interface WorkflowStatusDefinition {
  id: string;
  label: string;
  badgeVariant: BadgeVariant;
  icon: IconName;
  terminal?: boolean;
  allowedTransitions: string[];
}

export const SERVICE_REQUEST_STATUS_DEFINITIONS: Record<string, WorkflowStatusDefinition> = {
  CREATED: {
    id: 'CREATED',
    label: 'Created',
    badgeVariant: 'warning',
    icon: 'briefcase',
    allowedTransitions: ['ASSIGNED', 'CANCELLED'],
  },
  ASSIGNED: {
    id: 'ASSIGNED',
    label: 'Vendor Assigned',
    badgeVariant: 'info',
    icon: 'user',
    allowedTransitions: ['IN_PROGRESS', 'CREATED', 'CANCELLED'],
  },
  IN_PROGRESS: {
    id: 'IN_PROGRESS',
    label: 'In Progress',
    badgeVariant: 'primary',
    icon: 'refresh',
    allowedTransitions: ['COMPLETED', 'CANCELLED'],
  },
  COMPLETED: {
    id: 'COMPLETED',
    label: 'Completed',
    badgeVariant: 'success',
    icon: 'check-circle',
    terminal: true,
    allowedTransitions: [],
  },
  CANCELLED: {
    id: 'CANCELLED',
    label: 'Cancelled',
    badgeVariant: 'neutral',
    icon: 'x',
    terminal: true,
    allowedTransitions: [],
  },
};
