import { PaymentRepository } from './PaymentRepository';
import { Payment, PaymentFilters, PaymentListResult } from '../types';

export class PaymentService {
  static async listPayments(filters: PaymentFilters): Promise<PaymentListResult> {
    return PaymentRepository.listPayments(filters);
  }

  static async getById(id: string): Promise<Payment | null> {
    return PaymentRepository.getById(id);
  }

  static async reconcilePayment(id: string, status: 'SUCCESS' | 'REFUNDED', notes?: string): Promise<Payment> {
    return PaymentRepository.reconcilePayment(id, status, notes);
  }
}
