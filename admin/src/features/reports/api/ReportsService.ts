import { ReportsRepository } from './ReportsRepository';
import { DashboardMetricsDomain, ReportFilters } from '../types';
import { ExportEngine } from '@/reports/core/Engines';

export class ReportsService {
  static async getAdminDashboard(filters: ReportFilters): Promise<DashboardMetricsDomain> {
    return ReportsRepository.getAdminDashboard(filters);
  }

  static exportReport(reportType: string, format: 'CSV' | 'PDF') {
    return ExportEngine.exportReport(reportType, format);
  }
}
