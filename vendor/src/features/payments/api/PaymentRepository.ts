import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorPayment {
  id: string;
  paymentNumber: string;
  ticketNumber: string;
  customerName: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paidAt: string;
}

export class PaymentRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockVendorPayments: VendorPayment[] = [
    {
      id: 'pay-6001',
      paymentNumber: 'PAY-20260723-6001',
      ticketNumber: 'SR-20260723-1001',
      customerName: 'Jane Doe (Acme Corp)',
      amount: 412.45,
      status: 'SUCCESS',
      paymentMethod: 'Razorpay UPI (Google Pay)',
      paidAt: '2026-07-23T11:30:00Z',
    },
  ];

  static async getVendorPayments(): Promise<VendorPayment[]> {
    return [...this.mockVendorPayments];
  }
}
