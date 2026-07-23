export interface AssetItemDomain {
  id: string;
  key: string;
  originalName: string;
  contentType: string;
  size: number;
  category: 'avatars' | 'attachments' | 'invoices' | 'temp';
  publicUrl?: string;
  createdAt?: string;
}

export interface StorageFilters {
  search?: string;
  category?: string;
  page: number;
  pageSize: number;
}

export interface StorageListResult {
  items: AssetItemDomain[];
  total: number;
}
