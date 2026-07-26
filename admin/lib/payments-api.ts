import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { PaymentSummary } from './types/service-requests.types';

export const paymentsApi = {
  /**
   * Fetches payments associated with a Service Request ID
   */
  async getPaymentsByRequestId(requestId: string): Promise<PaymentSummary[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/admin/payments', {
        params: { serviceRequestId: requestId },
      });
      const raw = response.data.data;
      if (Array.isArray(raw)) {
        return raw as PaymentSummary[];
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
        return (raw as any).data as PaymentSummary[];
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Reconciles payment manually (Admin)
   */
  async reconcilePayment(paymentId: string, status: 'SUCCESS' | 'REFUNDED', remarks?: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/payments/${paymentId}/reconcile`, {
      status,
      remarks,
    });
    return response.data;
  },
};
