import { SearchRepository, VendorSearchResult } from './SearchRepository';

export class SearchService {
  static async searchVendor(query: string): Promise<VendorSearchResult[]> {
    return SearchRepository.searchVendor(query);
  }
}
