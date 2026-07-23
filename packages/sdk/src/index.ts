import { UserRole, DomainStatus } from '../../shared-types/src';

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
  history?: Array<{
    id: string;
    fromStatus?: string;
    toStatus: string;
    remarks?: string;
    changedById: string;
    createdAt: string;
  }>;
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
    this.fetchApi = config.fetchApi || (typeof fetch !== 'undefined' ? fetch : (null as any));
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
    // Customer
    create: (dto: { title: string; description: string; category: string; priority?: string; serviceAddress?: string }) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', '/api/v1/service-requests', dto),

    getMyRequests: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ServiceRequestItem[]; total: number }>>('GET', '/api/v1/service-requests/my-requests', undefined, query),

    getByIdCustomer: (id: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('GET', `/api/v1/service-requests/${id}`),

    cancelCustomer: (id: string, remarks?: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/service-requests/${id}/cancel`, { remarks }),

    // Vendor
    getAssignedVendor: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ServiceRequestItem[]; total: number }>>('GET', '/api/v1/vendor/service-requests', undefined, query),

    getByIdVendor: (id: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('GET', `/api/v1/vendor/service-requests/${id}`),

    acceptVendor: (id: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/vendor/service-requests/${id}/accept`),

    rejectVendor: (id: string, reason?: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/vendor/service-requests/${id}/reject`, { reason }),

    // Admin
    getAllAdmin: (query?: Record<string, any>) =>
      this.request<ApiResponseEnvelope<{ items: ServiceRequestItem[]; total: number }>>('GET', '/api/v1/admin/service-requests', undefined, query),

    getByIdAdmin: (id: string) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('GET', `/api/v1/admin/service-requests/${id}`),

    assignVendorAdmin: (id: string, dto: { vendorId: string; notes?: string }) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/admin/service-requests/${id}/assign`, dto),

    changeStatusAdmin: (id: string, dto: { status: string; remarks?: string }) =>
      this.request<ApiResponseEnvelope<ServiceRequestItem>>('POST', `/api/v1/admin/service-requests/${id}/status`, dto),
  };
}
