import { InvoiceRepository } from './InvoiceRepository';
import { Invoice, InvoiceFilters, InvoiceListResult } from '../types';

export class InvoiceService {
  static async listInvoices(filters: InvoiceFilters): Promise<InvoiceListResult> {
    return InvoiceRepository.listInvoices(filters);
  }

  static async getById(id: string): Promise<Invoice | null> {
    return InvoiceRepository.getById(id);
  }

  static async cancelInvoice(id: string): Promise<Invoice> {
    return InvoiceRepository.cancelInvoice(id);
  }
}
