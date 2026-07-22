import {
  ConflictException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma';

// Allowed InvoiceStatus transitions
const ALLOWED_INVOICE_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  [InvoiceStatus.DRAFT]: [InvoiceStatus.ISSUED, InvoiceStatus.CANCELLED],
  [InvoiceStatus.ISSUED]: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
  [InvoiceStatus.PAID]: [], // Immutable once paid
  [InvoiceStatus.CANCELLED]: [],
};

@Injectable()
export class InvoiceStateService {
  private readonly logger = new Logger(InvoiceStateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates if an InvoiceStatus transition is permitted
   */
  canTransition(fromStatus: InvoiceStatus, toStatus: InvoiceStatus): boolean {
    const allowed = ALLOWED_INVOICE_TRANSITIONS[fromStatus] || [];
    return allowed.includes(toStatus);
  }

  /**
   * Enforces financial immutability for issued/paid invoices
   */
  validateFinancialImmutability(currentInvoice: { status: InvoiceStatus }, attemptedFinancialChanges: boolean) {
    if (
      attemptedFinancialChanges &&
      (currentInvoice.status === InvoiceStatus.ISSUED || currentInvoice.status === InvoiceStatus.PAID)
    ) {
      throw new UnprocessableEntityException(
        `Financial details of ${currentInvoice.status} invoices are immutable and cannot be modified.`,
      );
    }
  }

  /**
   * Centralized transition execution handling status mutation, optimistic concurrency, and audit comments.
   */
  async transitionStatus(
    tx: Prisma.TransactionClient,
    params: {
      invoiceId: string;
      currentStatus: InvoiceStatus;
      targetStatus: InvoiceStatus;
      actorUserId: string;
      reason?: string;
    },
  ) {
    const { invoiceId, currentStatus, targetStatus, actorUserId, reason } = params;

    // 1. Enforce State Machine Transition Rules
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new UnprocessableEntityException(
        `Invalid invoice status transition from [${currentStatus}] to [${targetStatus}]`,
      );
    }

    // 2. Perform Update
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: targetStatus,
        updatedAt: new Date(),
      },
    });

    // 3. Log audit comment
    if (reason) {
      await tx.comment.create({
        data: {
          invoiceId,
          userId: actorUserId,
          comment: `[Invoice Transition: ${currentStatus} -> ${targetStatus}] ${reason}`,
        },
      });
    }

    this.logger.log(`Invoice transition executed: Invoice [${invoiceId}] [${currentStatus}] -> [${targetStatus}]`);

    return updated;
  }
}
