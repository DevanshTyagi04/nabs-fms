export interface TimelineItem {
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

export interface ActivityDefinition {
  action: string;
  category: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  icon: string;
  badge: string;
}

export interface AuditRecord {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export interface AuditSession {
  category?: string;
  actorRole?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}
