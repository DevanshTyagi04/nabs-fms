import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { EstimateSummary } from './types/service-requests.types';
import {
  EstimateListItem,
  EstimateQueryParams,
  EstimatesListResponse,
  ESTIMATE_SORT_FIELDS,
} from './types/estimates.types';

export const estimatesApi = {
  /**
   * Fetches all platform estimates with pagination, search, filters, and sorting.
   * sortBy is whitelisted to prevent Prisma runtime errors from invalid field names.
   */
  async getAllEstimates(params: EstimateQueryParams = {}): Promise<EstimatesListResponse> {
    const cleanParams: Record<string, string | number> = {};

    if (params.search?.trim()) cleanParams.search = params.search.trim();
    if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
    if (params.serviceRequestId) cleanParams.serviceRequestId = params.serviceRequestId;
    if (params.vendorId && params.vendorId !== 'ALL') cleanParams.vendorId = params.vendorId;
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    // Whitelist sortBy to prevent Prisma runtime errors on invalid field names
    if (params.sortBy && (ESTIMATE_SORT_FIELDS as readonly string[]).includes(params.sortBy)) {
      cleanParams.sortBy = params.sortBy;
    }
    if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

    const response = await apiClient.get<ApiResponse<unknown>>('/admin/estimates', {
      params: cleanParams,
    });

    const rawData = response.data.data;

    // Handle { data: [...], meta: {...} } shape
    if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      const obj = rawData as { data: EstimateListItem[]; meta?: EstimatesListResponse['meta'] };
      if (Array.isArray(obj.data)) {
        return { data: obj.data, meta: obj.meta };
      }
    }

    // Handle flat array shape
    if (Array.isArray(rawData)) {
      return { data: rawData as EstimateListItem[] };
    }

    return { data: [] };
  },

  /**
   * Fetches financial estimates associated with a Service Request ID.
   * Used by the Service Request detail page secondary data hook.
   */
  async getEstimatesByRequestId(requestId: string): Promise<EstimateSummary[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/admin/estimates', {
        params: { serviceRequestId: requestId },
      });
      const raw = response.data.data;
      if (Array.isArray(raw)) {
        return raw as EstimateSummary[];
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
        return (raw as any).data as EstimateSummary[];
      }
      return [];
    } catch {
      return [];
    }
  },
};
