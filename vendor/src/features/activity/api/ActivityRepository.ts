import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorTimelineItem {
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

  private static mockVendorTimeline: VendorTimelineItem[] = [
    {
      id: 'act-9002',
      action: 'WORK_ORDER_COMPLETED',
      description: 'Updated Work Order WO-20260723-4001 status to COMPLETED.',
      actorName: 'Apex Field Services LLC',
      formattedDate: 'Today, 11:00 AM',
    },
  ];

  static async getVendorTimeline(): Promise<VendorTimelineItem[]> {
    return [...this.mockVendorTimeline];
  }
}
