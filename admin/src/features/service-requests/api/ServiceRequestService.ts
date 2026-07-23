import { ServiceRequestRepository } from './ServiceRequestRepository';
import { ServiceRequest, ServiceRequestFilters, ServiceRequestListResult, CreateServiceRequestDto } from '../types';
import { WorkflowStateMachine } from '@/workflow/engine';
import { SERVICE_REQUEST_STATUS_DEFINITIONS } from '@/workflow/statusDefinitions';

export class ServiceRequestService {
  private static stateMachine = new WorkflowStateMachine(SERVICE_REQUEST_STATUS_DEFINITIONS);

  static async listRequests(filters: ServiceRequestFilters): Promise<ServiceRequestListResult> {
    return ServiceRequestRepository.listRequests(filters);
  }

  static async getById(id: string): Promise<ServiceRequest | null> {
    return ServiceRequestRepository.getById(id);
  }

  static async create(dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    if (!dto.title || !dto.category) {
      throw new Error('Title and category are required');
    }
    return ServiceRequestRepository.create(dto);
  }

  static async assignVendor(id: string, vendorId: string, vendorName: string, notes?: string): Promise<ServiceRequest> {
    const current = await this.getById(id);
    if (!current) throw new Error('Request not found');

    if (!this.stateMachine.canTransition(current.status, 'ASSIGNED')) {
      throw new Error(`Cannot assign vendor from current status (${current.status})`);
    }

    return ServiceRequestRepository.assignVendor(id, vendorId, vendorName, notes);
  }

  static async changeStatus(id: string, newStatus: any, remarks?: string): Promise<ServiceRequest> {
    const current = await this.getById(id);
    if (!current) throw new Error('Request not found');

    if (!this.stateMachine.canTransition(current.status, newStatus)) {
      throw new Error(`Invalid status transition from ${current.status} to ${newStatus}`);
    }

    return ServiceRequestRepository.changeStatus(id, newStatus, remarks);
  }
}
