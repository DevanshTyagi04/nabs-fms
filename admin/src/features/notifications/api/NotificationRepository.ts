import { SessionManager } from '@/auth/services/SessionManager';
import { NotificationItemDomain, NotificationFilters, NotificationListResult } from '../types';

export class NotificationRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: NotificationItemDomain[] = [
    {
      id: 'notif-7001',
      userId: 'usr-admin-01',
      title: 'Payment Received Successfully',
      message: 'Razorpay UPI payment of $412.45 captured for Ticket SR-20260723-1001.',
      type: 'PAYMENT_SUCCESS',
      category: 'TRANSACTION',
      isRead: false,
      entityType: 'PAYMENT',
      entityId: 'pay-6001',
      createdAt: '2026-07-23T11:30:00Z',
      updatedAt: '2026-07-23T11:30:00Z',
    },
    {
      id: 'notif-7002',
      userId: 'usr-admin-01',
      title: 'Invoice Issued to Customer',
      message: 'Invoice INV-20260723-5001 has been generated and issued to Jane Doe.',
      type: 'INVOICE_ISSUED',
      category: 'DOCUMENT',
      isRead: false,
      entityType: 'INVOICE',
      entityId: 'inv-5001',
      createdAt: '2026-07-23T11:15:00Z',
      updatedAt: '2026-07-23T11:15:00Z',
    },
    {
      id: 'notif-7003',
      userId: 'usr-admin-01',
      title: 'Work Order Completed & Verified',
      message: 'Vendor Apex Field Services LLC completed execution on Work Order WO-20260723-4001.',
      type: 'WORK_ORDER_COMPLETED',
      category: 'EXECUTION',
      isRead: true,
      entityType: 'WORK_ORDER',
      entityId: 'wo-4001',
      createdAt: '2026-07-23T11:00:00Z',
      updatedAt: '2026-07-23T11:00:00Z',
    },
  ];

  static async listNotifications(filters: NotificationFilters): Promise<NotificationListResult> {
    try {
      const client = this.getClient();
      const res = await client.notifications.getMyNotifications(filters);
      if (res.data?.items) {
        return {
          items: res.data.items.map((item) => ({
            id: item.id,
            userId: item.userId,
            title: item.title,
            message: item.message,
            type: item.type,
            category: item.category,
            isRead: item.isRead,
            entityType: item.entityType,
            entityId: item.entityId,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
          total: res.data.total,
        };
      }
    } catch {
      // Fallback
    }

    let items = [...this.mockDatabase];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (n) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'ALL') {
      items = items.filter((n) => n.category === filters.category);
    }

    if (filters.isRead !== undefined) {
      items = items.filter((n) => n.isRead === filters.isRead);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getUnreadCount(): Promise<number> {
    return this.mockDatabase.filter((n) => !n.isRead).length;
  }

  static async markAsRead(id: string): Promise<NotificationItemDomain> {
    const index = this.mockDatabase.findIndex((n) => n.id === id);
    if (index === -1) throw new Error('Notification not found');

    const updated = { ...this.mockDatabase[index], isRead: true, updatedAt: new Date().toISOString() };
    this.mockDatabase[index] = updated;
    return updated;
  }

  static async markAllAsRead(): Promise<number> {
    let count = 0;
    this.mockDatabase = this.mockDatabase.map((n) => {
      if (!n.isRead) count++;
      return { ...n, isRead: true, updatedAt: new Date().toISOString() };
    });
    return count;
  }
}
