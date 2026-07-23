import { EstimateRepository, CustomerEstimate } from './EstimateRepository';

export class EstimateService {
  static async getCustomerEstimates(): Promise<CustomerEstimate[]> {
    return EstimateRepository.getCustomerEstimates();
  }

  static async approveEstimate(id: string): Promise<CustomerEstimate> {
    return EstimateRepository.approveEstimate(id);
  }

  static async rejectEstimate(id: string): Promise<CustomerEstimate> {
    return EstimateRepository.rejectEstimate(id);
  }
}
