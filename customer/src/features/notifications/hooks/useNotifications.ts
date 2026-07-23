import { useState, useEffect } from 'react';
import { NotificationService } from '../api/NotificationService';
import { CustomerNotification } from '../api/NotificationRepository';

export function useNotifications() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await NotificationService.getCustomerNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, error, refetch: fetchNotifications };
}
