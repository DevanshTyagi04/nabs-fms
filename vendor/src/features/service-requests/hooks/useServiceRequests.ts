import { useState, useEffect } from 'react';
import { ServiceRequestService } from '../api/ServiceRequestService';
import { VendorServiceRequest } from '../api/ServiceRequestRepository';

export function useServiceRequests() {
  const [requests, setRequests] = useState<VendorServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ServiceRequestService.getAssignedRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assigned dispatches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const acceptAssignment = async (id: string) => {
    await ServiceRequestService.acceptAssignment(id);
    fetchRequests();
  };

  const rejectAssignment = async (id: string) => {
    await ServiceRequestService.rejectAssignment(id);
    fetchRequests();
  };

  return { requests, loading, error, refetch: fetchRequests, acceptAssignment, rejectAssignment };
}
