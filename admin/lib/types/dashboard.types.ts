export interface DashboardSummaryData {
  period: string;
  summary: {
    users: {
      totalCustomers: number;
      totalVendors: number;
    };
    serviceRequests: {
      total: number;
      open: number;
      assigned: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
    surveys: {
      draft: number;
      submitted: number;
      approved: number;
      superseded: number;
    };
    estimates: {
      draft: number;
      pendingApproval: number;
      approved: number;
      rejected: number;
    };
    workOrders: {
      total: number;
      active: number;
      completed: number;
      cancelled: number;
    };
    financials: {
      successfulPayments: number;
      failedPayments: number;
      totalRevenue: string;
      outstandingAmount: string;
      invoicesIssued: number;
    };
    notifications: {
      unread: number;
    };
  };
}

export interface ServiceRequestListItem {
  id: string;
  ticketNumber: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'CREATED' | 'ASSIGNED' | 'SURVEY_PENDING' | 'SURVEY_SUBMITTED' | 'SURVEY_APPROVED' | 'ESTIMATE_CREATED' | 'AWAITING_APPROVAL' | 'ADVANCE_PENDING' | 'ADVANCE_RECEIVED' | 'SCHEDULED' | 'IN_PROGRESS' | 'WORK_COMPLETED' | 'QUALITY_CHECK' | 'FINAL_PAYMENT_PENDING' | 'COMPLETED' | 'ARCHIVED' | 'CANCELLED';
  createdAt: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string | null;
  } | null;
  assignedVendor?: {
    id: string;
    businessName: string;
  } | null;
}

export interface ServiceRequestsResponse {
  data: ServiceRequestListItem[];
  meta?: {
    totalItems: number;
    itemPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ActivityListItem {
  id: string;
  userId?: string | null;
  comment?: string;
  action?: string;
  details?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
  serviceRequest?: {
    ticketNumber: string;
  } | null;
}

export interface ActivityFeedResponse {
  data: ActivityListItem[];
  meta?: {
    totalItems: number;
    itemPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ServiceAnalyticsResponse {
  period: string;
  serviceRequestDistribution: Array<{ status: string; count: number }>;
  surveyDistribution: Array<{ status: string; count: number }>;
  estimateDistribution: Array<{ status: string; count: number }>;
}

export interface RevenueAnalyticsResponse {
  period: string;
  revenueSummary?: {
    totalRevenue?: string;
    successfulTransactions?: number;
    status?: string;
  };
  revenueByPaymentMethod?: Array<{
    paymentMethod: string;
    totalAmount: string;
    transactionCount: number;
  }> | { status: string };
  outstandingInvoices?: {
    totalOutstandingAmount?: string;
    issuedInvoiceCount?: number;
    status?: string;
  };
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: {
    status: string;
    latencyMs: number | null;
  };
}
