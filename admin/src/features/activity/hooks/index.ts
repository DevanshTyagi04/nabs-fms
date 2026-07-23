'use client';

import { useState, useEffect, useCallback } from 'react';
import { ActivityService } from '../api/ActivityService';
import { TimelineItemDomain, ActivityFilters } from '../types';

export function useActivityTimeline(initialFilters: ActivityFilters) {
  const [filters, setFilters] = useState<ActivityFilters>(initialFilters);
  const [items, setItems] = useState<TimelineItemDomain[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ActivityService.getAdminTimeline(filters);
      setItems(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch activity timeline');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  return {
    items,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchTimeline,
  };
}

export function useEntityHistory(entity: string, entityId: string) {
  const [history, setHistory] = useState<TimelineItemDomain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entity || !entityId) return;
    setLoading(true);
    ActivityService.getEntityHistory(entity, entityId)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [entity, entityId]);

  return { history, loading };
}
