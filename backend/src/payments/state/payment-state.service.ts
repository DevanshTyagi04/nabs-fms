import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Prisma, RequestStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { RequestStateService } from '../../service-requests/state-machine/request-state.service';

// Allowed PaymentStatus transitions
const ALLOWED_PAYMENT_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING, PaymentStatus.SUCCESS, PaymentStatus.FAILED],
  [PaymentStatus.PROCESSING]: [PaymentStatus.SUCCESS, PaymentStatus.FAILED],
  [PaymentStatus.SUCCESS]: [PaymentStatus.REFUNDED], // Admin manual reconciliation / refund
  [PaymentStatus.FAILED]: [PaymentStatus.PENDING], // Retrying payment
  [PaymentStatus.REFUNDED]: [],
};

@Injectable()
export class PaymentStateService {
  private readonly logger = new Logger(PaymentStateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly requestStateService: RequestStateService,
  ) {}

  /**
   * Evaluates if a PaymentStatus transition is permitted
   */
  canTransition(fromStatus: PaymentStatus, toStatus: PaymentStatus): boolean {
    const allowed = ALLOWED_PAYMENT_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
  }

  /**
   * Centralized transition execution handling status mutation, optimistic concurrency,
   * audit logging, and public ServiceRequest state machine synchronization in a SINGLE transaction.
   */
  async transitionStatus(
    tx: Prisma.TransactionClient,
    params: {
      paymentId: string;
      currentStatus: PaymentStatus;
      targetStatus: PaymentStatus;
      expectedVersion: number;
      actorUserId: string;
      gatewayTransactionId?: string;
      paymentMethod?: PaymentMethod;
      reason?: string;
    },
  ) {
    const { paymentId, currentStatus, targetStatus, expectedVersion, actorUserId, gatewayTransactionId, paymentMethod, reason } = params;

    // 1. Enforce State Machine Transition Rules
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new UnprocessableEntityException(
        `Invalid payment status transition from [${currentStatus}] to [${targetStatus}]`,
      );
    }

    // 2. Optimistic Concurrency Update
    const updateData: Prisma.PaymentUpdateInput = {
      status: targetStatus,
      version: expectedVersion + 1,
      ...(gatewayTransactionId && { gatewayTransactionId }),
      ...(paymentMethod && { paymentMethod }),
      ...(targetStatus === PaymentStatus.SUCCESS && { paidAt: new Date() }),
    };

    const updated = await tx.payment.updateMany({
      where: {
        id: paymentId,
        version: expectedVersion,
      },
      data: updateData,
    });

    if (updated.count === 0) {
      throw new ConflictException(
        'Concurrent modification detected on Payment. Please refresh and try again.',
      );
    }

    // 3. Log audit event
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      select: { paymentNumber: true, serviceRequestId: true, serviceRequest: { select: { id: true, status: true, version: true } } },
    });

    if (payment && reason) {
      await tx.comment.create({
        data: {
          paymentId,
          userId: actorUserId,
          comment: `[Status Change: ${currentStatus} -> ${targetStatus}] ${reason}`,
        },
      });
    }

    // 4. Synchronize related ServiceRequest status strictly via public RequestStateService interface
    if (payment && payment.serviceRequest && targetStatus === PaymentStatus.SUCCESS) {
      const sr = payment.serviceRequest;
      if (sr.status !== RequestStatus.COMPLETED) {
        await this.requestStateService.transitionStatus(tx, {
          requestId: sr.id,
          currentStatus: sr.status,
          targetStatus: RequestStatus.COMPLETED,
          expectedVersion: sr.version,
          actorUserId,
          remarks: `Payment ${payment.paymentNumber} completed successfully`,
        });
      }
    }

    this.logger.log(
      `Payment transition executed: Payment [${paymentId}] [${currentStatus}] -> [${targetStatus}]`,
    );

    return {
      paymentId,
      newStatus: targetStatus,
      newVersion: expectedVersion + 1,
    };
  }
}
