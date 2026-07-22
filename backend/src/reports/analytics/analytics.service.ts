import { Injectable, Logger } from '@nestjs/common';
import { InvoiceStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { DashboardService } from '../dashboard/dashboard.service';
import { QueryReportDateDto, ReportPeriod } from '../dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardService: DashboardService,
  ) {}

  /**
   * Financial & Revenue Analytics (Recommendation 2 & 3: Decimal Safety & DB-side GroupBy)
   */
  async getRevenueAnalytics(dto: QueryReportDateDto) {
    const dateFilter = this.dashboardService.getDateRange(dto);
    const createdAtWhere = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};

    const period = dto.period || ReportPeriod.THIS_MONTH;

    // Graceful Partial Report Handling (Recommendation 4)
    let totalRevenueSection: any = null;
    let byMethodSection: any = null;
    let outstandingSection: any = null;

    // 1. Overall Revenue
    try {
      const revenueAgg = await this.prisma.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: PaymentStatus.SUCCESS, ...createdAtWhere },
      });
      totalRevenueSection = {
        totalRevenue: revenueAgg._sum.amount ? revenueAgg._sum.amount.toString() : '0.00',
        successfulTransactions: revenueAgg._count.id,
      };
    } catch (err: any) {
      this.logger.error(`Error calculating total revenue section: ${err.message}`);
      totalRevenueSection = { status: 'UNAVAILABLE', error: err.message };
    }

    // 2. Revenue by Payment Method (GroupBy)
    try {
      const byMethod = await this.prisma.payment.groupBy({
        by: ['paymentMethod'],
        _sum: { amount: true },
        _count: { id: true },
        where: { status: PaymentStatus.SUCCESS, ...createdAtWhere },
      });

      byMethodSection = byMethod.map((item) => ({
        paymentMethod: item.paymentMethod || 'UNKNOWN',
        totalAmount: item._sum.amount ? item._sum.amount.toString() : '0.00',
        transactionCount: item._count.id,
      }));
    } catch (err: any) {
      this.logger.error(`Error calculating revenue by method section: ${err.message}`);
      byMethodSection = { status: 'UNAVAILABLE', error: err.message };
    }

    // 3. Outstanding Invoices Amount
    try {
      const outstandingAgg = await this.prisma.invoice.aggregate({
        _sum: { dueAmount: true },
        _count: { id: true },
        where: { status: InvoiceStatus.ISSUED, ...createdAtWhere },
      });
      outstandingSection = {
        totalOutstandingAmount: outstandingAgg._sum.dueAmount ? outstandingAgg._sum.dueAmount.toString() : '0.00',
        issuedInvoiceCount: outstandingAgg._count.id,
      };
    } catch (err: any) {
      this.logger.error(`Error calculating outstanding invoice section: ${err.message}`);
      outstandingSection = { status: 'UNAVAILABLE', error: err.message };
    }

    return {
      period,
      revenueSummary: totalRevenueSection,
      revenueByPaymentMethod: byMethodSection,
      outstandingInvoices: outstandingSection,
    };
  }

  /**
   * Service & Lifecycle Distribution Analytics
   */
  async getServiceAnalytics(dto: QueryReportDateDto) {
    const dateFilter = this.dashboardService.getDateRange(dto);
    const createdAtWhere = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};
    const period = dto.period || ReportPeriod.THIS_MONTH;

    let requestDist: any = [];
    let surveyDist: any = [];
    let estimateDist: any = [];

    try {
      const requestGroupBy = await this.prisma.serviceRequest.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { ...createdAtWhere },
      });
      requestDist = requestGroupBy.map((item) => ({ status: item.status, count: item._count.id }));
    } catch (err: any) {
      this.logger.error(`Error grouping ServiceRequest status: ${err.message}`);
    }

    try {
      const surveyGroupBy = await this.prisma.survey.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { ...createdAtWhere },
      });
      surveyDist = surveyGroupBy.map((item) => ({ status: item.status, count: item._count.id }));
    } catch (err: any) {
      this.logger.error(`Error grouping Survey status: ${err.message}`);
    }

    try {
      const estimateGroupBy = await this.prisma.estimate.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { ...createdAtWhere },
      });
      estimateDist = estimateGroupBy.map((item) => ({ status: item.status, count: item._count.id }));
    } catch (err: any) {
      this.logger.error(`Error grouping Estimate status: ${err.message}`);
    }

    return {
      period,
      serviceRequestDistribution: requestDist,
      surveyDistribution: surveyDist,
      estimateDistribution: estimateDist,
    };
  }

  /**
   * Payment Gateway & Status Distribution Analytics
   */
  async getPaymentAnalytics(dto: QueryReportDateDto) {
    const dateFilter = this.dashboardService.getDateRange(dto);
    const createdAtWhere = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};
    const period = dto.period || ReportPeriod.THIS_MONTH;

    const [statusGroupBy, gatewayGroupBy] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { ...createdAtWhere },
      }),
      this.prisma.payment.groupBy({
        by: ['gateway'],
        _count: { id: true },
        where: { ...createdAtWhere },
      }),
    ]);

    return {
      period,
      statusDistribution: statusGroupBy.map((item) => ({ status: item.status, count: item._count.id })),
      gatewayDistribution: gatewayGroupBy.map((item) => ({ gateway: item.gateway, count: item._count.id })),
    };
  }

  /**
   * Work Order Execution Analytics
   */
  async getWorkOrderAnalytics(dto: QueryReportDateDto) {
    const dateFilter = this.dashboardService.getDateRange(dto);
    const createdAtWhere = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};
    const period = dto.period || ReportPeriod.THIS_MONTH;

    const woGroupBy = await this.prisma.workOrder.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { ...createdAtWhere },
    });

    return {
      period,
      workOrderStatusDistribution: woGroupBy.map((item) => ({ status: item.status, count: item._count.id })),
    };
  }
}
