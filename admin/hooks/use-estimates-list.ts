'use client';

import { useState, useEffect, useCallback } from 'react';
import { estimatesApi } from '@/lib/estimates-api';
import { EstimateListItem, EstimateQueryParams } from '@/lib/types/estimates.types';

interface UseEstimatesListReturn {
  estimates: EstimateListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  isError: boolean;
  errorMsg: string;
  refetch: () => void;
}

export function useEstimatesList(params: EstimateQueryParams): UseEstimatesListReturn {
  const [estimates, setEstimates] = useState<EstimateListItem[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: params.page || 1,
    limit: params.limit || 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchEstimates = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMsg('');
    try {
      const result = await estimatesApi.getAllEstimates(params);

      setEstimates(result.data || []);

      if (result.meta) {
        setMeta((prev) => ({
          ...prev,
          total: result.meta?.totalItems ?? result.meta?.total ?? result.data.length,
          totalPages: result.meta?.totalPages ?? 1,
        }));
      } else {
        setMeta((prev) => ({
          ...prev,
          total: result.data.length,
          totalPages: Math.max(1, Math.ceil(result.data.length / prev.limit)),
        }));
      }
    } catch (err: unknown) {
      setIsError(true);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch estimates');
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.limit,
    params.search,
    params.status,
    params.vendorId,
    params.serviceRequestId,
    params.sortBy,
    params.sortOrder,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setIsError(false);
      setErrorMsg('');
      try {
        const result = await estimatesApi.getAllEstimates(params);
        if (isMounted) {
          setEstimates(result.data || []);
          if (result.meta) {
            setMeta((prev) => ({
              ...prev,
              total: result.meta?.totalItems ?? result.meta?.total ?? result.data.length,
              totalPages: result.meta?.totalPages ?? 1,
            }));
          } else {
            setMeta((prev) => ({
              ...prev,
              total: result.data.length,
              totalPages: Math.max(1, Math.ceil(result.data.length / prev.limit)),
            }));
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsError(true);
          setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch estimates');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params.page,
    params.limit,
    params.search,
    params.status,
    params.vendorId,
    params.serviceRequestId,
    params.sortBy,
    params.sortOrder,
  ]);

  return { estimates, meta, isLoading, isError, errorMsg, refetch: fetchEstimates };
}
