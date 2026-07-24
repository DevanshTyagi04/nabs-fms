'use client';

import { useState, useEffect, useCallback } from 'react';
import { SyncService } from '../api/SyncService';
import { SyncStatsDomain } from '../types';

export function useSync() {
  const [data, setData] = useState<SyncStatsDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSyncState = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await SyncService.getSyncState();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sync queue status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSyncState();
  }, [fetchSyncState]);

  const retryItem = async (id: string) => {
    await SyncService.retryQueueItem(id);
    await fetchSyncState();
  };

  return {
    data,
    loading,
    error,
    refetch: fetchSyncState,
    retryItem,
  };
}
