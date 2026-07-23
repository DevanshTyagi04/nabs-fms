import { SessionManager } from '@/auth/services/SessionManager';
import { TimelineItemDomain, ActivityFilters, ActivityListResult } from '../types';

export class ActivityRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: TimelineItemDomain[] = [
    {
      id: 'act-9001',
      actorId: 'usr-admin-01',
      actorName: 'System Admin',
      actorRole: 'ADMIN',
      action: 'PAYMENT_VERIFIED',
      category: 'FINANCIAL',
      entityType: 'PAYMENT',
      entityId: 'pay-6001',
      description: 'Manually verified and reconciled Razorpay UPI transaction PAY-20260723-6001.',
      changes: { status: 'SUCCESS', verifiedBy: 'usr-admin-01' },
      createdAt: '2026-07-23T11:30:00Z',
    },
    {
      id: 'act-9002',
      actorId: 'usr-vendor-01',
      actorName: 'Apex Field Services LLC',
      actorRole: 'VENDOR',
      action: 'STATUS_CHANGED',
      category: 'WORKFLOW',
      entityType: 'WORK_ORDER',
      entityId: 'wo-4001',
      description: 'Updated Work Order WO-20260723-4001 status to COMPLETED.',
      changes: { status: 'COMPLETED', previousStatus: 'IN_PROGRESS' },
      createdAt: '2026-07-23T11:00:00Z',
    },
    {
      id: 'act-9003',
      actorId: 'usr-admin-01',
      actorName: 'System Admin',
      actorRole: 'ADMIN',
      action: 'FILE_UPLOADED',
      category: 'STORAGE',
      entityType: 'INVOICE',
      entityId: 'inv-5001',
      description: 'Generated and attached invoice PDF statement INV-20260723-5001.pdf.',
      changes: { pdfKey: 'invoices/INV-20260723-5001.pdf' },
      createdAt: '2026-07-23T10:45:00Z',
    },
  ];

  static async getAdminTimeline(filters: ActivityFilters): Promise<ActivityListResult> {
    let items = [...this.mockDatabase];

    if (filters.category && filters.category !== 'ALL') {
      items = items.filter((i) => i.category === filters.category);
    }

    if (filters.actorRole && filters.actorRole !== 'ALL') {
      items = items.filter((i) => i.actorRole === filters.actorRole);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getEntityHistory(entity: string, entityId: string): Promise<TimelineItemDomain[]> {
    return this.mockDatabase.filter(
      (i) => i.entityType.toUpperCase() === entity.toUpperCase() && i.entityId === entityId
    );
  }
}
