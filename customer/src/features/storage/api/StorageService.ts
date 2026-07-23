import { StorageRepository, CustomerAsset } from './StorageRepository';

export class StorageService {
  static async getCustomerAssets(): Promise<CustomerAsset[]> {
    return StorageRepository.getCustomerAssets();
  }
}
