'use client';

import { useState, useEffect, useCallback } from 'react';
import { WorkOrderService } from '../api/WorkOrderService';
import { WorkOrder, WorkOrderFilters } from '../types';

export function useWorkOrders(initialFilters: WorkOrderFilters) {
  const [filters, setFilters] = useState<WorkOrderFilters>(initialFilters);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await WorkOrderService.listWorkOrders(filters);
      setWorkOrders(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch work orders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  return {
    workOrders,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchWorkOrders,
  };
}

export function useWorkOrder(id: string | null) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setWorkOrder(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    WorkOrderService.getById(id)
      .then((data) => {
        if (isMounted) setWorkOrder(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Work Order not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { workOrder, loading, error };
}

export function useVerifyWorkOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyWorkOrder = async (id: string, remarks?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await WorkOrderService.verifyWorkOrder(id, remarks);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to verify work order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { verifyWorkOrder, loading, error };
}
