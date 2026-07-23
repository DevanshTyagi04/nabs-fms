import { useState, useEffect } from 'react';
import { EstimateService } from '../api/EstimateService';
import { CustomerEstimate } from '../api/EstimateRepository';

export function useEstimates() {
  const [estimates, setEstimates] = useState<CustomerEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstimates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await EstimateService.getCustomerEstimates();
      setEstimates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer estimates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, []);

  const approveEstimate = async (id: string) => {
    await EstimateService.approveEstimate(id);
    fetchEstimates();
  };

  const rejectEstimate = async (id: string) => {
    await EstimateService.rejectEstimate(id);
    fetchEstimates();
  };

  return { estimates, loading, error, refetch: fetchEstimates, approveEstimate, rejectEstimate };
}
