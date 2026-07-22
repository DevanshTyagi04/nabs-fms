import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationType, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma';
import { NotificationDispatcherService, RecipientInfo } from '../dispatcher/notification-dispatcher.service';

@Injectable()
export class NotificationEventListener {
  private readonly logger = new Logger(NotificationEventListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dispatcher: NotificationDispatcherService,
  ) {}

  @OnEvent('SERVICE_REQUEST_CREATED')
  async handleServiceRequestCreated(payload: { serviceRequestId: string; actorId?: string }) {
    try {
      const request = await this.prisma.serviceRequest.findUnique({
        where: { id: payload.serviceRequestId },
        select: { ticketNumber: true, title: true, customer: { select: { userId: true, user: { select: { email: true } } } } },
      });

      if (request && request.customer) {
        await this.dispatcher.dispatchToRecipient(
          { recipientId: request.customer.userId, recipientEmail: request.customer.user.email },
          'Service Request Created',
          `Your service request ${request.ticketNumber} ("${request.title}") has been registered.`,
          NotificationType.REQUEST_STATUS,
        );
      }
    } catch (err: any) {
      this.logger.error(`Error processing SERVICE_REQUEST_CREATED notification event: ${err.message}`);
    }
  }

  @OnEvent('WORK_ORDER_CREATED')
  async handleWorkOrderCreated(payload: { workOrderId: string; actorId?: string }) {
    try {
      const wo = await this.prisma.workOrder.findUnique({
        where: { id: payload.workOrderId },
        select: {
          workOrderNumber: true,
          assignedVendor: { select: { userId: true, user: { select: { email: true } } } },
        },
      });

      if (wo && wo.assignedVendor) {
        await this.dispatcher.dispatchToRecipient(
          { recipientId: wo.assignedVendor.userId, recipientEmail: wo.assignedVendor.user.email },
          'New Work Order Assigned',
          `You have been assigned Work Order ${wo.workOrderNumber}.`,
          NotificationType.WORK_ORDER_UPDATE,
        );
      }
    } catch (err: any) {
      this.logger.error(`Error processing WORK_ORDER_CREATED notification event: ${err.message}`);
    }
  }

  @OnEvent('WORK_STARTED')
  async handleWorkStarted(payload: { workOrderId: string; actorId?: string }) {
    try {
      const wo = await this.prisma.workOrder.findUnique({
        where: { id: payload.workOrderId },
        select: {
          workOrderNumber: true,
          serviceRequest: { select: { customer: { select: { userId: true, user: { select: { email: true } } } } } },
        },
      });

      if (wo && wo.serviceRequest?.customer) {
        await this.dispatcher.dispatchToRecipient(
          { recipientId: wo.serviceRequest.customer.userId, recipientEmail: wo.serviceRequest.customer.user.email },
          'Work Order Started',
          `Technician started work execution on Work Order ${wo.workOrderNumber}.`,
          NotificationType.WORK_ORDER_UPDATE,
        );
      }
    } catch (err: any) {
      this.logger.error(`Error processing WORK_STARTED notification event: ${err.message}`);
    }
  }

  @OnEvent('WORK_COMPLETED')
  async handleWorkCompleted(payload: { workOrderId: string; actorId?: string }) {
    try {
      const wo = await this.prisma.workOrder.findUnique({
        where: { id: payload.workOrderId },
        select: {
          workOrderNumber: true,
          serviceRequest: { select: { customer: { select: { userId: true, user: { select: { email: true } } } } } },
        },
      });

      const admins = await this.prisma.user.findMany({
        where: { role: UserRole.ADMIN, deletedAt: null },
        select: { id: true, email: true },
      });

      const recipients: RecipientInfo[] = [];

      if (wo && wo.serviceRequest?.customer) {
        recipients.push({ recipientId: wo.serviceRequest.customer.userId, recipientEmail: wo.serviceRequest.customer.user.email });
      }

      admins.forEach((admin) => {
        recipients.push({ recipientId: admin.id, recipientEmail: admin.email });
      });

      if (recipients.length > 0) {
        await this.dispatcher.dispatchToMultipleRecipients(
          recipients,
          'Work Order Completed',
          `Technician completed work on Work Order ${wo?.workOrderNumber || ''}.`,
          NotificationType.WORK_ORDER_UPDATE,
        );
      }
    } catch (err: any) {
      this.logger.error(`Error processing WORK_COMPLETED notification event: ${err.message}`);
    }
  }

