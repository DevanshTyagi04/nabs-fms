import { QueueItem, SyncSession, ConflictRecord } from '@/sync/core/types';

export interface SyncStatsDomain {
  session: SyncSession;
  queuedItems: QueueItem[];
  conflicts: ConflictRecord[];
}

export interface SyncFilters {
  status?: string;
}
