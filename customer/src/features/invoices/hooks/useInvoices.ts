import { useState, useEffect } from 'react';
import { InvoiceService } from '../api/InvoiceService';
import { CustomerInvoice } from '../api/InvoiceRepository';

export function useInvoices() {
  const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await InvoiceService.getCustomerInvoices();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, error, refetch: fetchInvoices };
}
