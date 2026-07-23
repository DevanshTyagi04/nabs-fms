import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerTimelineItem {
  id: string;
  action: string;
  description: string;
  actorName: string;
  formattedDate: string;
}

export class ActivityRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerTimeline: CustomerTimelineItem[] = [
    {
      id: 'act-9003',
      action: 'INVOICE_GENERATED',
      description: 'Generated and attached invoice PDF statement INV-20260723-5001.pdf.',
      actorName: 'System Admin',
      formattedDate: 'Today, 10:45 AM',
    },
  ];

  static async getCustomerTimeline(): Promise<CustomerTimelineItem[]> {
    return [...this.mockCustomerTimeline];
  }
}
