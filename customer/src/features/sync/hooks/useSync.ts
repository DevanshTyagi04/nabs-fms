import { useState, useEffect } from 'react';
import { SyncService } from '../api/SyncService';
import { CustomerSyncState } from '../api/SyncRepository';

export function useSync() {
  const [data, setData] = useState<CustomerSyncState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    SyncService.getCustomerSyncState()
      .then((res) => {
        if (isMounted) setData(res);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading };
}
