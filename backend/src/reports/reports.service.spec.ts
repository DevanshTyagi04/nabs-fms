import { ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AnalyticsService } from './analytics/analytics.service';
import { DashboardService } from './dashboard/dashboard.service';
import { ReportPeriod } from './dto';
import { ReportsService } from './reports.service';

describe('Reports Module (Phase 11 Unit & Integration Tests)', () => {
  let reportsService: ReportsService;
  let dashboardService: DashboardService;
  let analyticsService: AnalyticsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      customerProfile: { count: jest.fn(), findFirst: jest.fn() },
      vendorProfile: { count: jest.fn(), findFirst: jest.fn() },
      serviceRequest: { count: jest.fn(), groupBy: jest.fn() },
      survey: { count: jest.fn(), groupBy: jest.fn() },
      estimate: { count: jest.fn(), groupBy: jest.fn() },
      workOrder: { count: jest.fn(), groupBy: jest.fn() },
      payment: { count: jest.fn(), aggregate: jest.fn(), groupBy: jest.fn() },
      invoice: { count: jest.fn(), aggregate: jest.fn() },
      notification: { count: jest.fn() },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    dashboardService = new DashboardService(prismaMock);
    analyticsService = new AnalyticsService(prismaMock, dashboardService);
    reportsService = new ReportsService(dashboardService, analyticsService);
  });

  describe('DashboardService (Time Filters & Snapshot Metrics)', () => {
    it('should resolve date range bounds correctly for TODAY and THIS_MONTH', () => {
      const todayRange = dashboardService.getDateRange({ period: ReportPeriod.TODAY });
      expect(todayRange.gte).toBeInstanceOf(Date);

      const monthRange = dashboardService.getDateRange({ period: ReportPeriod.THIS_MONTH });
      expect(monthRange.gte?.getDate()).toBe(1);
    });

    it('should aggregate Admin Dashboard Summary metrics in a single point-in-time transaction', async () => {
      prismaMock.customerProfile.count.mockResolvedValue(15);
      prismaMock.vendorProfile.count.mockResolvedValue(5);

      prismaMock.serviceRequest.count.mockResolvedValue(10);
      prismaMock.survey.count.mockResolvedValue(8);
      prismaMock.estimate.count.mockResolvedValue(6);
      prismaMock.workOrder.count.mockResolvedValue(4);
      prismaMock.payment.count.mockResolvedValue(3);
      prismaMock.invoice.count.mockResolvedValue(3);
      prismaMock.notification.count.mockResolvedValue(2);

      prismaMock.payment.aggregate.mockResolvedValue({
        _sum: { amount: new Prisma.Decimal('15000.50') },
        _count: { id: 3 },
      });

      prismaMock.invoice.aggregate.mockResolvedValue({
        _sum: { dueAmount: new Prisma.Decimal('2500.00') },
        _count: { id: 2 },
      });

      const res = await reportsService.getAdminDashboard({ period: ReportPeriod.THIS_MONTH });

      expect(res.summary.users.totalCustomers).toBe(15);
      expect(res.summary.financials.totalRevenue).toBe('15000.5');
      expect(res.summary.financials.outstandingAmount).toBe('2500');
    });

    it('should scope Vendor Dashboard Summary strictly to authenticated vendor', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.serviceRequest.count.mockResolvedValue(4);
      prismaMock.workOrder.count.mockResolvedValue(2);
      prismaMock.payment.aggregate.mockResolvedValue({
        _sum: { amount: new Prisma.Decimal('5000.00') },
      });
      prismaMock.invoice.count.mockResolvedValue(2);
      prismaMock.notification.count.mockResolvedValue(1);

      const res = await reportsService.getVendorDashboard('u-vendor-1', { period: ReportPeriod.THIS_MONTH });

      expect(res.summary.assignedRequests).toBe(4);
      expect(res.summary.paymentsReceived).toBe('5000');
    });

    it('should throw ForbiddenException if user accessing vendor dashboard has no vendor profile', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue(null);

      await expect(
        reportsService.getVendorDashboard('u-invalid', { period: ReportPeriod.THIS_MONTH }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('AnalyticsService (GroupBy Aggregations & Graceful Partial Reporting)', () => {
    it('should group revenue analytics by payment method maintaining Decimal safety', async () => {
      prismaMock.payment.aggregate.mockResolvedValue({
        _sum: { amount: new Prisma.Decimal('20000.00') },
        _count: { id: 5 },
      });

      prismaMock.payment.groupBy.mockResolvedValue([
        { paymentMethod: 'CARD', _sum: { amount: new Prisma.Decimal('15000.00') }, _count: { id: 3 } },
        { paymentMethod: 'UPI', _sum: { amount: new Prisma.Decimal('5000.00') }, _count: { id: 2 } },
      ]);

      prismaMock.invoice.aggregate.mockResolvedValue({
        _sum: { dueAmount: new Prisma.Decimal('0.00') },
        _count: { id: 0 },
      });

      const res = await reportsService.getRevenueReports({ period: ReportPeriod.THIS_MONTH });

      expect(res.revenueSummary.totalRevenue).toBe('20000');
      expect(res.revenueByPaymentMethod).toHaveLength(2);
      expect(res.revenueByPaymentMethod[0].paymentMethod).toBe('CARD');
    });

    it('should gracefully handle partial report failure if one analytical sub-query throws error', async () => {
      prismaMock.payment.aggregate.mockRejectedValue(new Error('Database timeout'));
      prismaMock.payment.groupBy.mockResolvedValue([]);
      prismaMock.invoice.aggregate.mockResolvedValue({ _sum: { dueAmount: null }, _count: { id: 0 } });

      const res = await reportsService.getRevenueReports({ period: ReportPeriod.THIS_MONTH });

      expect(res.revenueSummary.status).toBe('UNAVAILABLE');
      expect(res.outstandingInvoices.totalOutstandingAmount).toBe('0.00');
    });
  });
});
