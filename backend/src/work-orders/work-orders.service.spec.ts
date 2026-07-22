import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EstimateStatus, RequestStatus, TaskStatus, WorkOrderStatus } from '@prisma/client';
import { RequestStateService } from '../service-requests/state-machine/request-state.service';
import { WorkOrderStateService } from './state/work-order-state.service';
import { WorkTaskService } from './tasks/work-task.service';
import { WorkOrdersService } from './work-orders.service';

describe('WorkOrders Module (Phase 7 Unit & Integration Tests)', () => {
  let workOrdersService: WorkOrdersService;
  let stateService: WorkOrderStateService;
  let taskService: WorkTaskService;
  let requestStateServiceMock: any;
  let eventEmitterMock: any;
  let prismaMock: any;

  beforeEach(() => {
    eventEmitterMock = {
      emit: jest.fn(),
    };

    requestStateServiceMock = {
      transitionStatus: jest.fn().mockResolvedValue({ requestId: 'sr-1', newStatus: RequestStatus.SCHEDULED }),
    };

    prismaMock = {
      vendorProfile: { findFirst: jest.fn() },
      customerProfile: { findFirst: jest.fn() },
      serviceRequest: { findUnique: jest.fn(), updateMany: jest.fn() },
      serviceRequestHistory: { create: jest.fn().mockResolvedValue({ id: 'srh-1' }) },
      estimate: { findUnique: jest.fn() },
      workOrder: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      workTask: {
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      workTimeline: {
        create: jest.fn().mockResolvedValue({ id: 'wt-1' }),
        findMany: jest.fn(),
      },
      workStatusHistory: {
        create: jest.fn().mockResolvedValue({ id: 'wsh-1' }),
      },
      comment: { create: jest.fn().mockResolvedValue({ id: 'c-1', comment: 'Log' }) },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    stateService = new WorkOrderStateService(prismaMock, requestStateServiceMock);
    taskService = new WorkTaskService(prismaMock);
    workOrdersService = new WorkOrdersService(prismaMock, stateService, requestStateServiceMock, eventEmitterMock);
  });

  describe('WorkOrderStateService (State Machine & History/Timeline Integrity)', () => {
    it('should allow valid transition ASSIGNED -> IN_PROGRESS', () => {
      expect(stateService.canTransition(WorkOrderStatus.ASSIGNED, WorkOrderStatus.IN_PROGRESS)).toBe(true);
    });

    it('should allow valid transition IN_PROGRESS -> ON_HOLD -> IN_PROGRESS', () => {
      expect(stateService.canTransition(WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.ON_HOLD)).toBe(true);
      expect(stateService.canTransition(WorkOrderStatus.ON_HOLD, WorkOrderStatus.IN_PROGRESS)).toBe(true);
    });

    it('should disallow invalid transition COMPLETED -> IN_PROGRESS', () => {
      expect(stateService.canTransition(WorkOrderStatus.COMPLETED, WorkOrderStatus.IN_PROGRESS)).toBe(false);
    });

    it('should create BOTH WorkStatusHistory AND WorkTimeline records in the SAME transaction on transition', async () => {
      prismaMock.workOrder.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.workOrder.findUnique.mockResolvedValue({ serviceRequestId: 'sr-1', serviceRequest: { id: 'sr-1', status: RequestStatus.SCHEDULED, version: 1 } });

      await stateService.transitionStatus(prismaMock, {
        workOrderId: 'wo-1',
        currentStatus: WorkOrderStatus.ASSIGNED,
        targetStatus: WorkOrderStatus.IN_PROGRESS,
        expectedVersion: 1,
        actorUserId: 'u-vendor',
        reason: 'Work started',
        eventTitle: 'WORK_STARTED',
      });

      expect(prismaMock.workStatusHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workOrderId: 'wo-1',
          fromStatus: WorkOrderStatus.ASSIGNED,
          toStatus: WorkOrderStatus.IN_PROGRESS,
        }),
      });

      expect(prismaMock.workTimeline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          workOrderId: 'wo-1',
          eventTitle: 'WORK_STARTED',
        }),
      });

      expect(requestStateServiceMock.transitionStatus).toHaveBeenCalledWith(
        prismaMock,
        expect.objectContaining({
          requestId: 'sr-1',
          targetStatus: RequestStatus.IN_PROGRESS,
        }),
      );
    });
  });

  describe('WorkOrdersService Creation & Admin Verification', () => {
    it('should create Work Order from APPROVED estimate with WO-YYYYMMDD-XXXX format and emit domain event post-transaction', async () => {
      prismaMock.estimate.findUnique.mockResolvedValue({
        id: 'est-1',
        status: EstimateStatus.APPROVED,
        serviceRequestId: 'sr-1',
        serviceRequest: { id: 'sr-1', assignedVendorId: 'v-1', status: RequestStatus.AWAITING_APPROVAL, version: 1 },
      });
      prismaMock.workOrder.findFirst.mockResolvedValue(null);
      prismaMock.workOrder.create.mockResolvedValue({
        id: 'wo-1',
        workOrderNumber: 'WO-20260805-A1B2',
        status: WorkOrderStatus.ASSIGNED,
      });

      const res = await workOrdersService.createWorkOrderAdmin('u-admin', {
        estimateId: 'est-1',
        scheduledStart: '2026-08-05T09:00:00Z',
        scheduledEnd: '2026-08-05T17:00:00Z',
      });

      expect(res.workOrder.workOrderNumber).toMatch(/^WO-\d{8}-[A-Z0-9]{4}$/);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('WORK_ORDER_CREATED', expect.objectContaining({ workOrderId: 'wo-1' }));
      expect(requestStateServiceMock.transitionStatus).toHaveBeenCalledWith(
        prismaMock,
        expect.objectContaining({
          requestId: 'sr-1',
          targetStatus: RequestStatus.SCHEDULED,
        }),
      );
    });

    it('should verify completed Work Order and emit WORK_VERIFIED domain event', async () => {
      prismaMock.workOrder.findFirst.mockResolvedValue({
        id: 'wo-completed',
        status: WorkOrderStatus.COMPLETED,
        version: 2,
        tasks: [],
        timelineEvents: [],
        statusHistory: [],
        comments: [],
        attachments: [],
      });
      prismaMock.workOrder.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.workOrder.findUnique.mockResolvedValue({ serviceRequestId: 'sr-1' });

      const res = await workOrdersService.verifyWorkOrderAdmin('u-admin', 'wo-completed', 'QA verified');

      expect(res.message).toContain('verified successfully');
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('WORK_VERIFIED', expect.objectContaining({ workOrderId: 'wo-completed' }));
    });
  });

  describe('WorkOrdersService Vendor Workflow & Completion Validations', () => {
    it('should fail work completion if checklist tasks remain uncompleted', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.workOrder.findFirst.mockResolvedValue({
        id: 'wo-uncompleted-tasks',
        assignedVendorId: 'v-1',
        status: WorkOrderStatus.IN_PROGRESS,
        tasks: [{ id: 'task-1', description: 'Replace coil', status: TaskStatus.PENDING }],
        attachments: [{ id: 'att-1' }],
      });

      await expect(
        workOrdersService.completeWorkVendor('u-vendor', 'wo-uncompleted-tasks'),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('should fail work completion if 0 completion photo attachments exist', async () => {
      prismaMock.vendorProfile.findFirst.mockResolvedValue({ id: 'v-1' });
      prismaMock.workOrder.findFirst.mockResolvedValue({
        id: 'wo-no-attachments',
        assignedVendorId: 'v-1',
        status: WorkOrderStatus.IN_PROGRESS,
        tasks: [{ id: 'task-1', description: 'Replace coil', status: TaskStatus.COMPLETED }],
        attachments: [],
      });

      await expect(
        workOrdersService.completeWorkVendor('u-vendor', 'wo-no-attachments'),
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });
});
