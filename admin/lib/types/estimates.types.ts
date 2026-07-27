// ============================================================
// Estimates Module — Type Definitions
// Source of truth: backend analysis of estimates.service.ts
// ============================================================

export type EstimateStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISED'
  | 'SUPERSEDED';

// Valid sortBy fields — must be whitelisted to prevent Prisma runtime errors
export const ESTIMATE_SORT_FIELDS = ['createdAt', 'totalAmount', 'version', 'updatedAt'] as const;
export type EstimateSortField = (typeof ESTIMATE_SORT_FIELDS)[number];

export interface EstimateQueryParams {
  search?: string;
  status?: EstimateStatus | 'ALL';
  serviceRequestId?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
  sortBy?: EstimateSortField;
  sortOrder?: 'asc' | 'desc';
}

// Shape returned by GET /admin/estimates (list)
export interface EstimateListItem {
  id: string;
  serviceRequestId: string;
  version: number;
  status: EstimateStatus;
  subtotal: string | number;
  taxAmount: string | number;
  discountAmount: string | number;
  totalAmount: string | number;
  validUntil: string | null;
  createdAt: string;
  serviceRequest: {
    ticketNumber: string;
    title: string;
    customer: {
      firstName: string;
      lastName: string;
    };
    assignedVendor: {
      businessName: string;
    } | null;
  };
  _count: {
    items: number;
  };
}

// Paginated list response
export interface EstimatesListResponse {
  data: EstimateListItem[];
  meta?: {
    total?: number;
    totalItems?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
