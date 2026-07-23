'use client';

import { useState, useEffect, useCallback } from 'react';
import { EstimateService } from '../api/EstimateService';
import { Estimate, EstimateFilters } from '../types';

export function useEstimates(initialFilters: EstimateFilters) {
  const [filters, setFilters] = useState<EstimateFilters>(initialFilters);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await EstimateService.listEstimates(filters);
      setEstimates(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch estimates');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  return {
    estimates,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchEstimates,
  };
}

export function useEstimate(id: string | null) {
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setEstimate(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    EstimateService.getById(id)
      .then((data) => {
        if (isMounted) setEstimate(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Estimate not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { estimate, loading, error };
}

export function useApproveEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveEstimate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await EstimateService.approveEstimate(id);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to approve estimate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { approveEstimate, loading, error };
}

export function useRejectEstimate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rejectEstimate = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await EstimateService.rejectEstimate(id);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to reject estimate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { rejectEstimate, loading, error };
}
