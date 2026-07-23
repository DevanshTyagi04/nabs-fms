'use client';

import { useState, useEffect, useCallback } from 'react';
import { SearchService } from '../api/SearchService';
import { SearchResultItemDomain, SearchFilters } from '../types';

export function useGlobalSearch(initialFilters: SearchFilters) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<SearchResultItemDomain[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await SearchService.globalSearch(filters);
      setResults(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to execute global search');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return {
    results,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchResults,
  };
}
