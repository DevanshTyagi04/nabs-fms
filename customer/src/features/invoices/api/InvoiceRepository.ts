import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  ticketNumber: string;
  vendorName: string;
  status: string;
  grandTotal: number;
  amountDue: number;
  dueDate: string;
}

export class InvoiceRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerInvoices: CustomerInvoice[] = [
    {
      id: 'inv-5001',
      invoiceNumber: 'INV-20260723-5001',
      ticketNumber: 'SR-20260723-1001',
      vendorName: 'Apex Field Services LLC',
      status: 'ISSUED',
      grandTotal: 412.45,
      amountDue: 412.45,
      dueDate: '2026-08-22',
    },
  ];

  static async getCustomerInvoices(): Promise<CustomerInvoice[]> {
    return [...this.mockCustomerInvoices];
  }
}
