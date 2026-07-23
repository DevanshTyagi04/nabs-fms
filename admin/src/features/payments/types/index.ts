import { LinkedEntity } from '@/execution/core/types';
import { TotalsBreakdown } from '@/financial/core/types';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  workOrderId?: string;
  serviceRequestId?: string;
  ticketNumber: string;
  vendorId?: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  linkedEntities: LinkedEntity[];
  totals: TotalsBreakdown;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentFilters {
  search?: string;
  status?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentListResult {
  items: Payment[];
  total: number;
}
