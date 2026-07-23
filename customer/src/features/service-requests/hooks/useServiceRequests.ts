import { useState, useEffect } from 'react';
import { ServiceRequestService } from '../api/ServiceRequestService';
import { CustomerServiceRequest } from '../api/ServiceRequestRepository';

export function useServiceRequests() {
  const [requests, setRequests] = useState<CustomerServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ServiceRequestService.getMyRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const createRequest = async (dto: { title: string; category: string; description: string; priority?: string; serviceAddress?: string }) => {
    setCreating(true);
    try {
      const created = await ServiceRequestService.createRequest(dto);
      fetchRequests();
      return created;
    } finally {
      setCreating(false);
    }
  };

  const cancelRequest = async (id: string) => {
    await ServiceRequestService.cancelRequest(id);
    fetchRequests();
  };

  return { requests, loading, creating, error, refetch: fetchRequests, createRequest, cancelRequest };
}
