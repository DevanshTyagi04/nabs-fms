import { EventConfig, NotificationItem } from './types';

export class EventRegistry {
  private static registryMap: Record<string, EventConfig> = {
    SERVICE_REQUEST_CREATED: { type: 'SERVICE_REQUEST_CREATED', category: 'WORKFLOW', severity: 'info', icon: 'briefcase', routePrefix: '/service-requests' },
    SERVICE_REQUEST_ASSIGNED: { type: 'SERVICE_REQUEST_ASSIGNED', category: 'WORKFLOW', severity: 'info', icon: 'user', routePrefix: '/service-requests' },
    SURVEY_SUBMITTED: { type: 'SURVEY_SUBMITTED', category: 'EXECUTION', severity: 'warning', icon: 'file-text', routePrefix: '/surveys' },
    SURVEY_APPROVED: { type: 'SURVEY_APPROVED', category: 'EXECUTION', severity: 'success', icon: 'check', routePrefix: '/surveys' },
    ESTIMATE_SUBMITTED: { type: 'ESTIMATE_SUBMITTED', category: 'FINANCIAL', severity: 'warning', icon: 'file-text', routePrefix: '/estimates' },
    ESTIMATE_APPROVED: { type: 'ESTIMATE_APPROVED', category: 'FINANCIAL', severity: 'success', icon: 'check', routePrefix: '/estimates' },
    WORK_ORDER_ASSIGNED: { type: 'WORK_ORDER_ASSIGNED', category: 'EXECUTION', severity: 'info', icon: 'briefcase', routePrefix: '/work-orders' },
    WORK_ORDER_COMPLETED: { type: 'WORK_ORDER_COMPLETED', category: 'EXECUTION', severity: 'success', icon: 'check', routePrefix: '/work-orders' },
    INVOICE_ISSUED: { type: 'INVOICE_ISSUED', category: 'DOCUMENT', severity: 'warning', icon: 'file-text', routePrefix: '/invoices' },
    PAYMENT_SUCCESS: { type: 'PAYMENT_SUCCESS', category: 'TRANSACTION', severity: 'success', icon: 'dollar-sign', routePrefix: '/payments' },
    PAYMENT_FAILED: { type: 'PAYMENT_FAILED', category: 'TRANSACTION', severity: 'error', icon: 'alert-triangle', routePrefix: '/payments' },
  };

  static getConfig(type: string): EventConfig {
    return (
      this.registryMap[type] || {
        type,
        category: 'SYSTEM',
        severity: 'info',
        icon: 'bell',
        routePrefix: '/',
      }
    );
  }
}

type EventListener = (event: any) => void;

export class EventBus {
  private static listeners: Map<string, Set<EventListener>> = new Map();

  static subscribe(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    return () => {
      this.listeners.get(eventType)?.delete(listener);
    };
  }

  static publish(eventType: string, payload: any) {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach((fn) => fn(payload));
    }
  }
}

export class NotificationRouter {
  static resolveRoute(item: NotificationItem): string {
    const config = EventRegistry.getConfig(item.type);
    if (item.entityId && config.routePrefix !== '/') {
      return `${config.routePrefix}?id=${item.entityId}`;
    }
    return config.routePrefix;
  }
}

export class SubscriptionManager {
  private static isConnected = false;

  static connect() {
    this.isConnected = true;
  }

  static disconnect() {
    this.isConnected = false;
  }

  static getStatus() {
    return this.isConnected;
  }
}

export class EventEngine {
  static processNotification(item: NotificationItem) {
    const config = EventRegistry.getConfig(item.type);
    const deepLinkUrl = NotificationRouter.resolveRoute(item);

    return {
      config,
      deepLinkUrl,
    };
  }
}
