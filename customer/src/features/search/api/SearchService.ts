import { SearchRepository, CustomerSearchResult } from './SearchRepository';

export class SearchService {
  static async searchCustomer(query: string): Promise<CustomerSearchResult[]> {
    return SearchRepository.searchCustomer(query);
  }
}
