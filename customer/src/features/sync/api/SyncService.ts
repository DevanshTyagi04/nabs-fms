import { SyncRepository, CustomerSyncState } from './SyncRepository';

export class SyncService {
  static async getCustomerSyncState(): Promise<CustomerSyncState> {
    return SyncRepository.getCustomerSyncState();
  }
}
