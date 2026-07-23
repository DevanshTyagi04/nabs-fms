import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorSearchResult {
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

  private static mockVendorResults: VendorSearchResult[] = [
    {
      id: 'wo-4001',
      title: 'Field Service Dispatch & Maintenance',
      subtitle: 'Customer: Jane Doe (Acme Corp)',
      entityType: 'WORK_ORDER',
      referenceNumber: 'WO-20260723-4001',
      targetRoute: '/work-orders',
    },
  ];

  static async searchVendor(query: string): Promise<VendorSearchResult[]> {
    if (!query) return [...this.mockVendorResults];
    const q = query.toLowerCase();
    return this.mockVendorResults.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.referenceNumber.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
    );
  }
}
