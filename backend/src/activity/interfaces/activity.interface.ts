import { UserRole } from '@prisma/client';

export interface ActivityUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface ActivityItem {
  id: string;
  timestamp: Date;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  correlationId?: string;
  user?: ActivityUser;
  metadata?: Record<string, any>;
}

export interface ActivityPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface NormalizedActivityFeedResponse {
  items: ActivityItem[];
  pagination: ActivityPaginationMeta;
  filters: {
    entity?: string | null;
    entityId?: string | null;
    action?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
}
