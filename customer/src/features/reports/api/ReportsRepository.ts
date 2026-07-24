import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerReportMetrics {
  totalRequests: number;
  totalSpentFormatted: string;
  paidTransactionsCount: number;
}

export class ReportsRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  static async getCustomerDashboard(): Promise<CustomerReportMetrics> {
    return {
      totalRequests: 5,
      totalSpentFormatted: '$1,245.00',
      paidTransactionsCount: 3,
    };
  }
}
