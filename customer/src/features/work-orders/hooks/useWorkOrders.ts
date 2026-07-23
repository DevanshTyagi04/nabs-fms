import { useState, useEffect } from 'react';
import { WorkOrderService } from '../api/WorkOrderService';
import { CustomerWorkOrder } from '../api/WorkOrderRepository';

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<CustomerWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await WorkOrderService.getCustomerWorkOrders();
      setWorkOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  return { workOrders, loading, error, refetch: fetchWorkOrders };
}
