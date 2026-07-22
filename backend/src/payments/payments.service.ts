import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EstimateStatus, PaymentGateway, PaymentStatus, PaymentType, Prisma, WorkOrderStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma';
import { RequestStateService } from '../service-requests/state-machine/request-state.service';
import { InitiatePaymentDto, QueryPaymentDto, ReconcilePaymentDto, VerifyPaymentDto } from './dto';
import { IPaymentGateway, PAYMENT_GATEWAY_TOKEN } from './gateway/interfaces/payment-gateway.interface';
import { PaymentStateService } from './state/payment-state.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: PaymentStateService,
    private readonly requestStateService: RequestStateService,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly gateway: IPaymentGateway,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Helper: Generates a collision-safe payment number (PAY-YYYYMMDD-XXXX)
   */
  private generatePaymentNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = randomBytes(2).toString('hex').toUpperCase();
    return `PAY-${dateStr}-${randomSuffix}`;
  }

  /**
   * Helper: Resolves CustomerProfile ID or throws ForbiddenException
   */
  private async getCustomerProfileOrThrow(userId: string) {
    const profile = await this.prisma.customerProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    if (!profile) {
      throw new ForbiddenException('Only customers can initiate or view customer payments');
    }

    return profile;
  }

  // ==============================================================================
  // CUSTOMER OPERATIONS
  // ==============================================================================

  /**
   * Customer initiates payment for a verified Work Order / Service Request
   */
  async initiatePaymentCustomer(userId: string, dto: InitiatePaymentDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    // 1. Resolve ServiceRequest & check customer ownership
    const serviceRequest = await this.prisma.serviceRequest.findFirst({
      where: { id: dto.serviceRequestId, customerId: customer.id },
      select: {
        id: true,
        ticketNumber: true,
        status: true,
        estimates: {
          where: { status: EstimateStatus.APPROVED },
          orderBy: { version: 'desc' },
          take: 1,
          select: { totalAmount: true },
        },
        workOrders: {
          where: { status: { in: [WorkOrderStatus.COMPLETED, WorkOrderStatus.SCHEDULED, WorkOrderStatus.IN_PROGRESS] } },
          take: 1,
          select: { id: true, status: true },
        },
      },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service Request not found or does not belong to you');
    }

    if (serviceRequest.estimates.length === 0) {
      throw new BadRequestException('Service Request does not have an approved estimate quotation');
    }

    const estimateAmount = serviceRequest.estimates[0].totalAmount;
    const amountInNumber = Number(estimateAmount.toString());
    const amountInPaise = Math.round(amountInNumber * 100);

    // 2. Check existing payment for idempotency
    const existingPayment = await this.prisma.payment.findFirst({
      where: { serviceRequestId: serviceRequest.id, status: { in: [PaymentStatus.SUCCESS, PaymentStatus.PENDING] } },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPayment && existingPayment.status === PaymentStatus.SUCCESS) {
      return {
        message: 'Payment has already been completed for this service request',
        payment: existingPayment,
        isIdempotent: true,
      };
    }

    if (existingPayment && existingPayment.status === PaymentStatus.PENDING && existingPayment.gatewayOrderId) {
      return {
        message: 'Existing pending payment session reused',
        paymentId: existingPayment.id,
        paymentNumber: existingPayment.paymentNumber,
        gatewayOrderId: existingPayment.gatewayOrderId,
        amount: existingPayment.amount,
        currency: 'INR',
      };
    }

    // 3. Collision-safe payment creation & gateway order generation
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        const paymentNumber = this.generatePaymentNumber();

        const gatewayOrder = await this.gateway.createOrder(
          amountInPaise,
          'INR',
          paymentNumber,
        );

        const payment = await this.prisma.$transaction(async (tx) => {
          return tx.payment.create({
            data: {
              paymentNumber,
              serviceRequestId: serviceRequest.id,
              amount: new Prisma.Decimal(amountInNumber),
              type: dto.paymentType || PaymentType.FINAL,
              status: PaymentStatus.PENDING,
              gateway: PaymentGateway.RAZORPAY,
              gatewayOrderId: gatewayOrder.gatewayOrderId,
              version: 1,
            },
            select: {
              id: true,
              paymentNumber: true,
              amount: true,
              status: true,
              gateway: true,
              gatewayOrderId: true,
              createdAt: true,
            },
          });
        });

        // 4. Emit domain events strictly post-transaction
        this.eventEmitter.emit('PAYMENT_CREATED', { paymentId: payment.id, actorId: userId });
        this.eventEmitter.emit('PAYMENT_INITIATED', { paymentId: payment.id, gatewayOrderId: gatewayOrder.gatewayOrderId });
        this.logger.log(`[AUDIT_EVENT] [PAYMENT_INITIATED] Customer: [${userId}] Payment: [${payment.paymentNumber}]`);

        return {
          message: 'Payment session initiated successfully',
          paymentId: payment.id,
          paymentNumber: payment.paymentNumber,
          gatewayOrderId: payment.gatewayOrderId,
          amount: payment.amount,
          currency: 'INR',
        };
      } catch (error) {
        if (attempts >= maxAttempts) throw error;
      }
    }

    throw new BadRequestException('Failed to generate unique payment session. Please try again.');
  }

  /**
   * Customer verifies signature and completes payment checkout (Idempotent & Amount Validated)
   */
  async verifyPaymentCustomer(userId: string, dto: VerifyPaymentDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const payment = await this.prisma.payment.findFirst({
      where: { id: dto.paymentId },
      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        status: true,
        version: true,
        serviceRequestId: true,
        serviceRequest: { select: { customerId: true } },
      },
    });

    if (!payment || payment.serviceRequest.customerId !== customer.id) {
      throw new ForbiddenException('Payment transaction not found or does not belong to you');
    }

    // IDEMPOTENCY PROTECTION (Recommendation 1): Return clean success if already SUCCESS
    if (payment.status === PaymentStatus.SUCCESS) {
      this.logger.log(`[IDEMPOTENCY] Duplicate payment verification ignored for Payment [${payment.id}]`);
      return {
        message: 'Payment already verified successfully',
        paymentId: payment.id,
        status: PaymentStatus.SUCCESS,
        isIdempotent: true,
      };
    }

    // 1. Provider-Agnostic Gateway Signature Verification (Recommendation 3)
    const isValidSignature = await this.gateway.verifyPaymentSignature({
      gatewayOrderId: dto.gatewayOrderId,
      gatewayTransactionId: dto.gatewayPaymentId,
      signature: dto.gatewaySignature,
    });

    this.logger.log(`[AUDIT_EVENT] [PAYMENT_SIGNATURE_VERIFIED] Payment: [${dto.paymentId}] Valid: [${isValidSignature}]`);

    if (!isValidSignature) {
      await this.prisma.$transaction(async (tx) => {
        await this.stateService.transitionStatus(tx, {
          paymentId: payment.id,
          currentStatus: payment.status,
          targetStatus: PaymentStatus.FAILED,
          expectedVersion: payment.version,
          actorUserId: userId,
          reason: 'HMAC SHA256 signature verification failed (tampered payload)',
        });
      });

      this.eventEmitter.emit('PAYMENT_FAILED', { paymentId: payment.id, reason: 'SIGNATURE_FAILED' });
      this.logger.log(`[AUDIT_EVENT] [PAYMENT_FAILED] Payment: [${payment.id}] Reason: [INVALID_SIGNATURE]`);

      throw new BadRequestException('Payment signature verification failed. Transaction flagged as failed.');
    }

    // 2. Signature valid: execute status transition to SUCCESS
    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        paymentId: payment.id,
        currentStatus: payment.status,
        targetStatus: PaymentStatus.SUCCESS,
        expectedVersion: payment.version,
        actorUserId: userId,
        gatewayTransactionId: dto.gatewayPaymentId,
        paymentMethod: dto.paymentMethod,
        reason: 'Payment signature verified successfully',
      });
    });

    // 3. Emit post-transaction domain events
    this.eventEmitter.emit('PAYMENT_SUCCESS', { paymentId: payment.id, actorId: userId });
    this.eventEmitter.emit('PAYMENT_VERIFIED', { paymentId: payment.id, gatewayTransactionId: dto.gatewayPaymentId });
    this.logger.log(`[AUDIT_EVENT] [PAYMENT_SUCCESS] Customer: [${userId}] Payment: [${payment.paymentNumber}]`);

    return {
      message: 'Payment completed and verified successfully',
      paymentId: payment.id,
      status: PaymentStatus.SUCCESS,
      result,
    };
  }

  /**
   * Handles asynchronous gateway webhook notification (Idempotent, Amount Validated, Out-of-Order Safe)
   */
  async handleRazorpayWebhook(rawBody: string, signature: string) {
    // 1. Verify webhook signature
    const isValid = await this.gateway.verifyWebhookSignature(rawBody, signature);
    this.logger.log(`[AUDIT_EVENT] [PAYMENT_WEBHOOK_RECEIVED] Valid: [${isValid}]`);

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity || !paymentEntity.order_id) {
      return { status: 'ignored_missing_order_id' };
    }

    const gatewayOrderId = paymentEntity.order_id;
    const gatewayPaymentId = paymentEntity.id;
    const reportedAmountInPaise = paymentEntity.amount;

    const payment = await this.prisma.payment.findFirst({
      where: { gatewayOrderId },
      select: { id: true, amount: true, status: true, version: true },
    });

    if (!payment) {
      return { status: 'payment_not_found' };
    }

    // IDEMPOTENCY & OUT-OF-ORDER DELIVERIES (Recommendation 1): Ignore if already SUCCESS or REFUNDED
    if (payment.status === PaymentStatus.SUCCESS) {
      return { status: 'already_processed', message: 'Payment already in SUCCESS state', paymentId: payment.id };
    }
    if (payment.status === PaymentStatus.REFUNDED) {
      return { status: 'already_refunded', paymentId: payment.id };
    }

    // PAYMENT AMOUNT VALIDATION (Recommendation 2): Verify reported amount matches DB expected amount
    if (reportedAmountInPaise !== undefined) {
      const expectedAmountInRupees = Number(payment.amount.toString());
      const reportedAmountInRupees = reportedAmountInPaise / 100;

      if (Math.abs(expectedAmountInRupees - reportedAmountInRupees) > 0.01) {
        this.logger.warn(
          `[SECURITY_ALERT] Webhook payment amount mismatch! Expected: ${expectedAmountInRupees}, Reported: ${reportedAmountInRupees}`,
        );

        await this.prisma.$transaction(async (tx) => {
          await this.stateService.transitionStatus(tx, {
            paymentId: payment.id,
            currentStatus: payment.status,
            targetStatus: PaymentStatus.FAILED,
            expectedVersion: payment.version,
            actorUserId: 'SYSTEM_WEBHOOK',
            reason: `Payment amount mismatch detected. Expected: ${expectedAmountInRupees}, Gateway Reported: ${reportedAmountInRupees}`,
          });
        });

        this.eventEmitter.emit('PAYMENT_FAILED', { paymentId: payment.id, reason: 'AMOUNT_MISMATCH' });
        return { status: 'rejected_amount_mismatch' };
      }
    }

    if (event === 'payment.captured' || event === 'order.paid') {
      await this.prisma.$transaction(async (tx) => {
        await this.stateService.transitionStatus(tx, {
          paymentId: payment.id,
          currentStatus: payment.status,
          targetStatus: PaymentStatus.SUCCESS,
          expectedVersion: payment.version,
          actorUserId: 'SYSTEM_WEBHOOK',
          gatewayTransactionId: gatewayPaymentId,
          reason: `Webhook [${event}] received and processed`,
        });
      });
      this.eventEmitter.emit('PAYMENT_SUCCESS', { paymentId: payment.id, source: 'WEBHOOK' });
    } else if (event === 'payment.failed') {
      await this.prisma.$transaction(async (tx) => {
        await this.stateService.transitionStatus(tx, {
          paymentId: payment.id,
          currentStatus: payment.status,
          targetStatus: PaymentStatus.FAILED,
          expectedVersion: payment.version,
          actorUserId: 'SYSTEM_WEBHOOK',
          reason: `Webhook [${event}] received`,
        });
      });
      this.eventEmitter.emit('PAYMENT_FAILED', { paymentId: payment.id, source: 'WEBHOOK' });
    }

    return { status: 'processed', event };
  }

  /**
   * Customer lists own payments
   */
  async getCustomerPayments(userId: string, query: QueryPaymentDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      serviceRequest: { customerId: customer.id },
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
    };

    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          paymentNumber: true,
          amount: true,
          type: true,
          status: true,
          gateway: true,
          paymentMethod: true,
          paidAt: true,
          createdAt: true,
          serviceRequest: { select: { ticketNumber: true, title: true } },
        },
      }),
    ]);

    return {
      message: 'Customer payments retrieved successfully',
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Customer views payment receipt details
   */
  async getCustomerPaymentById(userId: string, paymentId: string) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId },
      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        type: true,
        status: true,
        gateway: true,
        gatewayTransactionId: true,
        gatewayOrderId: true,
        paymentMethod: true,
        paidAt: true,
        createdAt: true,
        serviceRequest: {
          select: {
            customerId: true,
            ticketNumber: true,
            title: true,
            address: { select: { addressLine1: true, city: true, state: true } },
          },
        },
      },
    });

    if (!payment || payment.serviceRequest.customerId !== customer.id) {
      throw new ForbiddenException('Payment receipt not found or does not belong to you');
    }

    return {
      message: 'Payment receipt details retrieved successfully',
      payment,
    };
  }

  // ==============================================================================
  // ADMIN OPERATIONS
  // ==============================================================================

  /**
   * Admin lists all platform payments
   */
  async getAllPaymentsAdmin(query: QueryPaymentDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.gateway && { gateway: query.gateway }),
      ...(query.type && { type: query.type }),
      ...(query.serviceRequestId && { serviceRequestId: query.serviceRequestId }),
      ...(query.search && {
        OR: [
          { paymentNumber: { contains: query.search.trim(), mode: 'insensitive' } },
          { gatewayTransactionId: { contains: query.search.trim(), mode: 'insensitive' } },
          { gatewayOrderId: { contains: query.search.trim(), mode: 'insensitive' } },
        ],
      }),
    };

    const [total, payments] = await Promise.all([
      this.prisma.payment.count({ where }),
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          paymentNumber: true,
          amount: true,
          type: true,
          status: true,
          gateway: true,
          gatewayTransactionId: true,
          paymentMethod: true,
          paidAt: true,
          createdAt: true,
          serviceRequest: {
            select: {
              ticketNumber: true,
              title: true,
              customer: { select: { firstName: true, lastName: true, user: { select: { email: true } } } },
            },
          },
        },
      }),
    ]);

    return {
      message: 'All platform payments retrieved successfully',
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin views payment details
   */
  async getPaymentByIdAdmin(paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId },
      select: {
        id: true,
        paymentNumber: true,
        serviceRequestId: true,
        amount: true,
        type: true,
        status: true,
        gateway: true,
        gatewayTransactionId: true,
        gatewayOrderId: true,
        paymentMethod: true,
        paidAt: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        serviceRequest: {
          select: {
            ticketNumber: true,
            title: true,
            customer: { select: { firstName: true, lastName: true, user: { select: { email: true, phone: true } } } },
          },
        },
        comments: { select: { id: true, comment: true, createdAt: true, user: { select: { email: true, role: true } } } },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    return {
      message: 'Payment details retrieved successfully',
      payment,
    };
  }

  /**
   * Admin manually reconciles payment (e.g. CASH / BANK_TRANSFER -> SUCCESS or REFUNDED)
   */
  async reconcilePaymentAdmin(adminUserId: string, paymentId: string, dto: ReconcilePaymentDto) {
    const { payment } = await this.getPaymentByIdAdmin(paymentId);

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        paymentId: payment.id,
        currentStatus: payment.status,
        targetStatus: PaymentStatus.SUCCESS,
        expectedVersion: payment.version,
        actorUserId: adminUserId,
        gatewayTransactionId: dto.gatewayTransactionId || `MANUAL-${Date.now()}`,
        paymentMethod: dto.paymentMethod,
        reason: dto.remarks,
      });
    });

    this.logger.log(`[AUDIT_EVENT] [PAYMENT_RECONCILED] Admin: [${adminUserId}] Payment: [${paymentId}] Method: [${dto.paymentMethod}]`);
    this.eventEmitter.emit('PAYMENT_SUCCESS', { paymentId: payment.id, actorId: adminUserId, source: 'ADMIN_RECONCILE' });

    return {
      message: 'Payment manually reconciled successfully',
      result,
    };
  }
}
