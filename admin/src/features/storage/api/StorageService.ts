import { StorageRepository } from './StorageRepository';
import { AssetItemDomain, StorageFilters, StorageListResult } from '../types';

export class StorageService {
  static async listAssets(filters: StorageFilters): Promise<StorageListResult> {
    return StorageRepository.listAssets(filters);
  }

  static async getSignedUrl(fileKey: string): Promise<string> {
    return StorageRepository.getSignedUrl(fileKey);
  }

  static async uploadFile(fileName: string, category: string, file: any): Promise<AssetItemDomain> {
    return StorageRepository.uploadFile(fileName, category, file);
  }

  static async deleteFile(fileKey: string): Promise<boolean> {
    return StorageRepository.deleteFile(fileKey);
  }
}
