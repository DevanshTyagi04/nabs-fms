import { UserRole, DomainStatus } from '@nabs/shared-types';

export interface NabsSdkConfig {
  baseUrl: string;
  token?: string;
  fetchApi?: typeof fetch;
  onUnauthorized?: () => Promise<string | null>;
}

export interface ApiResponseEnvelope<T> {
  statusCode: number;
  message?: string;
  data: T;
  user?: any;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  status: string;
  customerProfileId?: string;
  vendorProfileId?: string;
  adminProfileId?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
}

export interface LoginResponseData {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RefreshTokenResponseData {
  tokens: AuthTokens;
}

export interface ServiceRequestItem {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customerId: string;
  assignedVendorId?: string;
  serviceAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyItemEntity {
  id: string;
  title: string;
  fieldType: string;
  value?: string;
  rating?: number;
  notes?: string;
  photoUrl?: string;
  isRequired: boolean;
}

export interface SurveyEntity {
  id: string;
  serviceRequestId: string;
  ticketNumber?: string;
  vendorId: string;
  vendorName?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  version: number;
  notes?: string;
  items: SurveyItemEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface EstimateItemEntity {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountAmount?: number;
  total: number;
}

export interface EstimateEntity {
  id: string;
  serviceRequestId: string;
  ticketNumber?: string;
  vendorId: string;
  vendorName?: string;
  customerId?: string;
  customerName?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  version: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  validUntil?: string;
  items: EstimateItemEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkTaskEntity {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkOrderEntity {
  id: string;
  workOrderNumber: string;
  serviceRequestId: string;
  estimateId: string;
  surveyId?: string;
  ticketNumber?: string;
  vendorId: string;
  vendorName?: string;
  customerId: string;
  customerName?: string;
  status: 'CREATED' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED';
  scheduledStartDate?: string;
  scheduledEndDate?: string;
  technicianName?: string;
  tasks: WorkTaskEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceEntity {
  id: string;
  invoiceNumber: string;
  workOrderId: string;
  estimateId?: string;
  serviceRequestId?: string;
  ticketNumber?: string;
  vendorId?: string;
  vendorName?: string;
  customerId: string;
  customerName?: string;
  status: 'DRAFT' | 'ISSUED' | 'SENT' | 'VIEWED' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountDue: number;
  dueDate: string;
  pdfUrl?: string;
  items: EstimateItemEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentEntity {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  workOrderId?: string;
  serviceRequestId?: string;
  ticketNumber?: string;
  vendorId?: string;
  vendorName?: string;
  customerId: string;
  customerName?: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  paymentMethod?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StorageMetadataEntity {
  key: string;
  originalName: string;
  contentType: string;
  size: number;
  category: string;
  publicUrl?: string;
  createdAt?: string;
}

export interface ActivityEntity {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  category: string;
  entityType: string;
  entityId: string;
  description: string;
  changes?: Record<string, any>;
  createdAt: string;
}

export interface DashboardMetricsEntity {
  totalRevenue: number;
  activeWorkOrders: number;
  completedServices: number;
  paymentSettlementRate: number;
  revenueGrowthPercent: number;
  workOrderCompletionRate: number;
}

export interface QueueMetricsEntity {
  name: string;
  active: number;
  waiting: number;
  completed: number;
  failed: number;
  delayed: number;
}

export class NabsClient {
  private baseUrl: string;
  private token?: string;
  private fetchApi: typeof fetch;
  private onUnauthorized?: () => Promise<string | null>;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

  constructor(config: NabsSdkConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.token = config.token;
    const rawFetch = config.fetchApi || (typeof fetch !== 'undefined' ? fetch : (null as any));
    this.fetchApi = typeof rawFetch === 'function' ? rawFetch.bind(globalThis) : rawFetch;
    this.onUnauthorized = config.onUnauthorized;
  }

  public setToken(token?: string) {
    this.token = token;
  }

  public getToken(): string | undefined {
    return this.token;
  }

  public setOnUnauthorized(callback?: () => Promise<string | null>) {
    this.onUnauthorized = callback;
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach((promise) => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    query?: Record<string, any>,
    isRetry = false
  ): Promise<T> {
    let url = `${this.baseUrl}${endpoint}`;
    if (query) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.append(k, String(v));
      });
      const qStr = searchParams.toString();
      if (qStr) url += `?${qStr}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await this.fetchApi(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && !isRetry && this.onUnauthorized && !endpoint.includes('/auth/login')) {
      if (this.isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          this.token = newToken;
          return this.request<T>(method, endpoint, body, query, true);
        });
      }

      this.isRefreshing = true;

      try {
        const newToken = await this.onUnauthorized();
        if (newToken) {
          this.token = newToken;
          this.processQueue(null, newToken);
          return this.request<T>(method, endpoint, body, query, true);
        } else {
          this.processQueue(new Error('Token refresh failed'));
          throw new Error('Unauthorized');
        }
      } catch (refreshErr) {
        this.processQueue(refreshErr);
        throw refreshErr;
      } finally {
        this.isRefreshing = false;
      }
    }

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const errorMessage = errBody.message || errBody.error || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }

  // Domain SDK Modules matching backend OpenAPI specification
  public readonly auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<ApiResponseEnvelope<LoginResponseData>>('POST', '/api/v1/auth/login', credentials),

    refreshToken: (payload: { refreshToken: string }) =>
      this.request<ApiResponseEnvelope<RefreshTokenResponseData>>('POST', '/api/v1/auth/refresh', payload),

    logout: (payload?: { refreshToken?: string; allDevices?: boolean }) =>
      this.request<ApiResponseEnvelope<null>>('POST', '/api/v1/auth/logout', payload),

    getMe: () =>
      this.request<ApiResponseEnvelope<{ user: AuthUser }>>('GET', '/api/v1/auth/me'),
  };

  public readonly serviceRequests = {
    create: (dto: { title: string; description: string; category: string; priority?: string; serviceAddress?: string }) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', '/api/v1/service-requests', dto),

    getMyRequests: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ServiceRequestItem[]; total: number }>>('GET', '/api/v1/service-requests/my-requests', undefined, query),

    getByIdCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('GET', `/api/v1/service-requests/${id}`),

    cancelCustomer: (id: string, remarks?: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/service-requests/${id}/cancel`, { remarks }),

    getAssignedVendor: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ServiceRequestItem[]; total: number }>>('GET', '/api/v1/vendor/service-requests', undefined, query),

    getByIdVendor: (id: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('GET', `/api/v1/vendor/service-requests/${id}`),

    acceptVendor: (id: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/vendor/service-requests/${id}/accept`),

    rejectVendor: (id: string, reason?: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/vendor/service-requests/${id}/reject`, { reason }),

    getAllAdmin: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ServiceRequestItem[]; total: number }>>('GET', '/api/v1/admin/service-requests', undefined, query),

    getByIdAdmin: (id: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('GET', `/api/v1/admin/service-requests/${id}`),

    assignVendorAdmin: (id: string, dto: { vendorId: string; notes?: string }) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/admin/service-requests/${id}/assign`, dto),

    changeStatusAdmin: (id: string, dto: { status: string; remarks?: string }) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/admin/service-requests/${id}/status`, dto),
  };

  public readonly surveys = {
    getAllAdmin: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: SurveyEntity[]; total: number }>>('GET', '/api/v1/admin/surveys', undefined, query),

    getByIdAdmin: (id: string) =>
      this.request<ApiResponseEnvelope<SurveyEntity>>('GET', `/api/v1/admin/surveys/${id}`),

    reviewAdmin: (id: string, dto: { status: 'APPROVED' | 'REJECTED'; remarks?: string }) =>
      this.request<ApiResponseEnvelope<SurveyEntity>>('POST', `/api/v1/admin/surveys/${id}/review`, dto),

    addCommentAdmin: (id: string, dto: { comment: string }) =>
      this.request<ApiResponseEnvelope<any>>('POST', `/api/v1/admin/surveys/${id}/comments`, dto),

    createDraftVendor: (dto: { serviceRequestId: string; notes?: string }) =>
      this.request<ApiResponseEnvelope<SurveyEntity>>('POST', '/api/v1/vendor/surveys', dto),

    getVendorSurveys: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: SurveyEntity[]; total: number }>>('GET', '/api/v1/vendor/surveys', undefined, query),

    getByIdVendor: (id: string) =>
      this.request<ApiResponseEnvelope<SurveyEntity>>('GET', `/api/v1/vendor/surveys/${id}`),

    addItemVendor: (id: string, dto: { title: string; fieldType: string; isRequired?: boolean; rating?: number; value?: string }) =>
      this.request<ApiResponseEnvelope<SurveyItemEntity>>('POST', `/api/v1/vendor/surveys/${id}/items`, dto),

    submitVendor: (id: string) =>
      this.request<ApiResponseEnvelope<SurveyEntity>>('POST', `/api/v1/vendor/surveys/${id}/submit`),

    getCustomerSurveys: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: SurveyEntity[]; total: number }>>('GET', '/api/v1/customer/surveys', undefined, query),

    getByIdCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<SurveyEntity>>('GET', `/api/v1/customer/surveys/${id}`),
  };

  public readonly estimates = {
    getAllAdmin: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: EstimateEntity[]; total: number }>>('GET', '/api/v1/admin/estimates', undefined, query),

    getByIdAdmin: (id: string) =>
      this.request<ApiResponseEnvelope<EstimateEntity>>('GET', `/api/v1/admin/estimates/${id}`),

    addCommentAdmin: (id: string, dto: { comment: string }) =>
      this.request<ApiResponseEnvelope<any>>('POST', `/api/v1/admin/estimates/${id}/comments`, dto),

    createDraftVendor: (dto: { serviceRequestId: string; validUntil?: string }) =>
      this.request<ApiResponseEnvelope<EstimateEntity>>('POST', '/api/v1/vendor/estimates', dto),

    getVendorEstimates: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: EstimateEntity[]; total: number }>>('GET', '/api/v1/vendor/estimates', undefined, query),

    getByIdVendor: (id: string) =>
      this.request<ApiResponseEnvelope<EstimateEntity>>('GET', `/api/v1/vendor/estimates/${id}`),

    addItemVendor: (id: string, dto: { description: string; quantity: number; unitPrice: number; taxRate?: number; discountAmount?: number }) =>
      this.request<ApiResponseEnvelope<EstimateItemEntity>>('POST', `/api/v1/vendor/estimates/${id}/items`, dto),

