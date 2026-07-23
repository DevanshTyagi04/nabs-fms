import { useState, useEffect } from 'react';
import { PaymentService } from '../api/PaymentService';
import { CustomerPayment } from '../api/PaymentRepository';

export function usePayments() {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await PaymentService.getCustomerPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, loading, error, refetch: fetchPayments };
}
