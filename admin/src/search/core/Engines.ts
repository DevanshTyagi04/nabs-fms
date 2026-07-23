import { SearchScopeConfig, SearchResultItem } from './types';

export class SearchRegistry {
  private static scopeMap: Record<string, SearchScopeConfig> = {
    ALL: { scope: 'ALL', label: 'All Platform Scopes', icon: 'grid', routePrefix: '/' },
    SERVICE_REQUESTS: { scope: 'SERVICE_REQUESTS', label: 'Service Requests', icon: 'briefcase', routePrefix: '/service-requests' },
    SURVEYS: { scope: 'SURVEYS', label: 'Technical Surveys', icon: 'file-text', routePrefix: '/surveys' },
    ESTIMATES: { scope: 'ESTIMATES', label: 'Estimate Quotations', icon: 'file-text', routePrefix: '/estimates' },
    WORK_ORDERS: { scope: 'WORK_ORDERS', label: 'Work Orders', icon: 'briefcase', routePrefix: '/work-orders' },
    INVOICES: { scope: 'INVOICES', label: 'Invoice Statements', icon: 'file-text', routePrefix: '/invoices' },
    PAYMENTS: { scope: 'PAYMENTS', label: 'Payment Receipts', icon: 'briefcase', routePrefix: '/payments' },
    NOTIFICATIONS: { scope: 'NOTIFICATIONS', label: 'Platform Events', icon: 'bell', routePrefix: '/notifications' },
  };

  static getConfig(scope: string): SearchScopeConfig {
    return this.scopeMap[scope] || { scope, label: scope, icon: 'search', routePrefix: '/' };
  }
}

export class FilterEngine {
  static buildFilterParams(searchQuery: string, statusFilter?: string): Record<string, any> {
    const params: Record<string, any> = {};
    if (searchQuery) params.search = searchQuery;
    if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
    return params;
  }
}

export class SortEngine {
  static formatSort(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc'): { sortBy: string; sortOrder: 'asc' | 'desc' } {
    return {
      sortBy: sortBy || 'updatedAt',
      sortOrder,
    };
  }
}

export class SearchNavigator {
  static resolveRoute(item: SearchResultItem): string {
    switch (item.entityType) {
      case 'SERVICE_REQUEST':
        return `/service-requests?id=${item.id}`;
      case 'SURVEY':
        return `/surveys?id=${item.id}`;
      case 'ESTIMATE':
        return `/estimates?id=${item.id}`;
      case 'WORK_ORDER':
        return `/work-orders?id=${item.id}`;
      case 'INVOICE':
        return `/invoices?id=${item.id}`;
      case 'PAYMENT':
        return `/payments?id=${item.id}`;
      case 'NOTIFICATION':
        return `/notifications?id=${item.id}`;
      default:
        return '/';
    }
  }
}

export class SearchEngine {
  static evaluateResult(item: SearchResultItem) {
    const route = SearchNavigator.resolveRoute(item);
    return {
      route,
      formattedDate: new Date(item.updatedAt).toLocaleDateString(),
    };
  }
}
