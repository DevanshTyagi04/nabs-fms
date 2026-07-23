import { ActivityDefinition, TimelineItem } from './types';

export class ActivityRegistry {
  private static definitionMap: Record<string, ActivityDefinition> = {
    CREATED: { action: 'CREATED', category: 'LIFECYCLE', severity: 'INFO', icon: 'plus-circle', badge: 'Created' },
    UPDATED: { action: 'UPDATED', category: 'MUTATION', severity: 'INFO', icon: 'edit', badge: 'Updated' },
    STATUS_CHANGED: { action: 'STATUS_CHANGED', category: 'WORKFLOW', severity: 'WARNING', icon: 'refresh-cw', badge: 'Status Changed' },
    PAYMENT_VERIFIED: { action: 'PAYMENT_VERIFIED', category: 'FINANCIAL', severity: 'SUCCESS', icon: 'dollar-sign', badge: 'Payment Verified' },
    FILE_UPLOADED: { action: 'FILE_UPLOADED', category: 'STORAGE', severity: 'INFO', icon: 'file-text', badge: 'File Uploaded' },
  };

  static getDefinition(action: string): ActivityDefinition {
    return (
      this.definitionMap[action] || {
        action,
        category: 'SYSTEM',
        severity: 'INFO',
        icon: 'activity',
        badge: action,
      }
    );
  }
}

export class ChangeRenderer {
  static formatChanges(changes?: Record<string, any>): string {
    if (!changes) return '';
    return Object.entries(changes)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(' | ');
  }
}

export class TimelineNavigator {
  static resolveRoute(item: TimelineItem): string {
    switch (item.entityType) {
      case 'SERVICE_REQUEST':
        return `/service-requests?id=${item.entityId}`;
      case 'SURVEY':
        return `/surveys?id=${item.entityId}`;
      case 'ESTIMATE':
        return `/estimates?id=${item.entityId}`;
      case 'WORK_ORDER':
        return `/work-orders?id=${item.entityId}`;
      case 'INVOICE':
        return `/invoices?id=${item.entityId}`;
      case 'PAYMENT':
        return `/payments?id=${item.entityId}`;
      default:
        return '/';
    }
  }
}

export class ActivityEngine {
  static evaluateItem(item: TimelineItem) {
    const def = ActivityRegistry.getDefinition(item.action);
    const route = TimelineNavigator.resolveRoute(item);
    const changeSummary = ChangeRenderer.formatChanges(item.changes);
    const formattedDate = new Date(item.createdAt).toLocaleString();

    return {
      definition: def,
      route,
      changeSummary,
      formattedDate,
    };
  }
}
