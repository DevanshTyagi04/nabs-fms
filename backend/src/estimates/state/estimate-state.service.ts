import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EstimateStatus, Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';

// Map of allowed EstimateStatus transitions
const ALLOWED_ESTIMATE_TRANSITIONS: Record<EstimateStatus, EstimateStatus[]> = {
  [EstimateStatus.DRAFT]: [EstimateStatus.PENDING_APPROVAL],
  [EstimateStatus.PENDING_APPROVAL]: [
    EstimateStatus.APPROVED,
    EstimateStatus.REJECTED,
    EstimateStatus.SUPERSEDED,
    EstimateStatus.REVISED,
  ],
  [EstimateStatus.APPROVED]: [EstimateStatus.SUPERSEDED, EstimateStatus.REVISED],
  [EstimateStatus.REJECTED]: [EstimateStatus.SUPERSEDED, EstimateStatus.REVISED],
  [EstimateStatus.REVISED]: [EstimateStatus.SUPERSEDED],
  [EstimateStatus.SUPERSEDED]: [],
};

@Injectable()
export class EstimateStateService {
  private readonly logger = new Logger(EstimateStateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates if an EstimateStatus transition is permitted
   */
  canTransition(fromStatus: EstimateStatus, toStatus: EstimateStatus): boolean {
    const allowed = ALLOWED_ESTIMATE_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
  }

  /**
   * Executes atomic estimate status transition with optimistic concurrency check
   */
  async transitionStatus(
    tx: Prisma.TransactionClient,
    params: {
      estimateId: string;
      currentStatus: EstimateStatus;
      targetStatus: EstimateStatus;
      expectedVersion: number;
      actorUserId: string;
      remarks?: string;
    },
  ) {
    const { estimateId, currentStatus, targetStatus, expectedVersion, actorUserId, remarks } = params;

    // 1. Enforce Estimate State Machine Rules
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new UnprocessableEntityException(
        `Invalid estimate status transition from [${currentStatus}] to [${targetStatus}]`,
      );
    }

    // 2. Optimistic Concurrency Update
    const updated = await tx.estimate.updateMany({
      where: {
        id: estimateId,
        version: expectedVersion,
      },
      data: {
        status: targetStatus,
        ...(targetStatus === EstimateStatus.APPROVED && { approvedAt: new Date() }),
        ...(targetStatus === EstimateStatus.REJECTED && { rejectedAt: new Date() }),
      },
    });

    if (updated.count === 0) {
      throw new ConflictException(
        'Concurrent modification detected on estimate. Please refresh and try again.',
      );
    }

    // 3. Sync related ServiceRequest status cleanly via loose coupling
    const estimate = await tx.estimate.findUnique({
      where: { id: estimateId },
      select: { serviceRequestId: true },
    });

    if (estimate && targetStatus === EstimateStatus.APPROVED) {
      await tx.serviceRequest.updateMany({
        where: { id: estimate.serviceRequestId },
        data: { status: RequestStatus.AWAITING_APPROVAL },
      });
      await tx.serviceRequestHistory.create({
        data: {
          serviceRequestId: estimate.serviceRequestId,
          fromStatus: RequestStatus.SURVEY_APPROVED,
          toStatus: RequestStatus.AWAITING_APPROVAL,
          changedById: actorUserId,
          remarks: remarks || 'Quotation estimate approved by customer',
        },
      });
    }

    this.logger.log(
      `Estimate transition executed: Estimate [${estimateId}] [${currentStatus}] -> [${targetStatus}]`,
    );

    return {
      estimateId,
      newStatus: targetStatus,
    };
  }
}
