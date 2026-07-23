import { useState, useEffect } from 'react';
import { SearchService } from '../api/SearchService';
import { CustomerSearchResult } from '../api/SearchRepository';

export function useSearch(query: string) {
  const [results, setResults] = useState<CustomerSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    SearchService.searchCustomer(query)
      .then((data) => {
        if (isMounted) setResults(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to search customer records');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  return { results, loading, error };
}
