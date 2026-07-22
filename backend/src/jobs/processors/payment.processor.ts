import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { JOB_RECONCILE_PAYMENT_ASYNC } from '../constants/job-queues.constant';
import { PaymentReconcileJobPayload } from '../interfaces/job-payload.interface';
import { QueueService } from '../queues/queue.service';

@Injectable()
export class PaymentProcessor implements OnModuleInit {
  private readonly logger = new Logger(PaymentProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    this.queueService.registerProcessor(
      JOB_RECONCILE_PAYMENT_ASYNC,
      (data: PaymentReconcileJobPayload) => this.processPaymentReconcile(data),
    );
  }

  async processPaymentReconcile(payload: PaymentReconcileJobPayload) {
    this.logger.log(`Processing background payment reconciliation job for Payment [${payload.paymentId}]`);

    const payment = await this.prisma.payment.findUnique({
      where: { id: payload.paymentId },
      select: { id: true, status: true, paymentNumber: true },
    });

    if (!payment) {
      throw new Error(`Payment record not found: [${payload.paymentId}]`);
    }

    // Idempotency Check: Skip if already finalized
    if (payment.status === PaymentStatus.SUCCESS || payment.status === PaymentStatus.FAILED) {
      this.logger.log(`[IDEMPOTENCY] Payment [${payment.paymentNumber}] is already in status ${payment.status}. Skipping reconciliation.`);
      return { status: payment.status, isIdempotent: true };
    }

    this.logger.log(`Payment [${payment.paymentNumber}] pending async reconciliation check completed.`);
    return { status: payment.status };
  }
}
