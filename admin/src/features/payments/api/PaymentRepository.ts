import { SessionManager } from '@/auth/services/SessionManager';
import { Payment, PaymentFilters, PaymentListResult } from '../types';
import { FinancialEngine } from '@/financial/core/FinancialEngine';

export class PaymentRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: Payment[] = [
    {
      id: 'pay-6001',
      paymentNumber: 'PAY-20260723-6001',
      invoiceId: 'inv-5001',
      workOrderId: 'wo-4001',
      serviceRequestId: 'sr-1001',
      ticketNumber: 'SR-20260723-1001',
      vendorId: 'usr-vendor-01',
      vendorName: 'Apex Field Services LLC',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      amount: 412.45,
      status: 'SUCCESS',
      paymentMethod: 'Razorpay UPI (Google Pay)',
      razorpayOrderId: 'order_M1k8v9L0aXz',
      razorpayPaymentId: 'pay_M1k8w1M2bYy',
      paidAt: '2026-07-23T11:30:00Z',
      linkedEntities: [
        { id: 'inv-5001', type: 'SERVICE_REQUEST', label: 'Billed Invoice', referenceNumber: 'INV-20260723-5001', status: 'PAID' },
        { id: 'wo-4001', type: 'SERVICE_REQUEST', label: 'Completed Work Order', referenceNumber: 'WO-20260723-4001', status: 'VERIFIED' },
      ],
      totals: FinancialEngine.calculate([
        { id: 'item-1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, taxRate: 13, discountAmount: 0 },
        { id: 'item-2', description: 'HVAC Technician Field Labor (2.5 hrs)', quantity: 2.5, unitPrice: 120.0, taxRate: 13, discountAmount: 20 },
      ]).totals,
      createdAt: '2026-07-23T11:25:00Z',
      updatedAt: '2026-07-23T11:30:00Z',
    },
    {
      id: 'pay-6002',
      paymentNumber: 'PAY-20260722-6002',
      invoiceId: 'inv-5002',
      workOrderId: 'wo-4002',
      serviceRequestId: 'sr-1002',
      ticketNumber: 'SR-20260722-1002',
      vendorId: 'usr-vendor-02',
      vendorName: 'ProPlumb Solutions Inc.',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      amount: 452.0,
      status: 'SUCCESS',
      paymentMethod: 'Razorpay Credit Card (Visa ending 4242)',
      razorpayOrderId: 'order_L9j7u8K9zWw',
      razorpayPaymentId: 'pay_L9j7v0N1aXx',
      paidAt: '2026-07-22T18:30:00Z',
      linkedEntities: [
        { id: 'inv-5002', type: 'SERVICE_REQUEST', label: 'Billed Invoice', referenceNumber: 'INV-20260722-5002', status: 'PAID' },
        { id: 'wo-4002', type: 'SERVICE_REQUEST', label: 'Completed Work Order', referenceNumber: 'WO-20260722-4002', status: 'VERIFIED' },
      ],
      totals: FinancialEngine.calculate([
        { id: 'item-1', description: 'Commercial Hydro-Jetting Service', quantity: 1, unitPrice: 450.0, taxRate: 13, discountAmount: 50 },
      ]).totals,
      createdAt: '2026-07-22T18:15:00Z',
      updatedAt: '2026-07-22T18:30:00Z',
    },
  ];

  static async listPayments(filters: PaymentFilters): Promise<PaymentListResult> {
    try {
      const client = this.getClient();
      const res = await client.payments.getAllAdmin(filters);
      if (res.data?.items) {
        return {
          items: res.data.items.map((item) => ({
            id: item.id,
            paymentNumber: item.paymentNumber,
            invoiceId: item.invoiceId,
            workOrderId: item.workOrderId,
            serviceRequestId: item.serviceRequestId,
            ticketNumber: item.ticketNumber || 'SR-20260723-1001',
            vendorId: item.vendorId,
            vendorName: item.vendorName || 'Assigned Vendor',
            customerId: item.customerId,
            customerName: item.customerName || 'Customer Account',
            amount: item.amount,
            status: item.status as any,
            paymentMethod: item.paymentMethod || 'Razorpay Gateway',
            razorpayOrderId: item.razorpayOrderId,
            razorpayPaymentId: item.razorpayPaymentId,
            paidAt: item.paidAt,
            linkedEntities: [
              { id: item.invoiceId, type: 'SERVICE_REQUEST', label: 'Invoice', referenceNumber: item.invoiceId, status: item.status },
            ],
            totals: FinancialEngine.calculate([]).totals,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
          total: res.data.total,
        };
      }
    } catch {
      // Fallback
    }

    let items = [...this.mockDatabase];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.paymentNumber.toLowerCase().includes(q) ||
          p.ticketNumber.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.vendorName.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((p) => p.status === filters.status);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getById(id: string): Promise<Payment | null> {
    const found = this.mockDatabase.find((p) => p.id === id);
    return found || null;
  }

  static async reconcilePayment(id: string, status: 'SUCCESS' | 'REFUNDED', notes?: string): Promise<Payment> {
    const index = this.mockDatabase.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Payment not found');

    const updated: Payment = {
      ...this.mockDatabase[index],
      status: status as any,
      updatedAt: new Date().toISOString(),
    };
    this.mockDatabase[index] = updated;
    return updated;
  }
}
