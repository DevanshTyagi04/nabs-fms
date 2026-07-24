import { useState, useEffect } from 'react';
import { SyncService } from '../api/SyncService';
import { VendorSyncState } from '../api/SyncRepository';

export function useSync() {
  const [data, setData] = useState<VendorSyncState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    SyncService.getVendorSyncState()
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