  @OnEvent('WORK_VERIFIED')
  async handleWorkVerified(payload: { workOrderId: string; actorId?: string }) {
    try {
      const wo = await this.prisma.workOrder.findUnique({
        where: { id: payload.workOrderId },
        select: {
          workOrderNumber: true,
          assignedVendor: { select: { userId: true, user: { select: { email: true } } } },
          serviceRequest: { select: { customer: { select: { userId: true, user: { select: { email: true } } } } } },
        },
      });

      const recipients: RecipientInfo[] = [];
      if (wo?.serviceRequest?.customer) {
        recipients.push({ recipientId: wo.serviceRequest.customer.userId, recipientEmail: wo.serviceRequest.customer.user.email });
      }
      if (wo?.assignedVendor) {
        recipients.push({ recipientId: wo.assignedVendor.userId, recipientEmail: wo.assignedVendor.user.email });
      }

      if (recipients.length > 0) {
        await this.dispatcher.dispatchToMultipleRecipients(
          recipients,
          'Work Order Verified',
          `Admin QA verified Work Order ${wo?.workOrderNumber || ''}.`,
          NotificationType.WORK_ORDER_UPDATE,
        );
      }
    } catch (err: any) {
      this.logger.error(`Error processing WORK_VERIFIED notification event: ${err.message}`);
    }
  }

  @OnEvent('PAYMENT_SUCCESS')
  async handlePaymentSuccess(payload: { paymentId: string; actorId?: string }) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: payload.paymentId },
        select: {
          paymentNumber: true,
          amount: true,
          serviceRequest: { select: { customer: { select: { userId: true, user: { select: { email: true } } } } } },
        },
      });

      if (payment && payment.serviceRequest?.customer) {
        await this.dispatcher.dispatchToRecipient(
          { recipientId: payment.serviceRequest.customer.userId, recipientEmail: payment.serviceRequest.customer.user.email },
          'Payment Confirmed',
          `Your payment of ₹${payment.amount} (${payment.paymentNumber}) has been confirmed successfully.`,
          NotificationType.PAYMENT_CONFIRMATION,
        );
      }
    } catch (err: any) {
      this.logger.error(`Error processing PAYMENT_SUCCESS notification event: ${err.message}`);
    }
  }

  @OnEvent('INVOICE_ISSUED')
  async handleInvoiceIssued(payload: { invoiceId: string; actorId?: string }) {
    try {
      const invoice = await this.prisma.invoice.findUnique({
        where: { id: payload.invoiceId },
        select: {
          invoiceNumber: true,
          totalAmount: true,
          payment: { select: { serviceRequest: { select: { customer: { select: { userId: true, user: { select: { email: true } } } } } } } },
        },
      });

      if (invoice && invoice.payment?.serviceRequest?.customer) {
        await this.dispatcher.dispatchToRecipient(
          { recipientId: invoice.payment.serviceRequest.customer.userId, recipientEmail: invoice.payment.serviceRequest.customer.user.email },
          'Invoice Issued',
          `Invoice ${invoice.invoiceNumber} for ₹${invoice.totalAmount} has been issued.`,
          NotificationType.PAYMENT_CONFIRMATION,
        );
      }
    } catch (err: any) {
      this.logger.error(`Error processing INVOICE_ISSUED notification event: ${err.message}`);
    }
  }
}
