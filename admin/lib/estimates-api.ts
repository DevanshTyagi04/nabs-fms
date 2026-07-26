import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { EstimateSummary } from './types/service-requests.types';

export const estimatesApi = {
  /**
   * Fetches financial estimates associated with a Service Request ID
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
