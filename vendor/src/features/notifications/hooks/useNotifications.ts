import { useState, useEffect } from 'react';
import { NotificationService } from '../api/NotificationService';
import { VendorNotification } from '../api/NotificationRepository';

export function useNotifications() {
  const [notifications, setNotifications] = useState<VendorNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await NotificationService.getVendorNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, error, refetch: fetchNotifications };
}
