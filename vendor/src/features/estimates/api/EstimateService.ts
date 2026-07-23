import { EstimateRepository, VendorEstimate } from './EstimateRepository';

export class EstimateService {
  static async getVendorEstimates(): Promise<VendorEstimate[]> {
    return EstimateRepository.getVendorEstimates();
  }

  static async submitEstimate(id: string): Promise<VendorEstimate> {
    return EstimateRepository.submitEstimate(id);
  }
}
