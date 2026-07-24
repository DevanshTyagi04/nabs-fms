import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorSyncState {
  networkState: 'ONLINE' | 'OFFLINE';
  pendingCount: number;
  lastSyncedAt: string;
}

export class SyncRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  static async getVendorSyncState(): Promise<VendorSyncState> {
    return {
      networkState: 'ONLINE',
      pendingCount: 0,
      lastSyncedAt: new Date().toISOString(),
    };
  }
}
