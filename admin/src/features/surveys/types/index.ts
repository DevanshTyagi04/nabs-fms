import { FormDefinition, FormResponseMap } from '@/forms/engine/types';

export type SurveyStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface SurveyItem {
  id: string;
  title: string;
  fieldType: string;
  value?: string;
  rating?: number;
  notes?: string;
  photoUrl?: string;
  isRequired: boolean;
}

export interface Survey {
  id: string;
  serviceRequestId: string;
  ticketNumber: string;
  title: string;
  vendorId: string;
  vendorName: string;
  status: SurveyStatus;
  version: number;
  notes?: string;
  items: SurveyItem[];
  formDefinition: FormDefinition;
  responses: FormResponseMap;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyFilters {
  search?: string;
  status?: string;
  vendorId?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewSurveyDto {
  status: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

export interface SurveyListResult {
  items: Survey[];
  total: number;
}
