import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerEstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CustomerEstimate {
  id: string;
  ticketNumber: string;
  title: string;
  vendorName: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  items: CustomerEstimateItem[];
  createdAt: string;
}

export class EstimateRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerEstimates: CustomerEstimate[] = [
    {
      id: 'est-3001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Start Capacitor & Motor Replacement Quotation',
      vendorName: 'Apex Field Services LLC',
      status: 'PENDING_APPROVAL',
      subtotal: 385.0,
      discount: 20.0,
      tax: 47.45,
      grandTotal: 412.45,
      items: [
        { id: '1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, total: 85.0 },
        { id: '2', description: 'HVAC Technician Labor', quantity: 2.5, unitPrice: 120.0, total: 300.0 },
      ],
      createdAt: '2026-07-23T10:00:00Z',
    },
  ];

  static async getCustomerEstimates(): Promise<CustomerEstimate[]> {
    return [...this.mockCustomerEstimates];
  }

  static async approveEstimate(id: string): Promise<CustomerEstimate> {
    const index = this.mockCustomerEstimates.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Estimate not found');

    const updated = {
      ...this.mockCustomerEstimates[index],
      status: 'APPROVED',
    };
    this.mockCustomerEstimates[index] = updated;
    return updated;
  }

  static async rejectEstimate(id: string): Promise<CustomerEstimate> {
    const index = this.mockCustomerEstimates.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Estimate not found');

    const updated = {
      ...this.mockCustomerEstimates[index],
      status: 'REJECTED',
    };
    this.mockCustomerEstimates[index] = updated;
    return updated;
  }
}
