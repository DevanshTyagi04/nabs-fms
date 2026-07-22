import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InvoicePdfService } from '../../invoices/pdf/invoice-pdf.service';
import { PrismaService } from '../../prisma';
import { JOB_GENERATE_INVOICE_PDF } from '../constants/job-queues.constant';
import { InvoicePdfJobPayload } from '../interfaces/job-payload.interface';
import { QueueService } from '../queues/queue.service';

@Injectable()
export class InvoiceProcessor implements OnModuleInit {
  private readonly logger = new Logger(InvoiceProcessor.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly prisma: PrismaService,
    private readonly pdfService: InvoicePdfService,
  ) {}

  onModuleInit() {
    this.queueService.registerProcessor(
      JOB_GENERATE_INVOICE_PDF,
      (data: InvoicePdfJobPayload) => this.processInvoicePdf(data),
    );
  }

  async processInvoicePdf(payload: InvoicePdfJobPayload) {
    this.logger.log(`Processing background invoice PDF generation job for Invoice [${payload.invoiceId}]`);

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: payload.invoiceId },
      select: {
        id: true,
        invoiceNumber: true,
        issuedAt: true,
        status: true,
        totalAmount: true,
        paidAmount: true,
        dueAmount: true,
        pdfUrl: true,
        payment: {
          select: {
            paymentNumber: true,
            paymentMethod: true,
            gatewayTransactionId: true,
            serviceRequest: {
              select: {
                ticketNumber: true,
                title: true,
                customer: { select: { firstName: true, lastName: true, companyName: true, user: { select: { email: true } } } },
                assignedVendor: { select: { businessName: true } },
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      throw new Error(`Invoice record not found: [${payload.invoiceId}]`);
    }

    // Idempotency Check: Skip if PDF is already persisted
    if (invoice.pdfUrl) {
      this.logger.log(`[IDEMPOTENCY] Invoice PDF already exists for Invoice [${invoice.invoiceNumber}]. Skipping rendering.`);
      return { pdfUrl: invoice.pdfUrl, isIdempotent: true };
    }

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
      vendorBusinessName: invoice.payment.serviceRequest.assignedVendor?.businessName || undefined,
      serviceRequestTicket: invoice.payment.serviceRequest.ticketNumber,
      serviceRequestTitle: invoice.payment.serviceRequest.title,
      paymentNumber: invoice.payment.paymentNumber,
      paymentMethod: invoice.payment.paymentMethod || undefined,
      gatewayTransactionId: invoice.payment.gatewayTransactionId || undefined,
    });

    if (pdfUrl) {
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfUrl },
      });
      this.logger.log(`Invoice PDF persisted successfully via background worker: [${pdfUrl}]`);
    }

    return { pdfUrl };
  }
}
