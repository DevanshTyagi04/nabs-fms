export interface SearchResultItemDomain {
  id: string;
  title: string;
  subtitle: string;
  entityType: 'SERVICE_REQUEST' | 'SURVEY' | 'ESTIMATE' | 'WORK_ORDER' | 'INVOICE' | 'PAYMENT' | 'NOTIFICATION';
  status?: string;
  referenceNumber: string;
  updatedAt: string;
}

export interface SearchFilters {
  query: string;
  scope: string;
  page: number;
  pageSize: number;
}

export interface SearchListResult {
  items: SearchResultItemDomain[];
  total: number;
}
