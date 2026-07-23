import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerSearchResult {
  id: string;
  title: string;
  subtitle: string;
  entityType: string;
  referenceNumber: string;
  targetRoute: string;
}

export class SearchRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerResults: CustomerSearchResult[] = [
    {
      id: 'inv-5001',
      title: 'Customer Billing Statement for HVAC Repair',
      subtitle: 'Total Due: $412.45',
      entityType: 'INVOICE',
      referenceNumber: 'INV-20260723-5001',
      targetRoute: '/invoices',
    },
  ];

  static async searchCustomer(query: string): Promise<CustomerSearchResult[]> {
    if (!query) return [...this.mockCustomerResults];
    const q = query.toLowerCase();
    return this.mockCustomerResults.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.referenceNumber.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
  }
}
