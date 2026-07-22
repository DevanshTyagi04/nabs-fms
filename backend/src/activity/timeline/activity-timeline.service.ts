import { Injectable, Logger } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { QueryActivityDto } from '../dto';
import { ActivityItem, NormalizedActivityFeedResponse } from '../interfaces/activity.interface';

export interface UserContext {
  userId: string;
  role: UserRole;
  customerProfileId?: string;
  vendorProfileId?: string;
}

@Injectable()
export class ActivityTimelineService {
  private readonly logger = new Logger(ActivityTimelineService.name);

  constructor(private readonly prisma: PrismaService) {}

  private resolveUserName(u: any): string {
    if (!u) return 'System User';
    if (u.customerProfile) return `${u.customerProfile.firstName} ${u.customerProfile.lastName}`.trim();
    if (u.vendorProfile) return u.vendorProfile.businessName;
    return u.email || 'User';
  }

  /**
   * Core Timeline Generator: Fetches and normalizes activity events across all business modules
   */
  async getTimeline(dto: QueryActivityDto, userContext: UserContext): Promise<NormalizedActivityFeedResponse> {
    const rawItems: ActivityItem[] = [];

    const startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;

    // 1. Fetch ServiceRequestHistory entries
    if (!dto.entity || dto.entity.toLowerCase() === 'servicerequest') {
      const srWhere: any = {
        ...(startDate || endDate ? { createdAt: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } } : {}),
      };
      if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
        srWhere.serviceRequest = { customerId: userContext.customerProfileId };
      } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
        srWhere.serviceRequest = { assignedVendorId: userContext.vendorProfileId };
      }

      const srHistories = await this.prisma.serviceRequestHistory.findMany({
        where: srWhere,
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          serviceRequestId: true,
          fromStatus: true,
          toStatus: true,
          remarks: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
          changedBy: {
            select: {
              id: true,
              email: true,
              role: true,
              customerProfile: { select: { firstName: true, lastName: true } },
              vendorProfile: { select: { businessName: true } },
            },
          },
        },
      });

      for (const h of srHistories) {
        rawItems.push({
          id: h.id,
          timestamp: h.createdAt,
          action: 'SERVICE_REQUEST_STATUS_CHANGED',
          entity: 'ServiceRequest',
          entityId: h.serviceRequestId,
          correlationId: h.serviceRequestId,
          summary: `Service Request ${h.serviceRequest.ticketNumber} status changed to ${h.toStatus}`,
          user: {
            id: h.changedBy.id,
            name: this.resolveUserName(h.changedBy),
            role: h.changedBy.role,
          },
          metadata: {
            ticketNumber: h.serviceRequest.ticketNumber,
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            remarks: h.remarks,
          },
        });
      }
    }

    // 2. Fetch WorkStatusHistory entries
    if (!dto.entity || dto.entity.toLowerCase() === 'workorder') {
      const woWhere: any = {
        ...(startDate || endDate ? { changedAt: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } } : {}),
      };
      if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
        woWhere.workOrder = { serviceRequest: { customerId: userContext.customerProfileId } };
      } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
        woWhere.workOrder = { assignedVendorId: userContext.vendorProfileId };
      }

      const woHistories = await this.prisma.workStatusHistory.findMany({
        where: woWhere,
        take: 100,
        orderBy: { changedAt: 'desc' },
        select: {
          id: true,
          workOrderId: true,
          fromStatus: true,
          toStatus: true,
          reason: true,
          changedAt: true,
          workOrder: { select: { workOrderNumber: true, serviceRequestId: true } },
          changedBy: {
            select: {
              id: true,
              email: true,
              role: true,
              customerProfile: { select: { firstName: true, lastName: true } },
              vendorProfile: { select: { businessName: true } },
            },
          },
        },
      });

      for (const h of woHistories) {
        rawItems.push({
          id: h.id,
          timestamp: h.changedAt,
          action: 'WORK_ORDER_STATUS_CHANGED',
          entity: 'WorkOrder',
          entityId: h.workOrderId,
          correlationId: h.workOrder.serviceRequestId,
          summary: `Work Order ${h.workOrder.workOrderNumber} status changed to ${h.toStatus}`,
          user: {
            id: h.changedBy.id,
            name: this.resolveUserName(h.changedBy),
            role: h.changedBy.role,
          },
          metadata: {
            workOrderNumber: h.workOrder.workOrderNumber,
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            reason: h.reason,
          },
        });
      }
    }

    // 3. Fetch Payments entries
    if (!dto.entity || dto.entity.toLowerCase() === 'payment') {
      const payWhere: any = {
        ...(startDate || endDate ? { createdAt: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) } } : {}),
      };
      if (userContext.role === UserRole.CUSTOMER && userContext.customerProfileId) {
        payWhere.serviceRequest = { customerId: userContext.customerProfileId };
      } else if (userContext.role === UserRole.VENDOR && userContext.vendorProfileId) {
        payWhere.serviceRequest = { assignedVendorId: userContext.vendorProfileId };
      }

      const payments = await this.prisma.payment.findMany({
        where: payWhere,
        take: 100,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          paymentNumber: true,
          amount: true,
          status: true,
          createdAt: true,
          serviceRequestId: true,
          serviceRequest: {
            select: {
              customer: {
                select: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      role: true,
                      customerProfile: { select: { firstName: true, lastName: true } },
                    },
                  },
                },
              },
            },
          },
        },
      });

      for (const p of payments) {
        const u = p.serviceRequest.customer.user;
        rawItems.push({
          id: p.id,
          timestamp: p.createdAt,
          action: `PAYMENT_${p.status}`,
          entity: 'Payment',
          entityId: p.id,
          correlationId: p.serviceRequestId,
          summary: `Payment ${p.paymentNumber} of amount ${p.amount.toString()} is ${p.status}`,
          user: u
            ? {
                id: u.id,
                name: this.resolveUserName(u),
                role: u.role,
              }
            : undefined,
          metadata: {
            paymentNumber: p.paymentNumber,
            amount: p.amount.toString(),
            status: p.status,
          },
        });
      }
    }

    // Recommendation 2 & 7: Deterministic tie-breaker sorting (timestamp DESC, id ASC)
    rawItems.sort((a, b) => {
      const timeDiff = b.timestamp.getTime() - a.timestamp.getTime();
      if (timeDiff !== 0) return timeDiff;
      return a.id.localeCompare(b.id);
    });

    // Pagination Calculation
    const totalItems = rawItems.length;
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const skip = (page - 1) * limit;
    const items = rawItems.slice(skip, skip + limit);

    return {
      items,
      pagination: {
        page,
        pageSize: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        entity: dto.entity || null,
        entityId: dto.entityId || null,
        action: dto.action || null,
        startDate: dto.startDate || null,
        endDate: dto.endDate || null,
      },
    };
  }
}
