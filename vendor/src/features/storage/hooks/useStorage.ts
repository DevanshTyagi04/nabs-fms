import { useState, useEffect } from 'react';
import { StorageService } from '../api/StorageService';
import { VendorAsset } from '../api/StorageRepository';

export function useStorage() {
  const [assets, setAssets] = useState<VendorAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await StorageService.getVendorAssets();
      setAssets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  return { assets, loading, error, refetch: fetchAssets };
}
