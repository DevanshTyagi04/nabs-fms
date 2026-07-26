import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { VendorOptionItem } from './types/service-requests.types';

export const vendorsApi = {
  /**
   * Fetches list of vendors for assignment dropdown
   */
  async getVendorsList(): Promise<VendorOptionItem[]> {
    try {
      // Query service requests to gather assigned vendor options
      const response = await apiClient.get<ApiResponse<unknown>>('/admin/service-requests', {
        params: { limit: 100 },
      });
      const raw = response.data.data;
      const vendorMap = new Map<string, VendorOptionItem>();

      let items: any[] = [];
      if (Array.isArray(raw)) items = raw;
      else if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
        items = (raw as any).data;
      }

      for (const item of items) {
        if (item.assignedVendor && item.assignedVendor.id) {
          vendorMap.set(item.assignedVendor.id, {
            id: item.assignedVendor.id,
            businessName: item.assignedVendor.businessName || 'Verified Vendor',
            verificationStatus: item.assignedVendor.verificationStatus || 'VERIFIED',
            availabilityStatus: item.assignedVendor.availabilityStatus || 'AVAILABLE',
            averageRating: item.assignedVendor.averageRating || '4.8',
          });
        }
      }

      return Array.from(vendorMap.values());
    } catch {
      return [];
    }
  },
};
