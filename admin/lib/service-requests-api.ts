import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { ServiceRequestListItem, ServiceRequestsResponse } from './types/dashboard.types';
import { ServiceRequestDetail } from './types/service-requests.types';

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

  /**
   * Fetches comprehensive details for a single Service Request by ID
   */
  async getRequestById(id: string): Promise<ServiceRequestDetail> {
    const response = await apiClient.get<ApiResponse<{ request: ServiceRequestDetail } | ServiceRequestDetail>>(
      `/admin/service-requests/${id}`
    );
    const raw = response.data.data;
    if (raw && typeof raw === 'object' && 'request' in raw) {
      return (raw as { request: ServiceRequestDetail }).request;
    }
    return raw as ServiceRequestDetail;
  },

  /**
   * Assigns vendor to Service Request
   */
  async assignVendor(id: string, vendorId: string, remarks?: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/service-requests/${id}/assign`, {
      vendorId,
      remarks,
    });
    return response.data;
  },

  /**
   * Reassigns vendor on Service Request
   */
  async reassignVendor(id: string, vendorId: string, remarks?: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/service-requests/${id}/reassign`, {
      vendorId,
      remarks,
    });
    return response.data;
  },

  /**
   * Changes status of Service Request via State Machine
   */
  async changeStatus(id: string, status: string, remarks?: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/service-requests/${id}/status`, {
      status,
      remarks,
    });
    return response.data;
  },

  /**
   * Adds internal staff note/comment
   */
  async addInternalNote(id: string, comment: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/service-requests/${id}/notes`, {
      comment,
    });
    return response.data;
  },

  /**
   * Uploads file attachment
   */
  async uploadAttachment(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<unknown>>(`/service-requests/${id}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Deletes file attachment
   */
  async deleteAttachment(id: string, attachmentId: string) {
    const response = await apiClient.delete<ApiResponse<unknown>>(
      `/service-requests/${id}/attachments/${attachmentId}`
    );
    return response.data;
  },
};
