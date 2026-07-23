export interface TimelineItemDomain {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  category: string;
  entityType: string;
  entityId: string;
  description: string;
  changes?: Record<string, any>;
  createdAt: string;
}

export interface ActivityFilters {
  category?: string;
  actorRole?: string;
  page: number;
  pageSize: number;
}

export interface ActivityListResult {
  items: TimelineItemDomain[];
  total: number;
}
