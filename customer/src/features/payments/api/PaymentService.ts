import { PaymentRepository, CustomerPayment } from './PaymentRepository';

export class PaymentService {
  static async getCustomerPayments(): Promise<CustomerPayment[]> {
    return PaymentRepository.getCustomerPayments();
  }
}
