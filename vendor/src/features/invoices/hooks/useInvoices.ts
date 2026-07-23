import { useState, useEffect } from 'react';
import { InvoiceService } from '../api/InvoiceService';
import { VendorInvoice } from '../api/InvoiceRepository';

export function useInvoices() {
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InvoiceService.getVendorInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, error, refetch: fetchInvoices };
}
