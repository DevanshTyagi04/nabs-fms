import { useState, useEffect } from 'react';
import { EstimateService } from '../api/EstimateService';
import { VendorEstimate } from '../api/EstimateRepository';

export function useEstimates() {
  const [estimates, setEstimates] = useState<VendorEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EstimateService.getVendorEstimates();
      setEstimates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch vendor estimates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const submitEstimate = async (id: string) => {
    await EstimateService.submitEstimate(id);
    fetchEstimates();
  };

  return { estimates, loading, error, refetch: fetchEstimates, submitEstimate };
}
