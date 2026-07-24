export interface SyncSession {
  currentState: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  lastSuccessfulSync: string;
  pendingOperationsCount: number;
  failedOperationsCount: number;
  networkState: 'ONLINE' | 'OFFLINE';
  lastError?: string;
}

export interface QueueItem {
  id: string;
  queueId: string;
  type: string;
  payload: any;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  createdAt: string;
}

export interface ConflictRecord {
  id: string;
  entityType: string;
  entityId: string;
  clientState: any;
  serverState: any;
  createdAt: string;
}

export interface QueueConfig {
  queueId: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  retryStrategy: 'EXPONENTIAL' | 'LINEAR';
  maxRetries: number;
}
