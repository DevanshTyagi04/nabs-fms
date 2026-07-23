import { WorkflowEvent } from '@/components/workflow/WorkflowTimeline';

export type ServiceRequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ServiceRequestStatus = 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ServiceRequest {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  customerId: string;
  customerName?: string;
  assignedVendorId?: string;
  assignedVendorName?: string;
  serviceAddress?: string;
  createdAt: string;
  updatedAt: string;
  history: WorkflowEvent[];
}

export interface ServiceRequestFilters {
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateServiceRequestDto {
  title: string;
  description: string;
  category: string;
  priority?: ServiceRequestPriority;
  serviceAddress?: string;
}

export interface AssignVendorDto {
  vendorId: string;
  notes?: string;
}

export interface ChangeStatusDto {
  status: ServiceRequestStatus;
  remarks?: string;
}

export interface ServiceRequestListResult {
  items: ServiceRequest[];
  total: number;
}
