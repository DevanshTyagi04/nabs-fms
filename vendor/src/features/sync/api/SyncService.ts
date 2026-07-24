import { SyncRepository, VendorSyncState } from './SyncRepository';

export class SyncService {
  static async getVendorSyncState(): Promise<VendorSyncState> {
    return SyncRepository.getVendorSyncState();
  }
}
