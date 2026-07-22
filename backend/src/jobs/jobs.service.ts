import { Injectable, Logger } from '@nestjs/common';
import {
  JOB_DISPATCH_MULTI_NOTIFICATION,
  JOB_DISPATCH_NOTIFICATION,
  JOB_GENERATE_INVOICE_PDF,
  JOB_RECONCILE_PAYMENT_ASYNC,
  QUEUE_INVOICE,
  QUEUE_NOTIFICATION,
  QUEUE_PAYMENT,
} from './constants/job-queues.constant';
import {
  InvoicePdfJobPayload,
  MultiNotificationJobPayload,
  NotificationJobPayload,
  PaymentReconcileJobPayload,
} from './interfaces/job-payload.interface';
import { QueueService } from './queues/queue.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(private readonly queueService: QueueService) {}

  /**
   * Enqueues single notification delivery job (Transactional post-commit & Idempotent)
   */
  async enqueueNotification(payload: NotificationJobPayload) {
    const jobId = `notification:${payload.recipientId}:${payload.type}:${payload.eventId || Date.now()}`;
    return this.queueService.addJob(
      QUEUE_NOTIFICATION,
      JOB_DISPATCH_NOTIFICATION,
      payload,
      { jobId, attempts: 5 },
    );
  }

  /**
   * Enqueues multi-recipient notification delivery job
   */
  async enqueueMultiNotification(payload: MultiNotificationJobPayload) {
    const jobId = `multi-notification:${payload.type}:${payload.eventId || Date.now()}`;
    return this.queueService.addJob(
      QUEUE_NOTIFICATION,
      JOB_DISPATCH_MULTI_NOTIFICATION,
      payload,
      { jobId, attempts: 5 },
    );
  }

  /**
   * Enqueues invoice PDF rendering & storage upload job
   */
  async enqueueInvoicePdfGeneration(payload: InvoicePdfJobPayload) {
    const jobId = `invoice-pdf:${payload.invoiceId}`;
    return this.queueService.addJob(
      QUEUE_INVOICE,
      JOB_GENERATE_INVOICE_PDF,
      payload,
      { jobId, attempts: 5 },
    );
  }

  /**
   * Enqueues asynchronous payment reconciliation retry job
   */
  async enqueuePaymentReconciliation(payload: PaymentReconcileJobPayload) {
    const jobId = `payment-reconcile:${payload.paymentId}`;
    return this.queueService.addJob(
      QUEUE_PAYMENT,
      JOB_RECONCILE_PAYMENT_ASYNC,
      payload,
      { jobId, attempts: 5 },
    );
  }

  /**
   * Admin: Retrieves current queue monitoring metrics
   */
  async getQueueMetricsAdmin() {
    return this.queueService.getQueueStats();
  }
}
