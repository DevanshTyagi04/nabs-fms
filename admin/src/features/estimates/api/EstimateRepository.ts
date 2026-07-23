import { SessionManager } from '@/auth/services/SessionManager';
import { Estimate, EstimateFilters, EstimateListResult } from '../types';
import { FinancialEngine } from '@/financial/core/FinancialEngine';

export class EstimateRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: Estimate[] = [
    {
      id: 'est-3001',
      serviceRequestId: 'sr-1001',
      ticketNumber: 'SR-20260723-1001',
      title: 'HVAC Start Capacitor & Motor Replacement Quotation',
      vendorId: 'usr-vendor-01',
      vendorName: 'Apex Field Services LLC',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      status: 'PENDING_APPROVAL',
      version: 1,
      validUntil: '2026-08-01',
      items: [
        { id: 'item-1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, taxRate: 13, discountAmount: 0 },
        { id: 'item-2', description: 'HVAC Technician Field Labor (2.5 hrs)', quantity: 2.5, unitPrice: 120.0, taxRate: 13, discountAmount: 20 },
      ],
      totals: FinancialEngine.calculate([
        { id: 'item-1', description: '45uF 440V Dual Run Capacitor', quantity: 1, unitPrice: 85.0, taxRate: 13, discountAmount: 0 },
        { id: 'item-2', description: 'HVAC Technician Field Labor (2.5 hrs)', quantity: 2.5, unitPrice: 120.0, taxRate: 13, discountAmount: 20 },
      ]).totals,
      createdAt: '2026-07-23T10:00:00Z',
      updatedAt: '2026-07-23T10:15:00Z',
    },
    {
      id: 'est-3002',
      serviceRequestId: 'sr-1002',
      ticketNumber: 'SR-20260722-1002',
      title: 'Commercial Hydro-Jetting Drain Line Clearance',
      vendorId: 'usr-vendor-02',
      vendorName: 'ProPlumb Solutions Inc.',
      customerId: 'usr-customer-01',
      customerName: 'Jane Doe (Acme Corp)',
      status: 'APPROVED',
      version: 1,
      validUntil: '2026-07-30',
      items: [
        { id: 'item-1', description: 'Commercial Hydro-Jetting Service', quantity: 1, unitPrice: 450.0, taxRate: 13, discountAmount: 50 },
      ],
      totals: FinancialEngine.calculate([
        { id: 'item-1', description: 'Commercial Hydro-Jetting Service', quantity: 1, unitPrice: 450.0, taxRate: 13, discountAmount: 50 },
      ]).totals,
      createdAt: '2026-07-22T15:00:00Z',
      updatedAt: '2026-07-22T16:30:00Z',
    },
  ];

  static async listEstimates(filters: EstimateFilters): Promise<EstimateListResult> {
    try {
      const client = this.getClient();
      const res = await client.estimates.getAllAdmin(filters);
      if (res.data?.items) {
        return {
          items: res.data.items.map((item) => {
            const rawItems = item.items.map((i) => ({
              id: i.id,
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              taxRate: i.taxRate || 13,
              discountAmount: i.discountAmount || 0,
            }));
            const calc = FinancialEngine.calculate(rawItems);
            return {
              id: item.id,
              serviceRequestId: item.serviceRequestId,
              ticketNumber: item.ticketNumber || 'SR-20260723-1001',
              title: `Quotation Estimate #${item.id.slice(-4)}`,
              vendorId: item.vendorId,
              vendorName: item.vendorName || 'Assigned Vendor',
              customerId: item.customerId || 'usr-customer-01',
              customerName: item.customerName || 'Customer Account',
              status: item.status as any,
              version: item.version,
              validUntil: item.validUntil,
              items: calc.calculatedItems,
              totals: calc.totals,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          }),
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
        (e) =>
          e.ticketNumber.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.vendorName.toLowerCase().includes(q)
      );
    }

    if (filters.status && filters.status !== 'ALL') {
      items = items.filter((e) => e.status === filters.status);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getById(id: string): Promise<Estimate | null> {
    const found = this.mockDatabase.find((e) => e.id === id);
    return found || null;
  }

  static async approveEstimate(id: string): Promise<Estimate> {
    const index = this.mockDatabase.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Estimate not found');

    const updated: Estimate = {
      ...this.mockDatabase[index],
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    };
    this.mockDatabase[index] = updated;
    return updated;
  }

  static async rejectEstimate(id: string): Promise<Estimate> {
    const index = this.mockDatabase.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Estimate not found');

    const updated: Estimate = {
      ...this.mockDatabase[index],
      status: 'REJECTED',
      updatedAt: new Date().toISOString(),
    };
    this.mockDatabase[index] = updated;
    return updated;
  }
}
