import { InvoiceRepository, VendorInvoice } from './InvoiceRepository';

export class InvoiceService {
  static async getVendorInvoices(): Promise<VendorInvoice[]> {
    return InvoiceRepository.getVendorInvoices();
  }
}
