import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorNotification {
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

  private static mockVendorNotifications: VendorNotification[] = [
    {
      id: 'notif-7001',
      title: 'New Work Order Assigned',
      message: 'You have been assigned to Work Order WO-20260723-4001 for HVAC Maintenance.',
      category: 'EXECUTION',
      isRead: false,
      targetRoute: '/work-orders',
      createdAt: '2026-07-23T11:00:00Z',
    },
  ];

  static async getVendorNotifications(): Promise<VendorNotification[]> {
    return [...this.mockVendorNotifications];
  }
}
