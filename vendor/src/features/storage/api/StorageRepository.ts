import { SessionManager } from '@/auth/services/SessionManager';

export interface VendorAsset {
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

  private static mockVendorAssets: VendorAsset[] = [
    {
      id: 'asset-8001',
      originalName: 'hvac-capacitor-photo.jpg',
      category: 'attachments',
      sizeFormatted: '1.85 MB',
      createdAt: '2026-07-23T11:00:00Z',
    },
  ];

  static async getVendorAssets(): Promise<VendorAsset[]> {
    return [...this.mockVendorAssets];
  }
}
