import { useState, useEffect } from 'react';
import { WorkOrderService } from '../api/WorkOrderService';
import { VendorWorkOrder } from '../api/WorkOrderRepository';

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<VendorWorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await WorkOrderService.getVendorWorkOrders();
      setWorkOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor work orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await WorkOrderService.updateStatus(id, status);
    fetchWorkOrders();
  };

  const toggleTask = async (workOrderId: string, taskId: string) => {
    await WorkOrderService.toggleTask(workOrderId, taskId);
    fetchWorkOrders();
  };

  return { workOrders, loading, error, refetch: fetchWorkOrders, updateStatus, toggleTask };
}
