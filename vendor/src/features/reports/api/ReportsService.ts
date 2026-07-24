import { ReportsRepository, VendorReportMetrics } from './ReportsRepository';

export class ReportsService {
  static async getVendorDashboard(): Promise<VendorReportMetrics> {
    return ReportsRepository.getVendorDashboard();
  }
}
