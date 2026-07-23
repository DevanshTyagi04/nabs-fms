import { useState, useEffect } from 'react';
import { SearchService } from '../api/SearchService';
import { VendorSearchResult } from '../api/SearchRepository';

export function useSearch(query: string) {
  const [results, setResults] = useState<VendorSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    SearchService.searchVendor(query)
      .then((data) => {
        if (isMounted) setResults(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to search vendor dispatches');
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
