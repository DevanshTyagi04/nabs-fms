import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InvoiceStatus, PaymentStatus, Prisma } from '@prisma/client';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../prisma';
import { GenerateInvoiceDto, QueryInvoiceDto } from './dto';
import { InvoiceNumberService } from './numbering/invoice-number.service';
import { InvoicePdfService } from './pdf/invoice-pdf.service';
import { InvoiceStateService } from './state/invoice-state.service';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: InvoiceStateService,
    private readonly numberService: InvoiceNumberService,
    private readonly pdfService: InvoicePdfService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Helper: Resolves CustomerProfile ID or throws ForbiddenException
   */
  private async getCustomerProfileOrThrow(userId: string) {
    const profile = await this.prisma.customerProfile.findFirst({
      where: { userId, deletedAt: null },
      select: { id: true },
    });

    if (!profile) {
      throw new ForbiddenException('Only customers can access customer invoice endpoints');
    }

    return profile;
  }

  /**
   * Event Listener: Automatically generates invoice on PAYMENT_SUCCESS
   */
  @OnEvent('PAYMENT_SUCCESS')
  async handlePaymentSuccessEvent(payload: { paymentId: string; actorId?: string }) {
    this.logger.log(`Received PAYMENT_SUCCESS event for Payment [${payload.paymentId}]. Triggering invoice generation...`);
    try {
      await this.generateInvoiceForPayment(payload.actorId || 'SYSTEM_EVENT', { paymentId: payload.paymentId });
    } catch (error: any) {
      this.logger.error(`Automatic invoice generation failed for Payment [${payload.paymentId}]: ${error.message}`);
    }
  }

  /**
   * Core Orchestrator: Generates an invoice for a successful payment (Idempotent implementation)
   */
  async generateInvoiceForPayment(actorUserId: string, dto: GenerateInvoiceDto) {
    // 1. IDEMPOTENCY CHECK (Recommendation 1): Verify if invoice already exists for paymentId
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { paymentId: dto.paymentId },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        totalAmount: true,
        paidAmount: true,
        dueAmount: true,
        issuedAt: true,
        pdfUrl: true,
      },
    });

    if (existingInvoice) {
      this.logger.log(`[IDEMPOTENCY] Invoice already exists for Payment [${dto.paymentId}]: Invoice #${existingInvoice.invoiceNumber}`);
      return {
        message: 'Invoice already exists for this payment',
        invoice: existingInvoice,
        isIdempotent: true,
      };
    }

    // 2. Resolve Payment & verify SUCCESS status
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
      select: {
        id: true,
        paymentNumber: true,
        amount: true,
        status: true,
        paidAt: true,
        paymentMethod: true,
        gatewayTransactionId: true,
        serviceRequest: {
          select: {
            id: true,
            ticketNumber: true,
            title: true,
            customer: { select: { firstName: true, lastName: true, companyName: true, user: { select: { email: true } } } },
            assignedVendor: { select: { businessName: true } },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment record not found');
    }

    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException(`Cannot generate invoice for payment in status ${payment.status}. Payment must be SUCCESS.`);
    }

    // 3. Generate collision-safe invoice number (INV-YYYYMMDD-XXXX)
    const invoiceNumber = await this.numberService.generateInvoiceNumber();

    // 4. Atomic Prisma Transaction: Create Invoice Record
    const totalAmount = payment.amount;
    const paidAmount = payment.amount;
    const dueAmount = new Prisma.Decimal('0.00');

    const invoice = await this.prisma.$transaction(async (tx) => {
      const newInvoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          paymentId: payment.id,
          status: InvoiceStatus.ISSUED,
          totalAmount,
          paidAmount,
          dueAmount,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          issuedAt: new Date(),
        },
        select: {
          id: true,
          invoiceNumber: true,
          paymentId: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          issuedAt: true,
          pdfUrl: true,
        },
      });

      await tx.comment.create({
        data: {
          invoiceId: newInvoice.id,
          userId: actorUserId,
          comment: `Invoice ${newInvoice.invoiceNumber} generated for Payment ${payment.paymentNumber}`,
        },
      });

      return newInvoice;
    });

    // 5. PDF Version Consistency (Recommendation 2 & 4): Generate & Upload PDF strictly POST-COMMIT
    const customerName = `${payment.serviceRequest.customer.firstName} ${payment.serviceRequest.customer.lastName}`.trim();
    const pdfUrl = await this.pdfService.generateAndSavePdf({
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      status: invoice.status,
      totalAmount: invoice.totalAmount.toString(),
      paidAmount: invoice.paidAmount.toString(),
      dueAmount: invoice.dueAmount.toString(),
      customerName,
      customerEmail: payment.serviceRequest.customer.user?.email,
      customerCompany: payment.serviceRequest.customer.companyName || undefined,
      vendorBusinessName: payment.serviceRequest.assignedVendor?.businessName || undefined,
      serviceRequestTicket: payment.serviceRequest.ticketNumber,
      serviceRequestTitle: payment.serviceRequest.title,
      paymentNumber: payment.paymentNumber,
      paymentMethod: payment.paymentMethod || undefined,
      gatewayTransactionId: payment.gatewayTransactionId || undefined,
    });

    if (pdfUrl) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl },
      });
      invoice.pdfUrl = pdfUrl;
    }

    // 6. Post-Transaction Domain Events & Audit Logs
    this.eventEmitter.emit('INVOICE_CREATED', { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber });
    this.eventEmitter.emit('INVOICE_GENERATED', { invoiceId: invoice.id, paymentId: payment.id });
    this.eventEmitter.emit('INVOICE_ISSUED', { invoiceId: invoice.id, actorId: actorUserId });
    this.logger.log(`[AUDIT_EVENT] [INVOICE_ISSUED] User: [${actorUserId}] Invoice: [${invoice.invoiceNumber}]`);

    return {
      message: 'Invoice generated and issued successfully',
      invoice,
    };
  }

  // ==============================================================================
  // CUSTOMER OPERATIONS
  // ==============================================================================

  /**
   * Customer lists own invoices
   */
  async getCustomerInvoices(userId: string, query: QueryInvoiceDto) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      payment: { serviceRequest: { customerId: customer.id } },
      ...(query.status && { status: query.status }),
      ...(query.search && {
        OR: [
          { invoiceNumber: { contains: query.search.trim(), mode: 'insensitive' } },
          { payment: { serviceRequest: { ticketNumber: { contains: query.search.trim(), mode: 'insensitive' } } } },
        ],
      }),
    };

    const [total, invoices] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          issuedAt: true,
          pdfUrl: true,
          payment: { select: { paymentNumber: true, serviceRequest: { select: { ticketNumber: true, title: true } } } },
        },
      }),
    ]);

    return {
      message: 'Customer invoices retrieved successfully',
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Customer views invoice details enforcing ownership
   */
  async getCustomerInvoiceById(userId: string, invoiceId: string) {
    const customer = await this.getCustomerProfileOrThrow(userId);

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        totalAmount: true,
        paidAmount: true,
        dueAmount: true,
        dueDate: true,
        issuedAt: true,
        pdfUrl: true,
        createdAt: true,
        payment: {
          select: {
            paymentNumber: true,
            paidAt: true,
            paymentMethod: true,
            gatewayTransactionId: true,
            serviceRequest: {
              select: {
                customerId: true,
                ticketNumber: true,
                title: true,
                address: { select: { addressLine1: true, city: true, state: true } },
              },
            },
          },
        },
      },
    });

    if (!invoice || invoice.payment.serviceRequest.customerId !== customer.id) {
      throw new ForbiddenException('Invoice record not found or does not belong to you');
    }

    return {
      message: 'Invoice details retrieved successfully',
      invoice,
    };
  }

  /**
   * Customer downloads invoice document PDF
   */
  async downloadInvoicePdfCustomer(userId: string, invoiceId: string) {
    const { invoice } = await this.getCustomerInvoiceById(userId, invoiceId);
    this.logger.log(`[AUDIT_EVENT] [INVOICE_DOWNLOADED] Customer: [${userId}] Invoice: [${invoice.invoiceNumber}]`);
    return {
      message: 'Invoice download link retrieved successfully',
      pdfUrl: invoice.pdfUrl,
      invoiceNumber: invoice.invoiceNumber,
    };
  }

  // ==============================================================================
  // ADMIN OPERATIONS
  // ==============================================================================

  /**
   * Admin lists all platform invoices
   */
  async getAllInvoicesAdmin(query: QueryInvoiceDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.paymentId && { paymentId: query.paymentId }),
      ...(query.search && {
        OR: [
          { invoiceNumber: { contains: query.search.trim(), mode: 'insensitive' } },
          { payment: { paymentNumber: { contains: query.search.trim(), mode: 'insensitive' } } },
        ],
      }),
    };

    const [total, invoices] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortOrder || 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          issuedAt: true,
          pdfUrl: true,
          createdAt: true,
          payment: {
            select: {
              paymentNumber: true,
              serviceRequest: {
                select: {
                  ticketNumber: true,
                  title: true,
                  customer: { select: { firstName: true, lastName: true } },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      message: 'All platform invoices retrieved successfully',
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin views invoice details
   */
  async getInvoiceByIdAdmin(invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        paymentId: true,
        status: true,
        totalAmount: true,
        paidAmount: true,
        dueAmount: true,
        dueDate: true,
        issuedAt: true,
        pdfUrl: true,
        createdAt: true,
        updatedAt: true,
        payment: {
          select: {
            paymentNumber: true,
            paidAt: true,
            paymentMethod: true,
            gatewayTransactionId: true,
            serviceRequest: {
              select: {
                ticketNumber: true,
                title: true,
                customer: { select: { firstName: true, lastName: true, companyName: true, user: { select: { email: true } } } },
              },
            },
          },
        },
        comments: { select: { id: true, comment: true, createdAt: true, user: { select: { email: true, role: true } } } },
      },
    });

    if (!invoice) throw new NotFoundException('Invoice record not found');

    return {
      message: 'Invoice details retrieved successfully',
      invoice,
    };
  }

  /**
   * Admin cancels an invoice (Recommendation 3: Number permanently reserved)
   */
  async cancelInvoiceAdmin(adminUserId: string, invoiceId: string, reason?: string) {
    const { invoice } = await this.getInvoiceByIdAdmin(invoiceId);

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Invoice is already cancelled');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      return this.stateService.transitionStatus(tx, {
        invoiceId: invoice.id,
        currentStatus: invoice.status,
        targetStatus: InvoiceStatus.CANCELLED,
        actorUserId: adminUserId,
        reason: reason || 'Invoice cancelled by Admin',
      });
    });

    this.eventEmitter.emit('INVOICE_CANCELLED', { invoiceId, invoiceNumber: invoice.invoiceNumber, actorId: adminUserId });
    this.logger.log(`[AUDIT_EVENT] [INVOICE_CANCELLED] Admin: [${adminUserId}] Invoice: [${invoice.invoiceNumber}]`);

    return {
      message: 'Invoice cancelled successfully',
      result,
    };
  }

  /**
   * Admin regenerates PDF document (Recommendation 2 & 4 safe)
   */
  async regeneratePdfAdmin(adminUserId: string, invoiceId: string) {
    const { invoice } = await this.getInvoiceByIdAdmin(invoiceId);

    const customerName = `${invoice.payment.serviceRequest.customer.firstName} ${invoice.payment.serviceRequest.customer.lastName}`.trim();
    const pdfUrl = await this.pdfService.generateAndSavePdf({
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      status: invoice.status,
      totalAmount: invoice.totalAmount.toString(),
      paidAmount: invoice.paidAmount.toString(),
      dueAmount: invoice.dueAmount.toString(),
      customerName,
      customerEmail: invoice.payment.serviceRequest.customer.user?.email,
      customerCompany: invoice.payment.serviceRequest.customer.companyName || undefined,
      serviceRequestTicket: invoice.payment.serviceRequest.ticketNumber,
      serviceRequestTitle: invoice.payment.serviceRequest.title,
      paymentNumber: invoice.payment.paymentNumber,
      paymentMethod: invoice.payment.paymentMethod || undefined,
      gatewayTransactionId: invoice.payment.gatewayTransactionId || undefined,
    });

    if (!pdfUrl) {
      throw new BadRequestException('Failed to regenerate PDF document file. Please check storage provider logs.');
    }

    await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: { pdfUrl },
    });

    this.logger.log(`[AUDIT_EVENT] [INVOICE_PDF_REGENERATED] Admin: [${adminUserId}] Invoice: [${invoice.invoiceNumber}]`);

    return {
      message: 'Invoice PDF document regenerated successfully',
      pdfUrl,
    };
  }
}
