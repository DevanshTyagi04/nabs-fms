import { PaymentRepository, VendorPayment } from './PaymentRepository';

export class PaymentService {
  static async getVendorPayments(): Promise<VendorPayment[]> {
    return PaymentRepository.getVendorPayments();
  }
}
