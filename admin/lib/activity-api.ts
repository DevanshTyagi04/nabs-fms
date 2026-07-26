import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { ActivityTimelineItem } from './types/service-requests.types';

export const activityApi = {
  /**
   * Fetches complete lifecycle history for specific entity instance (e.g. entity: 'ServiceRequest', entityId: requestId)
   */
  async getEntityHistory(entity: string, entityId: string): Promise<ActivityTimelineItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>(`/admin/activity/entity/${entity}/${entityId}`);
      const raw = response.data.data;
      if (Array.isArray(raw)) {
        return raw as ActivityTimelineItem[];
      }
      return [];
    } catch {
      return [];
    }
  },
};
