import { ServiceRequestRepository, VendorServiceRequest } from './ServiceRequestRepository';

export class ServiceRequestService {
  static async getAssignedRequests(): Promise<VendorServiceRequest[]> {
    return ServiceRequestRepository.getAssignedRequests();
  }

  static async acceptAssignment(id: string): Promise<VendorServiceRequest> {
    return ServiceRequestRepository.acceptAssignment(id);
  }

  static async rejectAssignment(id: string): Promise<VendorServiceRequest> {
    return ServiceRequestRepository.rejectAssignment(id);
  }
}