    submitVendor: (id: string) =>
      this.request<ApiResponseEnvelope<EstimateEntity>>('POST', `/api/v1/vendor/estimates/${id}/submit`),

    getCustomerEstimates: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: EstimateEntity[]; total: number }>>('GET', '/api/v1/customer/estimates', undefined, query),

    getByIdCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<EstimateEntity>>('GET', `/api/v1/customer/estimates/${id}`),

    approveCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<EstimateEntity>>('POST', `/api/v1/customer/estimates/${id}/approve`),

    rejectCustomer: (id: string, dto?: { reason?: string }) =>
      this.request<ApiResponseEnvelope<EstimateEntity>>('POST', `/api/v1/customer/estimates/${id}/reject`, dto),
  };

  public readonly workOrders = {
    createAdmin: (dto: { estimateId: string; scheduledStartDate?: string; scheduledEndDate?: string; technicianName?: string }) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('POST', '/api/v1/admin/work-orders', dto),

    getAllAdmin: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: WorkOrderEntity[]; total: number }>>('GET', '/api/v1/admin/work-orders', undefined, query),

    getByIdAdmin: (id: string) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('GET', `/api/v1/admin/work-orders/${id}`),

    verifyAdmin: (id: string, remarks?: string) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('POST', `/api/v1/admin/work-orders/${id}/verify`, { remarks }),

    cancelAdmin: (id: string, reason?: string) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('POST', `/api/v1/admin/work-orders/${id}/cancel`, { reason }),

    getVendorWorkOrders: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: WorkOrderEntity[]; total: number }>>('GET', '/api/v1/vendor/work-orders', undefined, query),

    getByIdVendor: (id: string) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('GET', `/api/v1/vendor/work-orders/${id}`),

    startVendor: (id: string) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('POST', `/api/v1/vendor/work-orders/${id}/start`),

    pauseVendor: (id: string, dto: { reason: string }) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('POST', `/api/v1/vendor/work-orders/${id}/pause`, dto),

    resumeVendor: (id: string) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('POST', `/api/v1/vendor/work-orders/${id}/resume`),

    completeVendor: (id: string) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('POST', `/api/v1/vendor/work-orders/${id}/complete`),

    addTaskVendor: (id: string, dto: { title: string; description?: string }) =>
      this.request<ApiResponseEnvelope<WorkTaskEntity>>('POST', `/api/v1/vendor/work-orders/${id}/tasks`, dto),

    updateTaskVendor: (id: string, taskId: string, dto: { isCompleted: boolean }) =>
      this.request<ApiResponseEnvelope<WorkTaskEntity>>('PATCH', `/api/v1/vendor/work-orders/${id}/tasks/${taskId}`, dto),

    getCustomerWorkOrders: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: WorkOrderEntity[]; total: number }>>('GET', '/api/v1/customer/work-orders', undefined, query),

    getByIdCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<WorkOrderEntity>>('GET', `/api/v1/customer/work-orders/${id}`),
  };

  public readonly invoices = {
    generateAdmin: (dto: { paymentId?: string; workOrderId?: string }) =>
      this.request<ApiResponseEnvelope<InvoiceEntity>>('POST', '/api/v1/admin/invoices/generate', dto),

    getAllAdmin: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: InvoiceEntity[]; total: number }>>('GET', '/api/v1/admin/invoices', undefined, query),

    getByIdAdmin: (id: string) =>
      this.request<ApiResponseEnvelope<InvoiceEntity>>('GET', `/api/v1/admin/invoices/${id}`),

    cancelAdmin: (id: string, reason?: string) =>
      this.request<ApiResponseEnvelope<InvoiceEntity>>('POST', `/api/v1/admin/invoices/${id}/cancel`, { reason }),

    regeneratePdfAdmin: (id: string) =>
      this.request<ApiResponseEnvelope<{ pdfUrl: string }>>('POST', `/api/v1/admin/invoices/${id}/regenerate-pdf`),

    getCustomerInvoices: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: InvoiceEntity[]; total: number }>>('GET', '/api/v1/customer/invoices', undefined, query),

    getByIdCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<InvoiceEntity>>('GET', `/api/v1/customer/invoices/${id}`),

    downloadPdfCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<{ pdfUrl: string }>>('GET', `/api/v1/customer/invoices/${id}/download`),
  };

  public readonly payments = {
    initiateCustomer: (dto: { serviceRequestId: string; amount?: number }) =>
      this.request<ApiResponseEnvelope<PaymentEntity>>('POST', '/api/v1/customer/payments/initiate', dto),

    verifyCustomer: (dto: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
      this.request<ApiResponseEnvelope<PaymentEntity>>('POST', '/api/v1/customer/payments/verify', dto),

    getCustomerPayments: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: PaymentEntity[]; total: number }>>('GET', '/api/v1/customer/payments', undefined, query),

    getByIdCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<PaymentEntity>>('GET', `/api/v1/customer/payments/${id}`),

    getAllAdmin: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: PaymentEntity[]; total: number }>>('GET', '/api/v1/admin/payments', undefined, query),

    getByIdAdmin: (id: string) =>
      this.request<ApiResponseEnvelope<PaymentEntity>>('GET', `/api/v1/admin/payments/${id}`),

    reconcileAdmin: (id: string, dto: { status: 'SUCCESS' | 'REFUNDED'; notes?: string }) =>
      this.request<ApiResponseEnvelope<PaymentEntity>>('POST', `/api/v1/admin/payments/${id}/reconcile`, dto),
  };

  public readonly notifications = {
    getMyNotifications: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: NotificationEntity[]; total: number }>>('GET', '/api/v1/notifications', undefined, query),

    getUnreadCount: () =>
      this.request<ApiResponseEnvelope<{ count: number }>>('GET', '/api/v1/notifications/unread-count'),

    getById: (id: string) =>
      this.request<ApiResponseEnvelope<NotificationEntity>>('GET', `/api/v1/notifications/${id}`),

    markAsRead: (id: string) =>
      this.request<ApiResponseEnvelope<NotificationEntity>>('POST', `/api/v1/notifications/${id}/read`),

    markAllAsRead: () =>
      this.request<ApiResponseEnvelope<{ count: number }>>('POST', '/api/v1/notifications/read-all'),

    getAllAdmin: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: NotificationEntity[]; total: number }>>('GET', '/api/v1/admin/notifications', undefined, query),
  };

  public readonly storage = {
    getSignedUrl: (fileKey: string) =>
      this.request<ApiResponseEnvelope<{ signedUrl: string; fileKey: string }>>('GET', '/api/v1/storage/signed-url', undefined, { fileKey }),

    getMetadata: (fileKey: string) =>
      this.request<ApiResponseEnvelope<StorageMetadataEntity>>('GET', `/api/v1/storage/metadata/${fileKey}`),

    checkHealth: () =>
      this.request<ApiResponseEnvelope<{ status: string; provider: string }>>('GET', '/api/v1/storage/health'),

    deleteFileAdmin: (fileKey: string) =>
      this.request<ApiResponseEnvelope<{ deleted: boolean; fileKey: string }>>('DELETE', `/api/v1/storage/${fileKey}`),
  };

  public readonly search = {
    serviceRequests: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ServiceRequestItem[]; total: number }>>('GET', '/api/v1/search/service-requests', undefined, query),

    surveys: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: SurveyEntity[]; total: number }>>('GET', '/api/v1/search/surveys', undefined, query),

    estimates: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: EstimateEntity[]; total: number }>>('GET', '/api/v1/search/estimates', undefined, query),

    workOrders: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: WorkOrderEntity[]; total: number }>>('GET', '/api/v1/search/work-orders', undefined, query),

    invoices: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: InvoiceEntity[]; total: number }>>('GET', '/api/v1/search/invoices', undefined, query),

    payments: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: PaymentEntity[]; total: number }>>('GET', '/api/v1/search/payments', undefined, query),

    notifications: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: NotificationEntity[]; total: number }>>('GET', '/api/v1/search/notifications', undefined, query),
  };

  public readonly activity = {
    getAdminTimeline: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ActivityEntity[]; total: number }>>('GET', '/api/v1/admin/activity', undefined, query),

    getEntityHistory: (entity: string, id: string) =>
      this.request<ApiResponseEnvelope<ActivityEntity[]>>('GET', `/api/v1/admin/activity/entity/${entity}/${id}`),

    getVendorTimeline: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ActivityEntity[]; total: number }>>('GET', '/api/v1/vendor/activity', undefined, query),

    getCustomerTimeline: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ActivityEntity[]; total: number }>>('GET', '/api/v1/customer/activity', undefined, query),
  };

  public readonly reports = {
    getAdminDashboard: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<DashboardMetricsEntity>>('GET', '/api/v1/admin/reports/dashboard', undefined, query),

    getRevenueReports: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ totalRevenue: number; breakdown: any[] }>>('GET', '/api/v1/admin/reports/revenue', undefined, query),

    getServiceReports: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ totalServices: number; breakdown: any[] }>>('GET', '/api/v1/admin/reports/services', undefined, query),

    getPaymentReports: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ totalPayments: number; breakdown: any[] }>>('GET', '/api/v1/admin/reports/payments', undefined, query),

    getWorkOrderReports: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ totalWorkOrders: number; breakdown: any[] }>>('GET', '/api/v1/admin/reports/work-orders', undefined, query),

    getVendorDashboard: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ totalJobs: number; earned: number }>>('GET', '/api/v1/vendor/reports/dashboard', undefined, query),

    getCustomerDashboard: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ totalRequests: number; spent: number }>>('GET', '/api/v1/customer/reports/dashboard', undefined, query),
  };

  public readonly jobs = {
    getQueueStats: () =>
      this.request<ApiResponseEnvelope<QueueMetricsEntity[]>>('GET', '/api/v1/admin/jobs/stats'),
  };
}
