import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorInvoice {
  id: string;
  invoiceNumber: string;
  ticketNumber: string;
  customerName: string;
  status: string;
  grandTotal: number;
  amountDue: number;
  dueDate: string;
}

export class InvoiceRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockVendorInvoices: VendorInvoice[] = [
    {
      id: 'inv-5001',
      invoiceNumber: 'INV-20260723-5001',
      ticketNumber: 'SR-20260723-1001',
      customerName: 'Jane Doe (Acme Corp)',
      status: 'ISSUED',
      grandTotal: 412.45,
      amountDue: 412.45,
      dueDate: '2026-08-22',
    },
  ];

  static async getVendorInvoices(): Promise<VendorInvoice[]> {
    return [...this.mockVendorInvoices];
  }
}
