import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { ActivityItem } from '../interfaces/activity.interface';

@Injectable()
export class EntityHistoryService {
  private readonly logger = new Logger(EntityHistoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  private resolveUserName(u: any): string {
    if (!u) return 'System User';
    if (u.customerProfile) return `${u.customerProfile.firstName} ${u.customerProfile.lastName}`.trim();
    if (u.vendorProfile) return u.vendorProfile.businessName;
    return u.email || 'User';
  }

  /**
   * Retrieves complete lifecycle history for a single entity instance
   */
  async getEntityHistory(entity: string, entityId: string): Promise<ActivityItem[]> {
    const entityType = entity.toLowerCase();
    const historyItems: ActivityItem[] = [];

    if (entityType === 'servicerequest') {
      const sr = await this.prisma.serviceRequest.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
          createdAt: true,
          statusHistory: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              fromStatus: true,
              toStatus: true,
              remarks: true,
              createdAt: true,
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
          },
        },
      });

      if (!sr) {
        throw new NotFoundException(`ServiceRequest not found: [${entityId}]`);
      }

      for (const h of sr.statusHistory) {
        historyItems.push({
          id: h.id,
          timestamp: h.createdAt,
          action: 'SERVICE_REQUEST_STATUS_CHANGED',
          entity: 'ServiceRequest',
          entityId: sr.id,
          correlationId: sr.id,
          summary: `Ticket ${sr.ticketNumber} transitioned to ${h.toStatus}`,
          user: {
            id: h.changedBy.id,
            name: this.resolveUserName(h.changedBy),
            role: h.changedBy.role,
          },
          metadata: {
            ticketNumber: sr.ticketNumber,
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            remarks: h.remarks,
          },
        });
      }
    } else if (entityType === 'workorder') {
      const wo = await this.prisma.workOrder.findUnique({
        where: { id: entityId },
        select: {
          id: true,
          workOrderNumber: true,
          serviceRequestId: true,
          statusHistory: {
            orderBy: { changedAt: 'asc' },
            select: {
              id: true,
              fromStatus: true,
              toStatus: true,
              reason: true,
              changedAt: true,
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
          },
          timelineEvents: {
            orderBy: { timestamp: 'asc' },
            select: {
              id: true,
              eventTitle: true,
              eventDescription: true,
              timestamp: true,
              actor: {
                select: {
                  id: true,
                  email: true,
                  role: true,
                  customerProfile: { select: { firstName: true, lastName: true } },
                  vendorProfile: { select: { businessName: true } },
                },
              },
            },
          },
        },
      });

      if (!wo) {
        throw new NotFoundException(`WorkOrder not found: [${entityId}]`);
      }

      for (const sh of wo.statusHistory) {
        historyItems.push({
          id: sh.id,
          timestamp: sh.changedAt,
          action: 'WORK_ORDER_STATUS_CHANGED',
          entity: 'WorkOrder',
          entityId: wo.id,
          correlationId: wo.serviceRequestId,
          summary: `Work Order ${wo.workOrderNumber} status changed to ${sh.toStatus}`,
          user: {
            id: sh.changedBy.id,
            name: this.resolveUserName(sh.changedBy),
            role: sh.changedBy.role,
          },
          metadata: {
            workOrderNumber: wo.workOrderNumber,
            fromStatus: sh.fromStatus,
            toStatus: sh.toStatus,
            reason: sh.reason,
          },
        });
      }

      for (const te of wo.timelineEvents) {
        historyItems.push({
          id: te.id,
          timestamp: te.timestamp,
          action: 'WORK_ORDER_TIMELINE_EVENT',
          entity: 'WorkOrder',
          entityId: wo.id,
          correlationId: wo.serviceRequestId,
          summary: te.eventTitle,
          user: te.actor
            ? {
                id: te.actor.id,
                name: this.resolveUserName(te.actor),
                role: te.actor.role,
              }
            : undefined,
          metadata: {
            eventTitle: te.eventTitle,
            eventDescription: te.eventDescription,
          },
        });
      }
    } else {
      throw new NotFoundException(`Entity history support for [${entity}] not found or unsupported`);
    }

    historyItems.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return historyItems;
  }
}
