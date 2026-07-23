export interface PlatformEvent {
  id: string;
  type: string;
  category: 'WORKFLOW' | 'EXECUTION' | 'FINANCIAL' | 'DOCUMENT' | 'TRANSACTION' | 'SYSTEM';
  actor: string;
  entityType?: 'SERVICE_REQUEST' | 'SURVEY' | 'ESTIMATE' | 'WORK_ORDER' | 'INVOICE' | 'PAYMENT' | 'USER';
  entityId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface EventConfig {
  type: string;
  category: string;
  severity: 'info' | 'success' | 'warning' | 'error';
  icon: string;
  routePrefix: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}
