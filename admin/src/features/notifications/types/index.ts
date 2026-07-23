export interface NotificationItemDomain {
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

export interface NotificationFilters {
  search?: string;
  category?: string;
  isRead?: boolean;
  page: number;
  pageSize: number;
}

export interface NotificationListResult {
  items: NotificationItemDomain[];
  total: number;
}
