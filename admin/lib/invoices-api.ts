import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { InvoiceSummary } from './types/service-requests.types';

export const invoicesApi = {
  /**
   * Fetches invoices associated with a Service Request ID
   */
  async getInvoicesByRequestId(requestId: string): Promise<InvoiceSummary[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/admin/invoices', {
        params: { serviceRequestId: requestId },
      });
      const raw = response.data.data;
      if (Array.isArray(raw)) {
        return raw as InvoiceSummary[];
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
        return (raw as any).data as InvoiceSummary[];
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Generates invoice for successful payment
   */
  async generateInvoice(paymentId: string) {
    const response = await apiClient.post<ApiResponse<unknown>>('/admin/invoices/generate', {
      paymentId,
    });
    return response.data;
  },
};
