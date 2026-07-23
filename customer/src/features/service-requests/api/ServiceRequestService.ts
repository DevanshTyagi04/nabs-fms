import { ServiceRequestRepository, CustomerServiceRequest } from './ServiceRequestRepository';

export class ServiceRequestService {
  static async getMyRequests(): Promise<CustomerServiceRequest[]> {
    return ServiceRequestRepository.getMyRequests();
  }

  static async createRequest(dto: { title: string; category: string; description: string; priority?: string; serviceAddress?: string }): Promise<CustomerServiceRequest> {
    return ServiceRequestRepository.createRequest(dto);
  }

  static async cancelRequest(id: string): Promise<CustomerServiceRequest> {
    return ServiceRequestRepository.cancelRequest(id);
  }
}
