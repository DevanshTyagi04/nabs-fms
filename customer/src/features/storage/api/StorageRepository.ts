import { SessionManager } from '@/auth/services/SessionManager';

export interface CustomerAsset {
  id: string;
  originalName: string;
  category: string;
  sizeFormatted: string;
  createdAt: string;
}

export class StorageRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockCustomerAssets: CustomerAsset[] = [
    {
      id: 'asset-8002',
      originalName: 'INV-20260723-5001.pdf',
      category: 'invoices',
      sizeFormatted: '0.35 MB',
      createdAt: '2026-07-23T11:15:00Z',
    },
  ];

  static async getCustomerAssets(): Promise<CustomerAsset[]> {
    return [...this.mockCustomerAssets];
  }
}
