import { SessionManager } from '@/auth/services/SessionManager';
import { AssetItemDomain, StorageFilters, StorageListResult } from '../types';

export class StorageRepository {
  private static getClient() {
    return SessionManager.getClient();
  }

  private static mockDatabase: AssetItemDomain[] = [
    {
      id: 'asset-8001',
      key: 'attachments/hvac-capacitor-photo.jpg',
      originalName: 'hvac-capacitor-photo.jpg',
      contentType: 'image/jpeg',
      size: 1845000,
      category: 'attachments',
      publicUrl: '/api/v1/storage/download/attachments/hvac-capacitor-photo.jpg',
      createdAt: '2026-07-23T11:00:00Z',
    },
    {
      id: 'asset-8002',
      key: 'invoices/INV-20260723-5001.pdf',
      originalName: 'INV-20260723-5001.pdf',
      contentType: 'application/pdf',
      size: 345000,
      category: 'invoices',
      publicUrl: '/api/v1/storage/download/invoices/INV-20260723-5001.pdf',
      createdAt: '2026-07-23T11:15:00Z',
    },
    {
      id: 'asset-8003',
      key: 'avatars/usr-vendor-01.png',
      originalName: 'usr-vendor-01.png',
      contentType: 'image/png',
      size: 512000,
      category: 'avatars',
      publicUrl: '/api/v1/storage/download/avatars/usr-vendor-01.png',
      createdAt: '2026-07-20T09:00:00Z',
    },
  ];

  static async listAssets(filters: StorageFilters): Promise<StorageListResult> {
    let items = [...this.mockDatabase];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (a) => a.originalName.toLowerCase().includes(q) || a.key.toLowerCase().includes(q)
      );
    }

    if (filters.category && filters.category !== 'ALL') {
      items = items.filter((a) => a.category === filters.category);
    }

    const total = items.length;
    const startIndex = (filters.page - 1) * filters.pageSize;
    const paginated = items.slice(startIndex, startIndex + filters.pageSize);

    return { items: paginated, total };
  }

  static async getSignedUrl(fileKey: string): Promise<string> {
    try {
      const client = this.getClient();
      const res = await client.storage.getSignedUrl(fileKey);
      if (res.data?.signedUrl) return res.data.signedUrl;
    } catch {
      // Fallback
    }
    return `/api/v1/storage/download/${fileKey}`;
  }

  static async uploadFile(fileName: string, category: string, file: any): Promise<AssetItemDomain> {
    const newAsset: AssetItemDomain = {
      id: `asset-${Date.now()}`,
      key: `${category}/${fileName}`,
      originalName: fileName,
      contentType: file.type || 'application/octet-stream',
      size: file.size || 1024000,
      category: category as any,
      publicUrl: `/api/v1/storage/download/${category}/${fileName}`,
      createdAt: new Date().toISOString(),
    };

    this.mockDatabase.unshift(newAsset);
    return newAsset;
  }

  static async deleteFile(fileKey: string): Promise<boolean> {
    const index = this.mockDatabase.findIndex((a) => a.key === fileKey);
    if (index !== -1) {
      this.mockDatabase.splice(index, 1);
    }
    return true;
  }
}
