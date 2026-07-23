export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  entityType: 'SERVICE_REQUEST' | 'SURVEY' | 'ESTIMATE' | 'WORK_ORDER' | 'INVOICE' | 'PAYMENT' | 'NOTIFICATION';
  status?: string;
  referenceNumber: string;
  updatedAt: string;
}

export interface SearchScopeConfig {
  scope: string;
  label: string;
  icon: string;
  routePrefix: string;
}

export interface SearchSession {
  query: string;
  scope: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
