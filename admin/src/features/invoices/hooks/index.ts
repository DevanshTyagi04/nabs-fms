'use client';

import { useState, useEffect, useCallback } from 'react';
import { InvoiceService } from '../api/InvoiceService';
import { Invoice, InvoiceFilters } from '../types';

export function useInvoices(initialFilters: InvoiceFilters) {
  const [filters, setFilters] = useState<InvoiceFilters>(initialFilters);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await InvoiceService.listInvoices(filters);
      setInvoices(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return {
    invoices,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchInvoices,
  };
}

export function useInvoice(id: string | null) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setInvoice(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    InvoiceService.getById(id)
      .then((data) => {
        if (isMounted) setInvoice(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Invoice not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { invoice, loading, error };
}

export function useCancelInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelInvoice = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await InvoiceService.cancelInvoice(id);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { cancelInvoice, loading, error };
}
