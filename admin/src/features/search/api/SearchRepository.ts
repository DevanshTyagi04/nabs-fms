import { SessionManager } from '@/auth/services/SessionManager';
import { SearchResultItemDomain, SearchFilters, SearchListResult } from '../types';

export class SearchRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: SearchResultItemDomain[] = [
    {
      id: 'sr-1001',
      title: 'Commercial HVAC Cooling Failure Inspection',
      subtitle: 'Customer: Jane Doe (Acme Corp) • Priority: HIGH',
      entityType: 'SERVICE_REQUEST',
      status: 'ASSIGNED',
      referenceNumber: 'SR-20260723-1001',
      updatedAt: '2026-07-23T10:00:00Z',
    },
    {
      id: 'surv-2001',
      title: 'Roof HVAC Compressor Inspection Survey',
      subtitle: 'Vendor: Apex Field Services LLC • Technical Rating: 4.8/5',
      entityType: 'SURVEY',
      status: 'APPROVED',
      referenceNumber: 'SURV-2001',
      updatedAt: '2026-07-23T10:30:00Z',
    },
    {
      id: 'est-3001',
      title: 'Commercial Dual Capacitor Replacement Estimate',
      subtitle: 'Vendor: Apex Field Services LLC • Total: $412.45',
      entityType: 'ESTIMATE',
      status: 'APPROVED',
      referenceNumber: 'EST-3001',
      updatedAt: '2026-07-23T10:45:00Z',
    },
    {
      id: 'wo-4001',
      title: 'Field Service Dispatch & Capacitor Replacement',
      subtitle: 'Tech: Alex Vance • Scheduled: Today',
      entityType: 'WORK_ORDER',
      status: 'VERIFIED',
      referenceNumber: 'WO-20260723-4001',
      updatedAt: '2026-07-23T11:00:00Z',
    },
    {
      id: 'inv-5001',
      title: 'Customer Billing Statement for HVAC Repair',
      subtitle: 'Customer: Jane Doe • Due: Aug 22, 2026',
      entityType: 'INVOICE',
      status: 'ISSUED',
      referenceNumber: 'INV-20260723-5001',
      updatedAt: '2026-07-23T11:15:00Z',
    },
    {
      id: 'pay-6001',
      title: 'Razorpay UPI Online Payment Settlement',
      subtitle: 'Method: Razorpay UPI • Amount: $412.45',
      entityType: 'PAYMENT',
      status: 'SUCCESS',
      referenceNumber: 'PAY-20260723-6001',
      updatedAt: '2026-07-23T11:30:00Z',
    },
  ];

  static async globalSearch(filters: SearchFilters): Promise<SearchListResult> {
    let items = [...this.mockDatabase];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.subtitle.toLowerCase().includes(q) ||
          i.referenceNumber.toLowerCase().includes(q)
      );
    }

    if (filters.scope && filters.scope !== 'ALL') {
      const scopeEntityTypeMap: Record<string, string> = {
        SERVICE_REQUESTS: 'SERVICE_REQUEST',
        SURVEYS: 'SURVEY',
        ESTIMATES: 'ESTIMATE',
        WORK_ORDERS: 'WORK_ORDER',
        INVOICES: 'INVOICE',
        PAYMENTS: 'PAYMENT',
        NOTIFICATIONS: 'NOTIFICATION',
      };
      const mappedType = scopeEntityTypeMap[filters.scope];
      if (mappedType) {
        items = items.filter((i) => i.entityType === mappedType);
      }
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }
}
