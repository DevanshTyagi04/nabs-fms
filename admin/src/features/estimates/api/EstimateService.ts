import { EstimateRepository } from './EstimateRepository';
import { Estimate, EstimateFilters, EstimateListResult } from '../types';

export class EstimateService {
  static async listEstimates(filters: EstimateFilters): Promise<EstimateListResult> {
    return EstimateRepository.listEstimates(filters);
  }

  static async getById(id: string): Promise<Estimate | null> {
    return EstimateRepository.getById(id);
  }

  static async approveEstimate(id: string): Promise<Estimate> {
    return EstimateRepository.approveEstimate(id);
  }

  static async rejectEstimate(id: string): Promise<Estimate> {
    return EstimateRepository.rejectEstimate(id);
  }
}
