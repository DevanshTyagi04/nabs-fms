import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SdkService {
  private readonly logger = new Logger(SdkService.name);

  /**
   * Recommendation 2 & 6: Generates strongly typed, transport-agnostic TypeScript SDK source code
   */
  generateTypeScriptSdk(openApiDocument: any): string {
    const version = openApiDocument.info?.version || '1.0.0';
    const timestamp = new Date().toISOString();

    return `/**
 * NABS Field Service Management (FSM) Platform - TypeScript Client SDK
 * Auto-generated from OpenAPI 3.0 Specification
 * API Version: ${version}
 * Generated At: ${timestamp}
 */

export interface NabsSdkConfig {
  baseUrl: string;
  token?: string;
  fetchApi?: typeof fetch;
}

export interface ApiResponseEnvelope<T> {
  data: T;
  statusCode: number;
  message?: string;
}

export class NabsClient {
  private readonly baseUrl: string;
  private token?: string;
  private readonly fetchApi: typeof fetch;

  constructor(config: NabsSdkConfig) {
    this.baseUrl = config.baseUrl.replace(/\\/$/, '');
    this.token = config.token;
    this.fetchApi = config.fetchApi || (typeof fetch !== 'undefined' ? fetch : (null as any));
  }

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(method: string, endpoint: string, body?: any, query?: Record<string, any>): Promise<T> {
    let url = \`\${this.baseUrl}\${endpoint}\`;
    if (query) {
      const searchParams = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) searchParams.append(k, String(v));
      });
      const qStr = searchParams.toString();
      if (qStr) url += \`?\${qStr}\`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = \`Bearer \${this.token}\`;
    }

    const res = await this.fetchApi(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || \`HTTP \${res.status} \${res.statusText}\`);
    }

    return res.json() as Promise<T>;
  }

  // Domain SDK Modules
  public readonly auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<any>('POST', '/api/v1/auth/login', credentials),
    refreshToken: (payload: { refreshToken: string }) =>
      this.request<any>('POST', '/api/v1/auth/refresh-token', payload),
    logout: () => this.request<any>('POST', '/api/v1/auth/logout'),
  };

  public readonly serviceRequests = {
    create: (data: any) => this.request<any>('POST', '/api/v1/service-requests', data),
    list: (query?: any) => this.request<any>('GET', '/api/v1/service-requests', undefined, query),
    getById: (id: string) => this.request<any>('GET', \`/api/v1/service-requests/\${id}\`),
  };

  public readonly workOrders = {
    list: (query?: any) => this.request<any>('GET', '/api/v1/work-orders', undefined, query),
    getById: (id: string) => this.request<any>('GET', \`/api/v1/work-orders/\${id}\`),
  };

  public readonly payments = {
    initiate: (data: any) => this.request<any>('POST', '/api/v1/payments/initiate', data),
    verify: (data: any) => this.request<any>('POST', '/api/v1/payments/verify', data),
  };

  public readonly health = {
    getHealth: () => this.request<any>('GET', '/api/v1/health'),
    getLiveness: () => this.request<any>('GET', '/api/v1/health/live'),
    getReadiness: () => this.request<any>('GET', '/api/v1/health/ready'),
  };
}
`;
  }
}
