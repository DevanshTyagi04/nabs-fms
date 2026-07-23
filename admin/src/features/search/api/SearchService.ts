import { SearchRepository } from './SearchRepository';
import { SearchFilters, SearchListResult } from '../types';

export class SearchService {
  static async globalSearch(filters: SearchFilters): Promise<SearchListResult> {
    return SearchRepository.globalSearch(filters);
  }
}
