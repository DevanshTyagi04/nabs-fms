'use client';

import { useState, useEffect, useCallback } from 'react';
import { ServiceRequestService } from '../api/ServiceRequestService';
import { ServiceRequest, ServiceRequestFilters, CreateServiceRequestDto } from '../types';

export function useServiceRequests(initialFilters: ServiceRequestFilters) {
  const [filters, setFilters] = useState<ServiceRequestFilters>(initialFilters);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ServiceRequestService.listRequests(filters);
      setRequests(res.items);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    total,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchRequests,
  };
}

export function useServiceRequest(id: string | null) {
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setRequest(null);
      return;
    }
    let isMounted = true;
    setLoading(true);
    ServiceRequestService.getById(id)
      .then((data) => {
        if (isMounted) setRequest(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Service request not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  return { request, loading, error };
}

export function useCreateServiceRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRequest = async (dto: CreateServiceRequestDto) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ServiceRequestService.create(dto);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to create service request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createRequest, loading, error };
}

export function useAssignVendor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignVendor = async (id: string, vendorId: string, vendorName: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ServiceRequestService.assignVendor(id, vendorId, vendorName, notes);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to assign vendor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { assignVendor, loading, error };
}

export function useChangeRequestStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = async (id: string, status: any, remarks?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ServiceRequestService.changeStatus(id, status, remarks);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to change request status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changeStatus, loading, error };
}
