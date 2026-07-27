import { apiClient } from './api-client';
import { ApiResponse } from './types/auth.types';
import { SurveySummary } from './types/service-requests.types';
import { SurveyListItem, SurveyQueryParams, SurveysListResponse, SurveyDetail } from './types/surveys.types';

export const surveysApi = {
  /**
   * Fetches all technical surveys with pagination, search, filters, and sorting
   */
  async getAllSurveys(params: SurveyQueryParams = {}): Promise<SurveysListResponse> {
    const cleanParams: Record<string, string | number> = {};

    if (params.search?.trim()) cleanParams.search = params.search.trim();
    if (params.status && params.status !== 'ALL') cleanParams.status = params.status;
    if (params.severity && params.severity !== 'ALL') cleanParams.severity = params.severity;
    if (params.vendorId && params.vendorId !== 'ALL') cleanParams.vendorId = params.vendorId;
    if (params.serviceRequestId) cleanParams.serviceRequestId = params.serviceRequestId;
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;
    if (params.sortBy) cleanParams.sortBy = params.sortBy;
    if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

    const response = await apiClient.get<ApiResponse<unknown>>('/admin/surveys', {
      params: cleanParams,
    });

    const rawData = response.data.data;
    if (Array.isArray(rawData)) {
      return { data: rawData as SurveyListItem[] };
    }
    if (rawData && typeof rawData === 'object' && 'data' in rawData) {
      const obj = rawData as { data: SurveyListItem[]; meta?: SurveysListResponse['meta'] };
      if (Array.isArray(obj.data)) {
        return { data: obj.data, meta: obj.meta };
      }
    }
    if (rawData && typeof rawData === 'object' && 'items' in rawData) {
      const obj = rawData as { items: SurveyListItem[]; meta?: SurveysListResponse['meta'] };
      if (Array.isArray(obj.items)) {
        return { data: obj.items, meta: obj.meta };
      }
    }

    return { data: [] };
  },

  /**
   * Fetches a single survey by ID
   */
  async getSurveyById(surveyId: string): Promise<SurveyDetail> {
    const response = await apiClient.get<ApiResponse<{ survey: SurveyDetail } | SurveyDetail>>(
      `/admin/surveys/${surveyId}`
    );
    const raw = response.data.data;
    if (raw && typeof raw === 'object' && 'survey' in raw) {
      return (raw as { survey: SurveyDetail }).survey;
    }
    return raw as SurveyDetail;
  },

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
  async reviewSurvey(surveyId: string, status: 'APPROVED' | 'REJECTED', remarks?: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/surveys/${surveyId}/review`, {
      status,
      remarks,
    });
    return response.data;
  },

  /**
   * Adds a comment to a survey
   */
  async addSurveyComment(surveyId: string, comment: string) {
    const response = await apiClient.post<ApiResponse<unknown>>(`/admin/surveys/${surveyId}/comments`, {
      comment,
    });
    return response.data;
  },
};
