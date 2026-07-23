import { useState, useEffect } from 'react';
import { ActivityService } from '../api/ActivityService';
import { VendorTimelineItem } from '../api/ActivityRepository';

export function useActivity() {
  const [items, setItems] = useState<VendorTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    ActivityService.getVendorTimeline()
      .then((data) => {
        if (isMounted) setItems(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to fetch activity history');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { items, loading, error };
}
