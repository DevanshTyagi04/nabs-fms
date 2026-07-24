import { SyncRepository } from './SyncRepository';
import { SyncStatsDomain } from '../types';

export class SyncService {
  static async getSyncState(): Promise<SyncStatsDomain> {
    return SyncRepository.getSyncState();
  }

  static async retryQueueItem(id: string): Promise<boolean> {
    return SyncRepository.retryItem(id);
  }
}
