import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  isRead: boolean;
  targetRoute: string;
  createdAt: string;
}

export class NotificationRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerNotifications: CustomerNotification[] = [
    {
      id: 'notif-7002',
      title: 'Invoice Issued for Service Ticket',
      message: 'Invoice INV-20260723-5001 has been issued. Total due: $412.45.',
      category: 'DOCUMENT',
      isRead: false,
      targetRoute: '/invoices',
      createdAt: '2026-07-23T11:15:00Z',
    },
  ];

  static async getCustomerNotifications(): Promise<CustomerNotification[]> {
    return [...this.mockCustomerNotifications];
  }
}
