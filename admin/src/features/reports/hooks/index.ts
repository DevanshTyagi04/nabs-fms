'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReportsService } from '../api/ReportsService';
import { DashboardMetricsDomain, ReportFilters } from '../types';

export function useReports(initialFilters: ReportFilters) {
  const [filters, setFilters] = useState<ReportFilters>(initialFilters);
  const [data, setData] = useState<DashboardMetricsDomain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ReportsService.getAdminDashboard(filters);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch executive dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchDashboard,
  };
}
