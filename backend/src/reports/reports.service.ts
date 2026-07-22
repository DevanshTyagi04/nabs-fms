import { Injectable } from '@nestjs/common';
import { AnalyticsService } from './analytics/analytics.service';
import { DashboardService } from './dashboard/dashboard.service';
import { QueryReportDateDto } from './dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  // ==============================================================================
  // ADMIN DASHBOARD & ANALYTICS
  // ==============================================================================

  async getAdminDashboard(query: QueryReportDateDto) {
    return this.dashboardService.getAdminDashboardSummary(query);
  }

  async getRevenueReports(query: QueryReportDateDto) {
    return this.analyticsService.getRevenueAnalytics(query);
  }

  async getServiceReports(query: QueryReportDateDto) {
    return this.analyticsService.getServiceAnalytics(query);
  }

  async getPaymentReports(query: QueryReportDateDto) {
    return this.analyticsService.getPaymentAnalytics(query);
  }

  async getWorkOrderReports(query: QueryReportDateDto) {
    return this.analyticsService.getWorkOrderAnalytics(query);
  }

  // ==============================================================================
  // VENDOR DASHBOARD
  // ==============================================================================

  async getVendorDashboard(userId: string, query: QueryReportDateDto) {
    return this.dashboardService.getVendorDashboardSummary(userId, query);
  }

  // ==============================================================================
  // CUSTOMER DASHBOARD
  // ==============================================================================

  async getCustomerDashboard(userId: string, query: QueryReportDateDto) {
    return this.dashboardService.getCustomerDashboardSummary(userId, query);
  }
}
