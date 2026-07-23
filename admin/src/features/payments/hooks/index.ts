'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaymentService } from '../api/PaymentService';
import { Payment, PaymentFilters } from '../types';

export function usePayments(initialFilters: PaymentFilters) {
  const [filters, setFilters] = useState<PaymentFilters>(initialFilters);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await PaymentService.listPayments(filters);
      setPayments(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchPayments,
  };
}

export function usePayment(id: string | null) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setPayment(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    PaymentService.getById(id)
      .then((data) => {
        if (isMounted) setPayment(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Payment not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { payment, loading, error };
}

export function useReconcilePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reconcilePayment = async (id: string, status: 'SUCCESS' | 'REFUNDED', notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await PaymentService.reconcilePayment(id, status, notes);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to reconcile payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { reconcilePayment, loading, error };
}
