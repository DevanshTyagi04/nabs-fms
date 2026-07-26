import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { WorkOrderSummary } from './types/service-requests.types';

export const workOrdersApi = {
  /**
   * Fetches work orders associated with a Service Request ID
   */
  async getWorkOrdersByRequestId(requestId: string): Promise<WorkOrderSummary[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/admin/work-orders', {
        params: { serviceRequestId: requestId },
      });
      const raw = response.data.data;
      if (Array.isArray(raw)) {
        return raw as WorkOrderSummary[];
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
        return (raw as any).data as WorkOrderSummary[];
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Verifies work order (Admin QA milestone)
   */
  async verifyWorkOrder(workOrderId: string, remarks?: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/work-orders/${workOrderId}/verify`, {
      remarks,
    });
    return response.data;
  },
};
