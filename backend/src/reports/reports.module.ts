import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { AdminReportController } from './admin-reports.controller';
import { AnalyticsService } from './analytics/analytics.service';
import { CustomerReportController } from './customer-reports.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { ReportsService } from './reports.service';
import { VendorReportController } from './vendor-reports.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminReportController,
    VendorReportController,
    CustomerReportController,
  ],
  providers: [
    ReportsService,
    DashboardService,
    AnalyticsService,
  ],
  exports: [
    ReportsService,
    DashboardService,
    AnalyticsService,
  ],
})
export class ReportsModule {}
