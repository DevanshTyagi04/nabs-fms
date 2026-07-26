export type SurveyStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';

export type SurveySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface SurveyListItem {
  id: string;
  serviceRequestId: string;
  version: number;
  status: SurveyStatus;
  notes?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  highestSeverity?: SurveySeverity;
  serviceRequest?: {
    ticketNumber: string;
    title: string;
    status: string;
    serviceCategory?: {
      name: string;
    } | null;
    customer?: {
      firstName: string;
      lastName: string;
      companyName?: string | null;
      user?: {
        email: string;
      } | null;
    } | null;
  } | null;
  vendor?: {
    id: string;
    businessName: string;
    companyName?: string | null;
  } | null;
  _count?: {
    items: number;
    attachments: number;
  };
}

export interface SurveyQueryParams {
  search?: string;
  status?: string;
  severity?: string;
  serviceRequestId?: string;
  vendorId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SurveysListResponse {
  data: SurveyListItem[];
  meta?: {
    total?: number;
    totalItems?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
