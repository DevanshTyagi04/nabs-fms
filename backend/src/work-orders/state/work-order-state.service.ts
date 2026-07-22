import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, RequestStatus, WorkOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { RequestStateService } from '../../service-requests/state-machine/request-state.service';

// Allowed WorkOrderStatus transitions
const ALLOWED_WORK_ORDER_TRANSITIONS: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.SCHEDULED, WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.SCHEDULED]: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.ON_HOLD, WorkOrderStatus.COMPLETED, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.ON_HOLD]: [WorkOrderStatus.IN_PROGRESS, WorkOrderStatus.CANCELLED],
  [WorkOrderStatus.COMPLETED]: [WorkOrderStatus.COMPLETED], // Admin verification milestone
  [WorkOrderStatus.CANCELLED]: [],
};

@Injectable()
export class WorkOrderStateService {
  private readonly logger = new Logger(WorkOrderStateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly requestStateService: RequestStateService,
  ) {}

  /**
   * Evaluates if a WorkOrderStatus transition is permitted
   */
  canTransition(fromStatus: WorkOrderStatus, toStatus: WorkOrderStatus): boolean {
    const allowed = ALLOWED_WORK_ORDER_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
  }

  /**
   * Centralized transition execution handling status mutation, optimistic concurrency,
   * WorkStatusHistory creation, WorkTimeline logging, and public service interface synchronization.
   */
  async transitionStatus(
    tx: Prisma.TransactionClient,
    params: {
      workOrderId: string;
      currentStatus: WorkOrderStatus;
      targetStatus: WorkOrderStatus;
      expectedVersion: number;
      actorUserId: string;
      reason?: string;
      eventTitle: string;
      eventDescription?: string;
    },
  ) {
    const { workOrderId, currentStatus, targetStatus, expectedVersion, actorUserId, reason, eventTitle, eventDescription } = params;

    // 1. Enforce State Machine Transition Rules
    if (!this.canTransition(currentStatus, targetStatus) && !(currentStatus === WorkOrderStatus.COMPLETED && targetStatus === WorkOrderStatus.COMPLETED)) {
      throw new UnprocessableEntityException(
        `Invalid work order status transition from [${currentStatus}] to [${targetStatus}]`,
      );
    }

    // 2. Optimistic Concurrency Update
    const updateData: Prisma.WorkOrderUpdateInput = {
      status: targetStatus,
      version: expectedVersion + 1,
      ...(targetStatus === WorkOrderStatus.IN_PROGRESS && {
        startedAt: new Date(),
        actualStartTime: new Date(),
      }),
      ...(targetStatus === WorkOrderStatus.COMPLETED && {
        completedAt: new Date(),
        actualEndTime: new Date(),
      }),
    };

    const updated = await tx.workOrder.updateMany({
      where: {
        id: workOrderId,
        version: expectedVersion,
      },
      data: updateData,
    });

    if (updated.count === 0) {
      throw new ConflictException(
        'Concurrent modification detected on Work Order. Please refresh and try again.',
      );
    }

    // 3. Create mandatory WorkStatusHistory record in same transaction
    const history = await tx.workStatusHistory.create({
      data: {
        workOrderId,
        fromStatus: currentStatus,
        toStatus: targetStatus,
        changedById: actorUserId,
        reason: reason?.trim() || null,
      },
    });

    // 4. Create mandatory WorkTimeline record in same transaction
    const timeline = await tx.workTimeline.create({
      data: {
        workOrderId,
        eventTitle,
        eventDescription: eventDescription || reason || null,
        actorId: actorUserId,
        timestamp: new Date(),
      },
    });

    // 5. Synchronize related ServiceRequest status via public RequestStateService interface
    const wo = await tx.workOrder.findUnique({
      where: { id: workOrderId },
      select: { serviceRequest: { select: { id: true, status: true, version: true } } },
    });

    if (wo && wo.serviceRequest) {
      const sr = wo.serviceRequest;
      if (targetStatus === WorkOrderStatus.IN_PROGRESS && sr.status !== RequestStatus.IN_PROGRESS) {
        await this.requestStateService.transitionStatus(tx, {
          requestId: sr.id,
          currentStatus: sr.status,
          targetStatus: RequestStatus.IN_PROGRESS,
          expectedVersion: sr.version,
          actorUserId,
          remarks: 'Work order execution commenced by vendor',
        });
      } else if (targetStatus === WorkOrderStatus.COMPLETED && sr.status !== RequestStatus.WORK_COMPLETED) {
        await this.requestStateService.transitionStatus(tx, {
          requestId: sr.id,
          currentStatus: sr.status,
          targetStatus: RequestStatus.WORK_COMPLETED,
          expectedVersion: sr.version,
          actorUserId,
          remarks: 'Work order execution completed by vendor',
        });
      }
    }

    this.logger.log(
      `Work Order transition executed: WorkOrder [${workOrderId}] [${currentStatus}] -> [${targetStatus}] (History ID: ${history.id}, Timeline ID: ${timeline.id})`,
    );

    return {
      workOrderId,
      newStatus: targetStatus,
      newVersion: expectedVersion + 1,
      historyId: history.id,
      timelineId: timeline.id,
    };
  }
}
