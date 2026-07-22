import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EstimateStatus, PaymentMethod, PaymentStatus, PaymentType, RequestStatus } from '@prisma/client';
import { MockPaymentGateway } from './gateway/mock-payment.gateway';
import { PaymentsService } from './payments.service';
import { PaymentStateService } from './state/payment-state.service';

describe('Payments Module (Phase 8 Unit & Integration Tests)', () => {
  let paymentsService: PaymentsService;
  let stateService: PaymentStateService;
  let mockGateway: MockPaymentGateway;
  let requestStateServiceMock: any;
  let eventEmitterMock: any;
  let prismaMock: any;

  beforeEach(() => {
    eventEmitterMock = {
      emit: jest.fn(),
    };

    requestStateServiceMock = {
      transitionStatus: jest.fn().mockResolvedValue({ requestId: 'sr-1', newStatus: RequestStatus.COMPLETED }),
    };

    prismaMock = {
      customerProfile: { findFirst: jest.fn() },
      serviceRequest: { findFirst: jest.fn() },
      payment: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        count: jest.fn(),
      },
      comment: { create: jest.fn().mockResolvedValue({ id: 'c-1' }) },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    mockGateway = new MockPaymentGateway();
    stateService = new PaymentStateService(prismaMock, requestStateServiceMock);
    paymentsService = new PaymentsService(
      prismaMock,
      stateService,
      requestStateServiceMock,
      mockGateway,
      eventEmitterMock,
    );
  });

  describe('PaymentStateService (State Machine)', () => {
    it('should allow valid transition PENDING -> SUCCESS', () => {
      expect(stateService.canTransition(PaymentStatus.PENDING, PaymentStatus.SUCCESS)).toBe(true);
    });

    it('should allow valid transition SUCCESS -> REFUNDED', () => {
      expect(stateService.canTransition(PaymentStatus.SUCCESS, PaymentStatus.REFUNDED)).toBe(true);
    });

    it('should disallow invalid transition REFUNDED -> SUCCESS', () => {
      expect(stateService.canTransition(PaymentStatus.REFUNDED, PaymentStatus.SUCCESS)).toBe(false);
    });
  });

  describe('PaymentsService Customer Operations & Idempotency', () => {
    it('should initiate payment session with PAY-YYYYMMDD-XXXX format for verified request', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.serviceRequest.findFirst.mockResolvedValue({
        id: 'sr-1',
        ticketNumber: 'SR-20260722-A1B2',
        status: RequestStatus.WORK_COMPLETED,
        estimates: [{ totalAmount: '1500.00' }],
        workOrders: [{ id: 'wo-1', status: 'COMPLETED' }],
      });
      prismaMock.payment.findFirst.mockResolvedValue(null);
      prismaMock.payment.create.mockResolvedValue({
        id: 'p-1',
        paymentNumber: 'PAY-20260805-A1B2',
        amount: '1500.00',
        gatewayOrderId: 'order_mock_PAY20260',
      });

      const res = await paymentsService.initiatePaymentCustomer('u-cust', {
        serviceRequestId: 'sr-1',
        paymentType: PaymentType.FINAL,
      });

      expect(res.paymentNumber).toMatch(/^PAY-\d{8}-[A-Z0-9]{4}$/);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('PAYMENT_CREATED', expect.objectContaining({ paymentId: 'p-1' }));
    });

    it('should return idempotent success when verifying an already SUCCESS payment', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'p-already-success',
        status: PaymentStatus.SUCCESS,
        serviceRequest: { customerId: 'c-1' },
      });

      const res = await paymentsService.verifyPaymentCustomer('u-cust', {
        paymentId: 'p-already-success',
        gatewayOrderId: 'order_123',
        gatewayPaymentId: 'pay_123',
        gatewaySignature: 'sig_123',
      });

      expect(res.isIdempotent).toBe(true);
      expect(res.status).toBe(PaymentStatus.SUCCESS);
    });

    it('should fail payment verification on invalid signature and transition payment to FAILED', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'p-pending',
        status: PaymentStatus.PENDING,
        version: 1,
        serviceRequest: { customerId: 'c-1' },
      });
      prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });

      await expect(
        paymentsService.verifyPaymentCustomer('u-cust', {
          paymentId: 'p-pending',
          gatewayOrderId: 'order_123',
          gatewayPaymentId: 'pay_123',
          gatewaySignature: 'invalid_tampered_signature',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(eventEmitterMock.emit).toHaveBeenCalledWith('PAYMENT_FAILED', expect.objectContaining({ paymentId: 'p-pending' }));
    });

    it('should complete payment verification on valid signature, set paidAt, and sync ServiceRequest to COMPLETED', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-1' });
      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'p-pending',
        paymentNumber: 'PAY-100',
        status: PaymentStatus.PENDING,
        version: 1,
        serviceRequest: { customerId: 'c-1' },
      });
      prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.payment.findUnique.mockResolvedValue({
        paymentNumber: 'PAY-100',
        serviceRequest: { id: 'sr-1', status: RequestStatus.WORK_COMPLETED, version: 1 },
      });

      const res = await paymentsService.verifyPaymentCustomer('u-cust', {
        paymentId: 'p-pending',
        gatewayOrderId: 'order_123',
        gatewayPaymentId: 'pay_123',
        gatewaySignature: 'valid_signature_hash',
        paymentMethod: PaymentMethod.CARD,
      });

      expect(res.status).toBe(PaymentStatus.SUCCESS);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('PAYMENT_SUCCESS', expect.objectContaining({ paymentId: 'p-pending' }));
      expect(requestStateServiceMock.transitionStatus).toHaveBeenCalledWith(
        prismaMock,
        expect.objectContaining({ requestId: 'sr-1', targetStatus: RequestStatus.COMPLETED }),
      );
    });

    it('should reject webhook processing when payment amount mismatches expected amount in DB', async () => {
      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'p-mismatch',
        amount: '1500.00', // Expected 1500 INR
        status: PaymentStatus.PENDING,
        version: 1,
      });
      prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });

      const webhookPayload = JSON.stringify({
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              order_id: 'order_mismatch',
              id: 'pay_mismatch',
              amount: 50000, // Reported 500.00 INR (mismatch!)
            },
          },
        },
      });

      const res = await paymentsService.handleRazorpayWebhook(webhookPayload, 'valid_sig');

      expect(res.status).toBe('rejected_amount_mismatch');
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('PAYMENT_FAILED', expect.objectContaining({ paymentId: 'p-mismatch', reason: 'AMOUNT_MISMATCH' }));
    });
  });

  describe('PaymentsService Admin Operations', () => {
    it('should allow Admin to manually reconcile cash payment to SUCCESS', async () => {
      prismaMock.payment.findFirst.mockResolvedValue({
        id: 'p-cash',
        status: PaymentStatus.PENDING,
        version: 1,
      });
      prismaMock.payment.updateMany.mockResolvedValue({ count: 1 });
      prismaMock.payment.findUnique.mockResolvedValue({
        paymentNumber: 'PAY-CASH-1',
        serviceRequest: { id: 'sr-1', status: RequestStatus.WORK_COMPLETED, version: 1 },
      });

      const res = await paymentsService.reconcilePaymentAdmin('u-admin', 'p-cash', {
        paymentMethod: PaymentMethod.CASH,
        remarks: 'Collected cash payment on site',
      });

      expect(res.message).toContain('reconciled successfully');
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('PAYMENT_SUCCESS', expect.objectContaining({ paymentId: 'p-cash', source: 'ADMIN_RECONCILE' }));
    });
  });
});
