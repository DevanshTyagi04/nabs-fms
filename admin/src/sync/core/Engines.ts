import { QueueConfig, SyncSession, ConflictRecord } from './types';

export class QueueRegistry {
  private static queueMap: Record<string, QueueConfig> = {
    MUTATION: { queueId: 'MUTATION', priority: 'HIGH', retryStrategy: 'EXPONENTIAL', maxRetries: 5 },
    UPLOAD: { queueId: 'UPLOAD', priority: 'MEDIUM', retryStrategy: 'EXPONENTIAL', maxRetries: 3 },
    DOWNLOAD: { queueId: 'DOWNLOAD', priority: 'LOW', retryStrategy: 'LINEAR', maxRetries: 2 },
    RETRY: { queueId: 'RETRY', priority: 'HIGH', retryStrategy: 'EXPONENTIAL', maxRetries: 5 },
  };

  static getConfig(queueId: string): QueueConfig {
    return (
      this.queueMap[queueId] || {
        queueId,
        priority: 'MEDIUM',
        retryStrategy: 'EXPONENTIAL',
        maxRetries: 3,
      }
    );
  }
}

export class NetworkProvider {
  static getNetworkStatus(): 'ONLINE' | 'OFFLINE' {
    return typeof navigator !== 'undefined' && navigator.onLine === false ? 'OFFLINE' : 'ONLINE';
  }
}

export class SyncNavigator {
  static resolveConflictRoute(conflict: ConflictRecord): string {
    switch (conflict.entityType) {
      case 'SERVICE_REQUEST':
        return `/service-requests?id=${conflict.entityId}`;
      case 'WORK_ORDER':
        return `/work-orders?id=${conflict.entityId}`;
      case 'INVOICE':
        return `/invoices?id=${conflict.entityId}`;
      default:
        return '/';
    }
  }
}

export class SyncEngine {
  static evaluateSession(session: SyncSession) {
    const isOffline = session.networkState === 'OFFLINE';
    const hasFailures = session.failedOperationsCount > 0;

    return {
      isOffline,
      hasFailures,
      statusLabel: isOffline ? 'Offline Mode' : session.currentState === 'SYNCING' ? 'Syncing...' : 'System Synced',
    };
  }
}
