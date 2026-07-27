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

export interface SurveyComment {
  id: string;
  comment: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
}

export interface SurveyAttachment {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  fileSize: number;
}

export interface SurveyItem {
  id: string;
  surveyId: string;
  area: string;
  element: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  isMandatory: boolean;
  photoRequired: boolean;
  observation: string;
  recommendedAction?: string | null;
  observedAt?: string | null;
  locationMetadata?: string | null;
  attachments?: SurveyAttachment[];
}

export interface SurveyDetail {
  id: string;
  serviceRequestId: string;
  vendorId?: string | null;
  version: number;
  status: SurveyStatus;
  notes?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items?: SurveyItem[];
  attachments?: SurveyAttachment[];
  comments?: SurveyComment[];
  serviceRequest?: {
    id: string;
    ticketNumber: string;
    title: string;
    status: string;
    serviceCategory?: {
      id: string;
      name: string;
    } | null;
    customer?: {
      id: string;
      firstName: string;
      lastName: string;
      companyName?: string | null;
      user?: {
        id: string;
        email: string;
        phone?: string | null;
      } | null;
    } | null;
  } | null;
  vendor?: {
    id: string;
    businessName: string;
    companyName?: string | null;
    averageRating?: string | number | null;
    verificationStatus?: string | null;
  } | null;
}

