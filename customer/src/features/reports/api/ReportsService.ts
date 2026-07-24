import { ReportsRepository, CustomerReportMetrics } from './ReportsRepository';

export class ReportsService {
  static async getCustomerDashboard(): Promise<CustomerReportMetrics> {
    return ReportsRepository.getCustomerDashboard();
  }
}
