import { UserRole } from '@prisma/client';
import { ActivityService } from './activity.service';
import { EntityHistoryService } from './history/entity-history.service';
import { ActivityTimelineService } from './timeline/activity-timeline.service';

describe('Audit & Activity Center Module (Phase 15 Unit & Integration Tests)', () => {
  let activityService: ActivityService;
  let timelineService: ActivityTimelineService;
  let historyService: EntityHistoryService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      user: { findUnique: jest.fn() },
      serviceRequestHistory: { findMany: jest.fn() },
      workStatusHistory: { findMany: jest.fn() },
      payment: { findMany: jest.fn() },
      serviceRequest: { findUnique: jest.fn() },
      workOrder: { findUnique: jest.fn() },
    };

    timelineService = new ActivityTimelineService(prismaMock);
    historyService = new EntityHistoryService(prismaMock);
    activityService = new ActivityService(prismaMock, timelineService, historyService);
  });

  describe('ActivityTimelineService (Timeline Merging & Deterministic Sorting)', () => {
    it('should aggregate events from multiple entities and apply deterministic tie-breaker sorting (timestamp DESC, id ASC)', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u-admin',
        role: UserRole.ADMIN,
      });

      const t1 = new Date('2026-07-22T10:00:00.000Z');
      const t2 = new Date('2026-07-22T12:00:00.000Z');

      prismaMock.serviceRequestHistory.findMany.mockResolvedValue([
        {
          id: 'sr-h-1',
          serviceRequestId: 'sr-1',
          fromStatus: 'ASSIGNED',
          toStatus: 'CREATED',
          remarks: 'Rejected by vendor',
          createdAt: t1,
          serviceRequest: { ticketNumber: 'SR-100', title: 'AC Repair' },
          changedBy: { id: 'u-1', firstName: 'John', lastName: 'Doe', role: UserRole.VENDOR },
        },
      ]);

      prismaMock.workStatusHistory.findMany.mockResolvedValue([
        {
          id: 'wo-h-1',
          workOrderId: 'wo-1',
          fromStatus: 'ASSIGNED',
          toStatus: 'IN_PROGRESS',
          reason: 'Technician on site',
          changedAt: t2,
          workOrder: { workOrderNumber: 'WO-200', serviceRequestId: 'sr-1' },
          changedBy: { id: 'u-2', firstName: 'Alice', lastName: 'Smith', role: UserRole.VENDOR },
        },
      ]);

      prismaMock.payment.findMany.mockResolvedValue([]);

      const result = await activityService.getActivityTimeline('u-admin', { page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      // t2 (12:00) should appear before t1 (10:00)
      expect(result.items[0].id).toBe('wo-h-1');
      expect(result.items[1].id).toBe('sr-h-1');
      expect(result.pagination.totalItems).toBe(2);
    });

    it('should scope activity feed to own entities for CUSTOMER role', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'u-cust',
        role: UserRole.CUSTOMER,
        customerProfile: { id: 'c-profile-99' },
      });

      prismaMock.serviceRequestHistory.findMany.mockResolvedValue([]);
      prismaMock.workStatusHistory.findMany.mockResolvedValue([]);
      prismaMock.payment.findMany.mockResolvedValue([]);

      await activityService.getActivityTimeline('u-cust', { page: 1, limit: 10 });

      expect(prismaMock.serviceRequestHistory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            serviceRequest: { customerId: 'c-profile-99' },
          }),
        }),
      );
    });
  });

  describe('EntityHistoryService (Single Entity Lifecycle)', () => {
    it('should retrieve complete lifecycle history for a specific ServiceRequest', async () => {
      prismaMock.serviceRequest.findUnique.mockResolvedValue({
        id: 'sr-100',
        ticketNumber: 'SR-2026-001',
        title: 'Leaking Pipe',
        status: 'COMPLETED',
        createdAt: new Date('2026-07-20T08:00:00.000Z'),
        statusHistory: [
          {
            id: 'h-1',
            fromStatus: null,
            toStatus: 'CREATED',
            remarks: 'Request raised',
            createdAt: new Date('2026-07-20T08:00:00.000Z'),
            changedBy: { id: 'u-c', firstName: 'Customer', lastName: 'User', role: UserRole.CUSTOMER },
          },
          {
            id: 'h-2',
            fromStatus: 'CREATED',
            toStatus: 'ASSIGNED',
            remarks: 'Assigned to vendor',
            createdAt: new Date('2026-07-20T09:00:00.000Z'),
            changedBy: { id: 'u-a', firstName: 'Admin', lastName: 'User', role: UserRole.ADMIN },
          },
        ],
      });

      const history = await activityService.getEntityHistory('ServiceRequest', 'sr-100');

      expect(history).toHaveLength(2);
      expect(history[0].action).toBe('SERVICE_REQUEST_STATUS_CHANGED');
      expect(history[0].metadata?.toStatus).toBe('CREATED');
      expect(history[1].metadata?.toStatus).toBe('ASSIGNED');
    });
  });
});
