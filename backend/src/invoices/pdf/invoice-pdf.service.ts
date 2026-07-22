import { Inject, Injectable, Logger } from '@nestjs/common';
import { IStorageProvider, STORAGE_PROVIDER_TOKEN } from '../../storage';

export interface InvoiceRenderContext {
  invoiceNumber: string;
  issuedAt: Date;
  status: string;
  totalAmount: string;
  paidAmount: string;
  dueAmount: string;
  customerName: string;
  customerEmail?: string;
  customerCompany?: string;
  vendorBusinessName?: string;
  serviceRequestTicket: string;
  serviceRequestTitle: string;
  paymentNumber: string;
  paymentMethod?: string;
  gatewayTransactionId?: string;
}

@Injectable()
export class InvoicePdfService {
  private readonly logger = new Logger(InvoicePdfService.name);

  constructor(
    @Inject(STORAGE_PROVIDER_TOKEN)
    private readonly storageProvider: IStorageProvider,
  ) {}

  /**
   * Renders HTML invoice document buffer
   */
  renderInvoiceHtml(ctx: InvoiceRenderContext): Buffer {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${ctx.invoiceNumber}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; margin: 40px; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: bold; color: #1e3a8a; }
    .status { display: inline-block; padding: 6px 12px; font-weight: bold; border-radius: 4px; background-color: #dcfce7; color: #166534; }
    .grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .col { flex: 1; }
    .col-title { font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: bold; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
    th { background-color: #f9fafb; font-weight: bold; }
    .totals { margin-top: 20px; text-align: right; }
    .total-row { font-size: 18px; font-weight: bold; color: #1e3a8a; }
    .footer { margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div class="title">INVOICE</div>
        <div>Invoice #: <strong>${ctx.invoiceNumber}</strong></div>
        <div>Date: ${new Date(ctx.issuedAt).toLocaleDateString()}</div>
      </div>
      <div>
        <span class="status">${ctx.status}</span>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="col">
      <div class="col-title">Billed To</div>
      <div><strong>${ctx.customerName}</strong></div>
      ${ctx.customerCompany ? `<div>${ctx.customerCompany}</div>` : ''}
      ${ctx.customerEmail ? `<div>${ctx.customerEmail}</div>` : ''}
    </div>
    <div class="col">
      <div class="col-title">Service Provider</div>
      <div><strong>${ctx.vendorBusinessName || 'NABS Field Service Network'}</strong></div>
    </div>
    <div class="col">
      <div class="col-title">Service Reference</div>
      <div>Ticket #: <strong>${ctx.serviceRequestTicket}</strong></div>
      <div>Title: ${ctx.serviceRequestTitle}</div>
      <div>Payment #: ${ctx.paymentNumber}</div>
      ${ctx.gatewayTransactionId ? `<div>Txn Ref: ${ctx.gatewayTransactionId}</div>` : ''}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Payment Mode</th>
        <th style="text-align: right;">Amount (INR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>FSM Completed Service Execution (${ctx.serviceRequestTicket})</td>
        <td>${ctx.paymentMethod || 'ELECTRONIC'}</td>
        <td style="text-align: right;">₹${ctx.totalAmount}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div>Total Amount: ₹${ctx.totalAmount}</div>
    <div>Paid Amount: ₹${ctx.paidAmount}</div>
    <div class="total-row">Balance Due: ₹${ctx.dueAmount}</div>
  </div>

  <div class="footer">
    Thank you for your business! This is a system-generated financial document.
  </div>
</body>
</html>
    `;
    return Buffer.from(html, 'utf-8');
  }

  /**
   * Generates and persists invoice PDF document to storage provider (Recommendation 2 & 4 safe)
   */
  async generateAndSavePdf(ctx: InvoiceRenderContext): Promise<string | null> {
    try {
      const buffer = this.renderInvoiceHtml(ctx);
      const fileName = `${ctx.invoiceNumber}.html`;

      const uploaded = await this.storageProvider.uploadFile(
        buffer,
        fileName,
        'text/html',
        'invoices',
      );

      this.logger.log(`Invoice document persisted successfully: [${uploaded.url}]`);
      return uploaded.url;
    } catch (error: any) {
      this.logger.error(`Failed to persist invoice document file to storage: ${error.message}`);
      return null;
    }
  }
}
