import { SessionManager } from '@/auth/services/SessionManager';
import { SyncStatsDomain } from '../types';

export class SyncRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockQueuedItems = [
    {
      id: 'q-item-101',
      queueId: 'MUTATION',
      type: 'WORK_ORDER_STATUS_UPDATE',
      payload: { workOrderId: 'wo-4001', status: 'IN_PROGRESS' },
      status: 'COMPLETED' as const,
      retryCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'q-item-102',
      queueId: 'UPLOAD',
      type: 'INSPECTION_PHOTO_UPLOAD',
      payload: { fileKey: 'attachments/survey-photo-1.jpg' },
      status: 'QUEUED' as const,
      retryCount: 1,
      createdAt: new Date().toISOString(),
    },
  ];

  static async getSyncState(): Promise<SyncStatsDomain> {
    return {
      session: {
        currentState: 'ONLINE',
        lastSuccessfulSync: new Date().toISOString(),
        pendingOperationsCount: 1,
        failedOperationsCount: 0,
        networkState: 'ONLINE',
      },
      queuedItems: [...this.mockQueuedItems],
      conflicts: [],
    };
  }

  static async retryItem(id: string): Promise<boolean> {
    const item = this.mockQueuedItems.find((i) => i.id === id);
    if (item) {
      item.status = 'COMPLETED';
    }
    return true;
  }
}
