import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import {
  EstimateStatus,
  InvoiceStatus,
  PaymentStatus,
  RequestStatus,
  SurveyStatus,
  WorkOrderStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma';
import { QueryReportDateDto, ReportPeriod } from '../dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper: Resolves date range bounds (gte / lte) based on QueryReportDateDto
   */
  public getDateRange(dto: QueryReportDateDto): { gte?: Date; lte?: Date } {
    const now = new Date();
    const period = dto.period || ReportPeriod.THIS_MONTH;

    if (period === ReportPeriod.CUSTOM) {
      return {
        ...(dto.startDate && { gte: new Date(dto.startDate) }),
        ...(dto.endDate && { lte: new Date(dto.endDate) }),
      };
    }

    if (period === ReportPeriod.TODAY) {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { gte: startOfDay };
    }

    if (period === ReportPeriod.THIS_WEEK) {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return { gte: startOfWeek };
    }

    if (period === ReportPeriod.THIS_MONTH) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: startOfMonth };
    }

    if (period === ReportPeriod.THIS_YEAR) {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return { gte: startOfYear };
    }

    return {};
  }

  /**
   * Admin Platform Dashboard Summary (Point-in-time Snapshot Transaction)
   */
  async getAdminDashboardSummary(dto: QueryReportDateDto) {
    const dateFilter = this.getDateRange(dto);
    const createdAtWhere = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};

    // Recommendation 1: Execute all snapshot metrics in a single Prisma Transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. User & Profile Counts
      const [totalCustomers, totalVendors] = await Promise.all([
        tx.customerProfile.count({ where: { deletedAt: null } }),
        tx.vendorProfile.count({ where: { deletedAt: null } }),
      ]);

      // 2. Service Request Metrics (Database-side aggregation)
      const [srTotal, srOpen, srAssigned, srInProgress, srCompleted, srCancelled] = await Promise.all([
        tx.serviceRequest.count({ where: { ...createdAtWhere } }),
        tx.serviceRequest.count({ where: { status: RequestStatus.CREATED, ...createdAtWhere } }),
        tx.serviceRequest.count({ where: { status: RequestStatus.ASSIGNED, ...createdAtWhere } }),
        tx.serviceRequest.count({ where: { status: RequestStatus.IN_PROGRESS, ...createdAtWhere } }),
        tx.serviceRequest.count({ where: { status: RequestStatus.COMPLETED, ...createdAtWhere } }),
        tx.serviceRequest.count({ where: { status: RequestStatus.CANCELLED, ...createdAtWhere } }),
      ]);

      // 3. Survey Metrics
      const [surveysDraft, surveysSubmitted, surveysApproved, surveysSuperseded] = await Promise.all([
        tx.survey.count({ where: { status: SurveyStatus.DRAFT, ...createdAtWhere } }),
        tx.survey.count({ where: { status: SurveyStatus.SUBMITTED, ...createdAtWhere } }),
        tx.survey.count({ where: { status: SurveyStatus.APPROVED, ...createdAtWhere } }),
        tx.survey.count({ where: { status: SurveyStatus.SUPERSEDED, ...createdAtWhere } }),
      ]);

      // 4. Estimate Metrics
      const [estDraft, estPending, estApproved, estRejected] = await Promise.all([
        tx.estimate.count({ where: { status: EstimateStatus.DRAFT, ...createdAtWhere } }),
        tx.estimate.count({ where: { status: EstimateStatus.PENDING_APPROVAL, ...createdAtWhere } }),
        tx.estimate.count({ where: { status: EstimateStatus.APPROVED, ...createdAtWhere } }),
        tx.estimate.count({ where: { status: EstimateStatus.REJECTED, ...createdAtWhere } }),
      ]);

      // 5. Work Order Metrics
      const [woTotal, woActive, woCompleted, woCancelled] = await Promise.all([
        tx.workOrder.count({ where: { ...createdAtWhere } }),
        tx.workOrder.count({ where: { status: WorkOrderStatus.IN_PROGRESS, ...createdAtWhere } }),
        tx.workOrder.count({ where: { status: WorkOrderStatus.COMPLETED, ...createdAtWhere } }),
        tx.workOrder.count({ where: { status: WorkOrderStatus.CANCELLED, ...createdAtWhere } }),
      ]);

      // 6. Payment & Financial Metrics (Prisma Decimal Safety)
      const [paySuccess, payFailed, revenueAgg, outstandingAgg] = await Promise.all([
        tx.payment.count({ where: { status: PaymentStatus.SUCCESS, ...createdAtWhere } }),
        tx.payment.count({ where: { status: PaymentStatus.FAILED, ...createdAtWhere } }),
        tx.payment.aggregate({
          _sum: { amount: true },
          where: { status: PaymentStatus.SUCCESS, ...createdAtWhere },
        }),
        tx.invoice.aggregate({
          _sum: { dueAmount: true },
          where: { status: InvoiceStatus.ISSUED, ...createdAtWhere },
        }),
      ]);

      // 7. Invoice & Notification Counts
      const [invoicesIssued, unreadNotifications] = await Promise.all([
        tx.invoice.count({ where: { status: InvoiceStatus.ISSUED, ...createdAtWhere } }),
        tx.notification.count({ where: { isRead: false } }),
      ]);

      const totalRevenue = revenueAgg._sum.amount ? revenueAgg._sum.amount.toString() : '0.00';
      const totalOutstanding = outstandingAgg._sum.dueAmount ? outstandingAgg._sum.dueAmount.toString() : '0.00';

      return {
        period: dto.period || ReportPeriod.THIS_MONTH,
        summary: {
          users: { totalCustomers, totalVendors },
          serviceRequests: {
            total: srTotal,
            open: srOpen,
            assigned: srAssigned,
            inProgress: srInProgress,
            completed: srCompleted,
            cancelled: srCancelled,
          },
          surveys: { draft: surveysDraft, submitted: surveysSubmitted, approved: surveysApproved, superseded: surveysSuperseded },
          estimates: { draft: estDraft, pendingApproval: estPending, approved: estApproved, rejected: estRejected },
          workOrders: { total: woTotal, active: woActive, completed: woCompleted, cancelled: woCancelled },
          financials: {
            successfulPayments: paySuccess,
            failedPayments: payFailed,
            totalRevenue,
            outstandingAmount: totalOutstanding,
            invoicesIssued,
          },
          notifications: { unread: unreadNotifications },
        },
      };
    });
  }

  /**
   * Vendor Dashboard Summary (Scoped strictly to authenticated vendor)
   */
  async getVendorDashboardSummary(userId: string, dto: QueryReportDateDto) {
    const vendorProfile = await this.prisma.vendorProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    if (!vendorProfile) {
      throw new ForbiddenException('Only registered vendors can access vendor reporting endpoints');
    }

    const vendorId = vendorProfile.id;
    const dateFilter = this.getDateRange(dto);
    const createdAtWhere = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};

    return this.prisma.$transaction(async (tx) => {
      const [assignedRequests, pendingWork, completedJobs, activeWorkOrders] = await Promise.all([
        tx.serviceRequest.count({ where: { assignedVendorId: vendorId, ...createdAtWhere } }),
        tx.workOrder.count({ where: { assignedVendorId: vendorId, status: WorkOrderStatus.ASSIGNED, ...createdAtWhere } }),
        tx.workOrder.count({ where: { assignedVendorId: vendorId, status: WorkOrderStatus.COMPLETED, ...createdAtWhere } }),
        tx.workOrder.count({ where: { assignedVendorId: vendorId, status: WorkOrderStatus.IN_PROGRESS, ...createdAtWhere } }),
      ]);

      const paymentsAgg = await tx.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.SUCCESS,
          serviceRequest: { assignedVendorId: vendorId },
          ...createdAtWhere,
        },
      });

      const [invoicesCount, unreadNotifications] = await Promise.all([
        tx.invoice.count({
          where: {
            payment: { serviceRequest: { assignedVendorId: vendorId } },
            ...createdAtWhere,
          },
        }),
        tx.notification.count({ where: { recipientId: userId, isRead: false } }),
      ]);

      const paymentsReceived = paymentsAgg._sum.amount ? paymentsAgg._sum.amount.toString() : '0.00';

      return {
        period: dto.period || ReportPeriod.THIS_MONTH,
        summary: {
          assignedRequests,
          pendingWork,
          completedJobs,
          activeWorkOrders,
          paymentsReceived,
          invoicesGenerated: invoicesCount,
          unreadNotifications,
        },
      };
    });
  }

  /**
   * Customer Dashboard Summary (Scoped strictly to authenticated customer)
   */
  async getCustomerDashboardSummary(userId: string, dto: QueryReportDateDto) {
    const customerProfile = await this.prisma.customerProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    if (!customerProfile) {
      throw new ForbiddenException('Only registered customers can access customer reporting endpoints');
    }

    const customerId = customerProfile.id;
    const dateFilter = this.getDateRange(dto);
    const createdAtWhere = dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {};

    return this.prisma.$transaction(async (tx) => {
      const [submittedRequests, completedRequests, pendingEstimates] = await Promise.all([
        tx.serviceRequest.count({ where: { customerId, ...createdAtWhere } }),
        tx.serviceRequest.count({ where: { customerId, status: RequestStatus.COMPLETED, ...createdAtWhere } }),
        tx.estimate.count({
          where: {
            serviceRequest: { customerId },
            status: EstimateStatus.PENDING_APPROVAL,
            ...createdAtWhere,
          },
        }),
      ]);

      const paymentsAgg = await tx.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: PaymentStatus.SUCCESS,
          serviceRequest: { customerId },
          ...createdAtWhere,
        },
      });

      const [invoicesCount, unreadNotifications] = await Promise.all([
        tx.invoice.count({
          where: {
            payment: { serviceRequest: { customerId } },
            ...createdAtWhere,
          },
        }),
        tx.notification.count({ where: { recipientId: userId, isRead: false } }),
      ]);

      const paymentsMade = paymentsAgg._sum.amount ? paymentsAgg._sum.amount.toString() : '0.00';

      return {
        period: dto.period || ReportPeriod.THIS_MONTH,
        summary: {
          requestsSubmitted: submittedRequests,
          requestsCompleted: completedRequests,
          pendingEstimates,
          paymentsMade,
          invoices: invoicesCount,
          unreadNotifications,
        },
      };
    });
  }
}
