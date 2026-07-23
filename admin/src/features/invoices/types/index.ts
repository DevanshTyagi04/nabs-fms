import { FinancialLineItem, TotalsBreakdown } from '@/financial/core/types';
import { LinkedEntity } from '@/execution/core/types';

export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'SENT'
  | 'VIEWED'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  workOrderId: string;
  serviceRequestId?: string;
  estimateId?: string;
  ticketNumber: string;
  vendorId?: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountDue: number;
  dueDate: string;
  pdfUrl?: string;
  items: FinancialLineItem[];
  totals: TotalsBreakdown;
  linkedEntities: LinkedEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFilters {
  search?: string;
  status?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InvoiceListResult {
  items: Invoice[];
  total: number;
}
