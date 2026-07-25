import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { ServiceRequestListItem, ServiceRequestsResponse } from './types/dashboard.types';

export interface ServiceRequestQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  serviceCategoryId?: string;
  vendorId?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const serviceRequestsApi = {
  /**
   * Fetches Platform-Wide Service Requests with search, filter, pagination, and sorting
   */
  async getAllRequests(params: ServiceRequestQueryParams): Promise<ServiceRequestsResponse> {
    const cleanParams: Record<string, string | number> = {};

    if (params.search) cleanParams.search = params.search;
    if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
    if (params.priority && params.priority !== 'ALL') cleanParams.priority = params.priority;
    if (params.serviceCategoryId) cleanParams.serviceCategoryId = params.serviceCategoryId;
    if (params.vendorId) cleanParams.vendorId = params.vendorId;
    if (params.customerId) cleanParams.customerId = params.customerId;
    if (params.startDate) cleanParams.startDate = params.startDate;
    if (params.endDate) cleanParams.endDate = params.endDate;
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.sortBy) cleanParams.sortBy = params.sortBy;
    if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

    const response = await apiClient.get<ApiResponse<unknown>>('/admin/service-requests', {
      params: cleanParams,
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
};
