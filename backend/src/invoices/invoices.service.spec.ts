import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InvoiceStatus, PaymentStatus, Prisma } from '@prisma/client';
import { InvoicesService } from './invoices.service';
import { InvoiceNumberService } from './numbering/invoice-number.service';
import { InvoicePdfService } from './pdf/invoice-pdf.service';
import { InvoiceStateService } from './state/invoice-state.service';

describe('Invoices Module (Phase 9 Unit & Integration Tests)', () => {
  let invoicesService: InvoicesService;
  let stateService: InvoiceStateService;
  let numberService: InvoiceNumberService;
  let pdfService: InvoicePdfService;
  let eventEmitterMock: any;
  let prismaMock: any;
  let storageProviderMock: any;

  beforeEach(() => {
    eventEmitterMock = {
      emit: jest.fn(),
    };

    storageProviderMock = {
      uploadFile: jest.fn().mockResolvedValue({ url: 'http://localhost:3000/uploads/invoices/INV-1.html' }),
    };

    prismaMock = {
      customerProfile: { findFirst: jest.fn() },
      payment: { findUnique: jest.fn() },
      invoice: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      comment: { create: jest.fn().mockResolvedValue({ id: 'c-1' }) },
      $transaction: jest.fn((cb: any) => cb(prismaMock)),
    };

    stateService = new InvoiceStateService(prismaMock);
    numberService = new InvoiceNumberService(prismaMock);
    pdfService = new InvoicePdfService(storageProviderMock);

    invoicesService = new InvoicesService(
      prismaMock,
      stateService,
      numberService,
      pdfService,
      eventEmitterMock,
    );
  });

  describe('InvoiceNumberService & InvoiceStateService', () => {
    it('should generate INV-YYYYMMDD-XXXX format invoice number', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);
      const invoiceNumber = await numberService.generateInvoiceNumber();
      expect(invoiceNumber).toMatch(/^INV-\d{8}-[A-Z0-9]{4}$/);
    });

    it('should enforce financial immutability for ISSUED invoices', () => {
      expect(() => {
        stateService.validateFinancialImmutability({ status: InvoiceStatus.ISSUED }, true);
      }).toThrow(UnprocessableEntityException);
    });

    it('should allow financial updates for DRAFT invoices', () => {
      expect(() => {
        stateService.validateFinancialImmutability({ status: InvoiceStatus.DRAFT }, true);
      }).not.toThrow();
    });
  });

  describe('InvoicesService Creation & Idempotency', () => {
    it('should generate invoice for successful payment and emit domain events post-transaction', async () => {
      prismaMock.invoice.findUnique.mockResolvedValueOnce(null); // Idempotency check returns null
      prismaMock.payment.findUnique.mockResolvedValue({
        id: 'p-1',
        paymentNumber: 'PAY-100',
        amount: new Prisma.Decimal('2500.00'),
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
        paymentMethod: 'CARD',
        gatewayTransactionId: 'txn_123',
        serviceRequest: {
          id: 'sr-1',
          ticketNumber: 'SR-100',
          title: 'AC Maintenance',
          customer: { firstName: 'Alice', lastName: 'Smith', companyName: 'ACME Corp', user: { email: 'alice@acme.com' } },
          assignedVendor: { businessName: 'Cooling Experts' },
        },
      });

      prismaMock.invoice.create.mockResolvedValue({
        id: 'inv-1',
        invoiceNumber: 'INV-20260805-A1B2',
        paymentId: 'p-1',
        status: InvoiceStatus.ISSUED,
        totalAmount: new Prisma.Decimal('2500.00'),
        paidAmount: new Prisma.Decimal('2500.00'),
        dueAmount: new Prisma.Decimal('0.00'),
        issuedAt: new Date(),
        pdfUrl: null,
      });

      prismaMock.invoice.update.mockResolvedValue({ id: 'inv-1', pdfUrl: 'http://localhost:3000/uploads/invoices/INV-1.html' });

      const res = await invoicesService.generateInvoiceForPayment('u-admin', { paymentId: 'p-1' });

      expect(res.invoice.invoiceNumber).toMatch(/^INV-/);
      expect(eventEmitterMock.emit).toHaveBeenCalledWith('INVOICE_ISSUED', expect.objectContaining({ invoiceId: 'inv-1' }));
    });

    it('should return existing invoice idempotently if invoice for paymentId already exists', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue({
        id: 'inv-existing',
        invoiceNumber: 'INV-20260805-EXISTING',
        status: InvoiceStatus.ISSUED,
      });

      const res = await invoicesService.generateInvoiceForPayment('u-admin', { paymentId: 'p-1' });

      expect(res.isIdempotent).toBe(true);
      expect(res.invoice.invoiceNumber).toBe('INV-20260805-EXISTING');
    });

    it('should fail invoice generation if payment status is NOT SUCCESS', async () => {
      prismaMock.invoice.findUnique.mockResolvedValue(null);
      prismaMock.payment.findUnique.mockResolvedValue({
        id: 'p-pending',
        status: PaymentStatus.PENDING,
      });

      await expect(
        invoicesService.generateInvoiceForPayment('u-admin', { paymentId: 'p-pending' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('InvoicesService Customer Ownership & Authorization', () => {
    it('should forbid customer from accessing invoices belonging to another customer', async () => {
      prismaMock.customerProfile.findFirst.mockResolvedValue({ id: 'c-customer-1' });
      prismaMock.invoice.findFirst.mockResolvedValue({
        id: 'inv-other',
        payment: { serviceRequest: { customerId: 'c-customer-OTHER' } },
      });

      await expect(
        invoicesService.getCustomerInvoiceById('u-cust-1', 'inv-other'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
