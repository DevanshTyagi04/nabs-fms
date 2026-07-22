import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';

// Map of allowed status transitions across FSM lifecycle
const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.CREATED]: [RequestStatus.ASSIGNED, RequestStatus.CANCELLED],
  [RequestStatus.ASSIGNED]: [RequestStatus.ASSIGNED, RequestStatus.CREATED, RequestStatus.SCHEDULED, RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.CANCELLED]: [],
  [RequestStatus.SURVEY_PENDING]: [RequestStatus.SURVEY_SUBMITTED, RequestStatus.CANCELLED],
  [RequestStatus.SURVEY_SUBMITTED]: [RequestStatus.SURVEY_APPROVED, RequestStatus.CANCELLED],
  [RequestStatus.SURVEY_APPROVED]: [RequestStatus.ESTIMATE_CREATED, RequestStatus.SCHEDULED, RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.ESTIMATE_CREATED]: [RequestStatus.AWAITING_APPROVAL, RequestStatus.CANCELLED],
  [RequestStatus.AWAITING_APPROVAL]: [RequestStatus.SCHEDULED, RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.ADVANCE_PENDING]: [RequestStatus.ADVANCE_RECEIVED, RequestStatus.CANCELLED],
  [RequestStatus.ADVANCE_RECEIVED]: [RequestStatus.SCHEDULED, RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.SCHEDULED]: [RequestStatus.IN_PROGRESS, RequestStatus.CANCELLED],
  [RequestStatus.IN_PROGRESS]: [RequestStatus.WORK_COMPLETED, RequestStatus.CANCELLED],
  [RequestStatus.WORK_COMPLETED]: [RequestStatus.QUALITY_CHECK, RequestStatus.COMPLETED, RequestStatus.CANCELLED],
  [RequestStatus.QUALITY_CHECK]: [RequestStatus.FINAL_PAYMENT_PENDING, RequestStatus.COMPLETED, RequestStatus.CANCELLED],
  [RequestStatus.FINAL_PAYMENT_PENDING]: [RequestStatus.COMPLETED, RequestStatus.CANCELLED],
  [RequestStatus.COMPLETED]: [RequestStatus.ARCHIVED],
  [RequestStatus.ARCHIVED]: [],
};

@Injectable()
export class RequestStateService {
  private readonly logger = new Logger(RequestStateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates whether a transition from fromStatus to toStatus is permitted
   */
  canTransition(fromStatus: RequestStatus | null, toStatus: RequestStatus): boolean {
    if (!fromStatus) {
      return toStatus === RequestStatus.CREATED;
    }
    const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
  }

  /**
   * Centralized transition execution handling status mutation, optimistic concurrency, and history entry
   */
  async transitionStatus(
    tx: Prisma.TransactionClient,
    params: {
      requestId: string;
      currentStatus: RequestStatus;
      targetStatus: RequestStatus;
      expectedVersion: number;
      actorUserId: string;
      remarks?: string;
      assignedVendorId?: string | null;
    },
  ) {
    const { requestId, currentStatus, targetStatus, expectedVersion, actorUserId, remarks, assignedVendorId } =
      params;

    // 1. Enforce State Machine Transition Rules
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new UnprocessableEntityException(
        `Invalid status transition from [${currentStatus}] to [${targetStatus}]`,
      );
    }

    // 2. Optimistic Concurrency Control Update
    const updateData: Prisma.ServiceRequestUpdateInput = {
      status: targetStatus,
      version: expectedVersion + 1,
      ...(assignedVendorId !== undefined && {
        assignedVendor: assignedVendorId ? { connect: { id: assignedVendorId } } : { disconnect: true },
      }),
    };

    const updated = await tx.serviceRequest.updateMany({
      where: {
        id: requestId,
        version: expectedVersion,
      },
      data: updateData,
    });

    if (updated.count === 0) {
      throw new ConflictException(
        'Concurrent modification detected. This request was updated by another user. Please refresh and try again.',
      );
    }

    // 3. Create mandatory ServiceRequestHistory record inside same transaction
    const history = await tx.serviceRequestHistory.create({
      data: {
        serviceRequestId: requestId,
        fromStatus: currentStatus,
        toStatus: targetStatus,
        changedById: actorUserId,
        remarks: remarks?.trim() || null,
      },
    });

    this.logger.log(
      `Status transition executed: Request [${requestId}] [${currentStatus}] -> [${targetStatus}] (History ID: ${history.id})`,
    );

    return {
      requestId,
      newStatus: targetStatus,
      newVersion: expectedVersion + 1,
      historyId: history.id,
    };
  }
}
