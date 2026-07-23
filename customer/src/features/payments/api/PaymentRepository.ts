import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerPayment {
  id: string;
  paymentNumber: string;
  ticketNumber: string;
  vendorName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paidAt: string;
}

export class PaymentRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerPayments: CustomerPayment[] = [
    {
      id: 'pay-6001',
      paymentNumber: 'PAY-20260723-6001',
      ticketNumber: 'SR-20260723-1001',
      vendorName: 'Apex Field Services LLC',
      amount: 412.45,
      status: 'SUCCESS',
      paymentMethod: 'Razorpay UPI (Google Pay)',
      paidAt: '2026-07-23T11:30:00Z',
    },
  ];

  static async getCustomerPayments(): Promise<CustomerPayment[]> {
    return [...this.mockCustomerPayments];
  }
}
