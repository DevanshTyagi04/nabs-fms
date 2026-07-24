import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorReportMetrics {
  totalJobs: number;
  earnedFormatted: string;
  completionRate: string;
}

export class ReportsRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  static async getVendorDashboard(): Promise<VendorReportMetrics> {
    return {
      totalJobs: 14,
      earnedFormatted: '$3,450.00',
      completionRate: '96.5%',
    };
  }
}
