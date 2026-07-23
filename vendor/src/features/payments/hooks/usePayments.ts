import { useState, useEffect } from 'react';
import { PaymentService } from '../api/PaymentService';
import { VendorPayment } from '../api/PaymentRepository';

export function usePayments() {
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PaymentService.getVendorPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, loading, error, refetch: fetchPayments };
}
