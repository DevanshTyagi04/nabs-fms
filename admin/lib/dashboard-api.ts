import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import {
  ActivityFeedResponse,
  ActivityListItem,
  DashboardSummaryData,
  HealthCheckResponse,
  RevenueAnalyticsResponse,
  ServiceAnalyticsResponse,
  ServiceRequestListItem,
  ServiceRequestsResponse,
} from './types/dashboard.types';

export const dashboardApi = {
  /**
   * Fetches Executive Platform Summary Metrics (Users, Service Requests, Financials, Surveys, Work Orders)
   */
  async getSummaryMetrics(): Promise<DashboardSummaryData> {
    const response = await apiClient.get<ApiResponse<DashboardSummaryData>>('/admin/reports/dashboard');
    return response.data.data;
  },

  /**
   * Fetches Recent Service Requests platform-wide
   */
  async getRecentServiceRequests(limit = 5): Promise<ServiceRequestsResponse> {
    const response = await apiClient.get<ApiResponse<unknown>>('/admin/service-requests', {
      params: {
        page: 1,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    });

    const rawData = response.data.data;
    if (Array.isArray(rawData)) {
      return { data: rawData as ServiceRequestListItem[] };
    }
    if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      const obj = rawData as { data: ServiceRequestListItem[]; meta?: ServiceRequestsResponse['meta'] };
      if (Array.isArray(obj.data)) {
        return { data: obj.data, meta: obj.meta };
      }
    }
    if (rawData && typeof rawData === 'object' && 'items' in rawData) {
      const obj = rawData as { items: ServiceRequestListItem[]; meta?: ServiceRequestsResponse['meta'] };
      if (Array.isArray(obj.items)) {
        return { data: obj.items, meta: obj.meta };
      }
    }
    return { data: [] };
  },

  /**
   * Fetches Service Request Status & Lifecycle Analytics
   */
  async getServiceAnalytics(): Promise<ServiceAnalyticsResponse> {
    const response = await apiClient.get<ApiResponse<ServiceAnalyticsResponse>>('/admin/reports/services');
    return response.data.data;
  },

  /**
   * Fetches Financial & Revenue Analytics
   */
  async getRevenueAnalytics(): Promise<RevenueAnalyticsResponse> {
    const response = await apiClient.get<ApiResponse<RevenueAnalyticsResponse>>('/admin/reports/revenue');
    return response.data.data;
  },

  /**
   * Fetches System Activity Timeline Feed
   */
  async getActivityFeed(limit = 5): Promise<ActivityFeedResponse> {
    const response = await apiClient.get<ApiResponse<unknown>>('/admin/activity', {
      params: {
        page: 1,
        limit,
      },
    });

    const rawData = response.data.data;
    if (Array.isArray(rawData)) {
      return { data: rawData as ActivityListItem[] };
    }
    if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      const obj = rawData as { data: ActivityListItem[]; meta?: ActivityFeedResponse['meta'] };
      if (Array.isArray(obj.data)) {
        return { data: obj.data, meta: obj.meta };
      }
    }
    if (rawData && typeof rawData === 'object' && 'items' in rawData) {
      const obj = rawData as { items: ActivityListItem[]; meta?: ActivityFeedResponse['meta'] };
      if (Array.isArray(obj.items)) {
        return { data: obj.items, meta: obj.meta };
      }
    }
    return { data: [] };
  },

  /**
   * Fetches Platform Health Probe Status
   */
  async getHealthStatus(): Promise<HealthCheckResponse> {
    const response = await apiClient.get<HealthCheckResponse>('/health');
    return response.data;
  },
};
