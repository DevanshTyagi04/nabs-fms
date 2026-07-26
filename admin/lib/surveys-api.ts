import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { SurveySummary } from './types/service-requests.types';

export const surveysApi = {
  /**
   * Fetches technical surveys associated with a Service Request ID
   */
  async getSurveysByRequestId(requestId: string): Promise<SurveySummary[]> {
    try {
      const response = await apiClient.get<ApiResponse<unknown>>('/admin/surveys', {
        params: { serviceRequestId: requestId },
      });
      const raw = response.data.data;
      if (Array.isArray(raw)) {
        return raw as SurveySummary[];
      }
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as any).data)) {
        return (raw as any).data as SurveySummary[];
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Reviews (Approves or Rejects) a technical survey
   */
  async reviewSurvey(surveyId: string, action: 'APPROVE' | 'REJECT', remarks?: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/surveys/${surveyId}/review`, {
      action,
      remarks,
    });
    return response.data;
  },
};
