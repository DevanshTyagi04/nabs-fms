import { StorageRepository, VendorAsset } from './StorageRepository';

export class StorageService {
  static async getVendorAssets(): Promise<VendorAsset[]> {
    return StorageRepository.getVendorAssets();
  }
}
