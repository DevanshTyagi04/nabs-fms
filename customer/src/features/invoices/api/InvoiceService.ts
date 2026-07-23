import { InvoiceRepository, CustomerInvoice } from './InvoiceRepository';

export class InvoiceService {
  static async getCustomerInvoices(): Promise<CustomerInvoice[]> {
    return InvoiceRepository.getCustomerInvoices();
  }
}
