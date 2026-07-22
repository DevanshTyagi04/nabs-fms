import { NotificationType } from '@prisma/client';
import { JOB_CLEANUP_EXPIRED_TOKENS, QUEUE_INVOICE, QUEUE_NOTIFICATION } from './constants/job-queues.constant';
import { JobsService } from './jobs.service';
import { CleanupProcessor } from './processors/cleanup.processor';
import { InvoiceProcessor } from './processors/invoice.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { PaymentProcessor } from './processors/payment.processor';
import { QueueService } from './queues/queue.service';
import { SchedulerService } from './scheduler/scheduler.service';

describe('Background Jobs & Scheduler Module (Phase 13 Unit & Integration Tests)', () => {
  let jobsService: JobsService;
  let queueService: QueueService;
  let schedulerService: SchedulerService;
  let notificationProcessor: NotificationProcessor;
  let invoiceProcessor: InvoiceProcessor;
  let paymentProcessor: PaymentProcessor;
  let cleanupProcessor: CleanupProcessor;

  let dispatcherMock: any;
  let pdfServiceMock: any;
  let authServiceMock: any;
  let prismaMock: any;
  let configServiceMock: any;

  beforeEach(() => {
    dispatcherMock = {
      dispatchToRecipient: jest.fn().mockResolvedValue({ delivered: true }),
      dispatchToMultipleRecipients: jest.fn().mockResolvedValue([{ delivered: true }]),
    };

    pdfServiceMock = {
      generateAndSavePdf: jest.fn().mockResolvedValue('http://localhost:3000/uploads/invoices/INV-1.html'),
    };

    authServiceMock = {
      cleanupExpiredTokens: jest.fn().mockResolvedValue({ count: 5 }),
    };

    prismaMock = {
      invoice: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'inv-1') {
            return Promise.resolve({
              id: 'inv-1',
              invoiceNumber: 'INV-100',
              issuedAt: new Date(),
              status: 'ISSUED',
              totalAmount: 500,
              paidAmount: 500,
              dueAmount: 0,
              pdfUrl: null,
              payment: {
                paymentNumber: 'PAY-1',
                paymentMethod: 'UPI',
                gatewayTransactionId: 'tx-1',
                serviceRequest: {
                  ticketNumber: 'SR-100',
                  title: 'AC Repair',
                  customer: { firstName: 'John', lastName: 'Doe', companyName: 'ACME', user: { email: 'john@example.com' } },
                  assignedVendor: { businessName: 'Cooling Inc' },
                },
              },
            });
          }
          if (where.id === 'inv-already-pdf') {
            return Promise.resolve({
              id: 'inv-already-pdf',
              invoiceNumber: 'INV-100',
              issuedAt: new Date(),
              status: 'ISSUED',
              totalAmount: 500,
              paidAmount: 500,
              dueAmount: 0,
              pdfUrl: 'http://localhost:3000/existing.html',
            });
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockResolvedValue({ id: 'inv-1', pdfUrl: 'http://localhost:3000/uploads/invoices/INV-1.html' }),
      },
      payment: { findUnique: jest.fn() },
      notification: { deleteMany: jest.fn().mockResolvedValue({ count: 12 }) },
    };

    configServiceMock = {
      get: jest.fn().mockReturnValue('test'),
    };

    queueService = new QueueService(configServiceMock);
    jobsService = new JobsService(queueService);
    notificationProcessor = new NotificationProcessor(queueService, dispatcherMock);
    invoiceProcessor = new InvoiceProcessor(queueService, prismaMock, pdfServiceMock);
    paymentProcessor = new PaymentProcessor(queueService, prismaMock);
    cleanupProcessor = new CleanupProcessor(queueService, prismaMock, authServiceMock);

    notificationProcessor.onModuleInit();
    invoiceProcessor.onModuleInit();
    paymentProcessor.onModuleInit();
    cleanupProcessor.onModuleInit();

    schedulerService = new SchedulerService(queueService);
  });

  describe('QueueService (Idempotency, Retries, & Stats)', () => {
    it('should enqueue job and enforce deterministic Idempotency Keys', async () => {
      const payload = {
        recipientId: 'u-1',
        title: 'Title',
        body: 'Body',
        type: NotificationType.SYSTEM,
        eventId: 'evt-100',
      };

      const res1 = await jobsService.enqueueNotification(payload);
      expect(res1.isDuplicate).toBe(false);

      // Attempting to add duplicate job with same jobId
      const res2 = await jobsService.enqueueNotification(payload);
      expect(res2.isDuplicate).toBe(true);
    });

    it('should track queue statistics for admin monitoring', async () => {
      await jobsService.enqueueInvoicePdfGeneration({ invoiceId: 'inv-1' });

      const stats = await jobsService.getQueueMetricsAdmin();
      const invoiceQueueStats = stats.find((s) => s.queueName === QUEUE_INVOICE);

      expect(invoiceQueueStats).toBeDefined();
      expect(invoiceQueueStats?.totalEnqueued).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Processors (Notification, Invoice PDF, Payment, Cleanup)', () => {
    it('InvoiceProcessor should skip PDF rendering if pdfUrl already exists (Idempotency)', async () => {
      const res = await invoiceProcessor.processInvoicePdf({ invoiceId: 'inv-already-pdf' });

      expect(res.isIdempotent).toBe(true);
      expect(pdfServiceMock.generateAndSavePdf).not.toHaveBeenCalled();
    });

    it('CleanupProcessor should execute token cleanup via AuthService', async () => {
      const res = await cleanupProcessor.processExpiredTokenCleanup({ taskName: 'TokenCleanup' });
      expect(authServiceMock.cleanupExpiredTokens).toHaveBeenCalled();
      expect(res.count).toBe(5);
    });
  });

  describe('SchedulerService (Scheduler Isolation)', () => {
    it('should enqueue maintenance jobs to QUEUE_MAINTENANCE without executing cleanup directly', async () => {
      const spy = jest.spyOn(queueService, 'addJob');

      await schedulerService.scheduleTokenCleanupJob();

      expect(spy).toHaveBeenCalledWith(
        'QUEUE_MAINTENANCE',
        JOB_CLEANUP_EXPIRED_TOKENS,
        expect.objectContaining({ taskName: 'TokenCleanup' }),
        expect.objectContaining({ attempts: 3 }),
      );
    });
  });
});
