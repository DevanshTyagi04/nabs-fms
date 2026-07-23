import { FinancialLineItem, TotalsBreakdown } from '@/financial/core/types';

export type EstimateStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface Estimate {
  id: string;
  serviceRequestId: string;
  ticketNumber: string;
  title: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  status: EstimateStatus;
  version: number;
  validUntil?: string;
  items: FinancialLineItem[];
  totals: TotalsBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface EstimateFilters {
  search?: string;
  status?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface EstimateListResult {
  items: Estimate[];
  total: number;
}
