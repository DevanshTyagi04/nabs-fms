import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorEstimateItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface VendorEstimate {
  id: string;
  ticketNumber: string;
  title: string;
  status: string;
  grandTotal: number;
  items: VendorEstimateItem[];
  createdAt: string;
}

export class EstimateRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockVendorEstimates: VendorEstimate[] = [
    {
      id: 'est-3001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Start Capacitor & Motor Replacement Quotation',
      status: 'DRAFT',
      grandTotal: 385.0,
      items: [
        { id: '1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, total: 85.0 },
        { id: '2', description: 'HVAC Technician Labor', quantity: 2.5, unitPrice: 120.0, total: 300.0 },
      ],
      createdAt: '2026-07-23T10:00:00Z',
    },
  ];

  static async getVendorEstimates(): Promise<VendorEstimate[]> {
    return [...this.mockVendorEstimates];
  }

  static async submitEstimate(id: string): Promise<VendorEstimate> {
    const index = this.mockVendorEstimates.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Estimate not found');

    const updated = {
      ...this.mockVendorEstimates[index],
      status: 'PENDING_APPROVAL',
    };
    this.mockVendorEstimates[index] = updated;
    return updated;
  }
}
