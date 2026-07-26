import { useState, useEffect, useCallback } from 'react';
import { serviceRequestsApi } from '@/lib/service-requests-api';
import { surveysApi } from '@/lib/surveys-api';
import { estimatesApi } from '@/lib/estimates-api';
import { workOrdersApi } from '@/lib/work-orders-api';
import { paymentsApi } from '@/lib/payments-api';
import { invoicesApi } from '@/lib/invoices-api';
import { activityApi } from '@/lib/activity-api';
import { vendorsApi } from '@/lib/vendors-api';
import {
  ActivityTimelineItem,
  EstimateSummary,
  InvoiceSummary,
  PaymentSummary,
  ServiceRequestDetail,
  SurveySummary,
  VendorOptionItem,
  WorkOrderSummary,
} from '@/lib/types/service-requests.types';

export function useServiceRequestDetails(id: string) {
  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const data = await serviceRequestsApi.getRequestById(id);
      setRequest(data);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err?.response?.data?.message || err?.message || 'Failed to load service request details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    request,
    isLoading,
    isError,
    errorMessage,
    refetch: fetchDetails,
  };
}

export function useSecondaryRequestData(requestId: string, isEnabled: boolean) {
  // Surveys
  const [surveys, setSurveys] = useState<SurveySummary[]>([]);
  const [loadingSurveys, setLoadingSurveys] = useState<boolean>(false);

  // Estimates
  const [estimates, setEstimates] = useState<EstimateSummary[]>([]);
  const [loadingEstimates, setLoadingEstimates] = useState<boolean>(false);

  // Work Orders
  const [workOrders, setWorkOrders] = useState<WorkOrderSummary[]>([]);
  const [loadingWorkOrders, setLoadingWorkOrders] = useState<boolean>(false);

  // Payments & Invoices
  const [payments, setPayments] = useState<PaymentSummary[]>([]);
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([]);
  const [loadingFinancials, setLoadingFinancials] = useState<boolean>(false);

  // Activity Timeline
  const [timeline, setTimeline] = useState<ActivityTimelineItem[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

  // Vendors List (for assignment dropdown)
  const [vendors, setVendors] = useState<VendorOptionItem[]>([]);
  const [loadingVendors, setLoadingVendors] = useState<boolean>(false);

  const fetchSurveys = useCallback(async () => {
    if (!requestId) return;
    setLoadingSurveys(true);
    try {
      const res = await surveysApi.getSurveysByRequestId(requestId);
      setSurveys(res);
    } catch {
      setSurveys([]);
    } finally {
      setLoadingSurveys(false);
    }
  }, [requestId]);

  const fetchEstimates = useCallback(async () => {
    if (!requestId) return;
    setLoadingEstimates(true);
    try {
      const res = await estimatesApi.getEstimatesByRequestId(requestId);
      setEstimates(res);
    } catch {
      setEstimates([]);
    } finally {
      setLoadingEstimates(false);
    }
  }, [requestId]);

  const fetchWorkOrders = useCallback(async () => {
    if (!requestId) return;
    setLoadingWorkOrders(true);
    try {
      const res = await workOrdersApi.getWorkOrdersByRequestId(requestId);
      setWorkOrders(res);
    } catch {
      setWorkOrders([]);
    } finally {
      setLoadingWorkOrders(false);
    }
  }, [requestId]);

  const fetchFinancials = useCallback(async () => {
    if (!requestId) return;
    setLoadingFinancials(true);
    try {
      const [payRes, invRes] = await Promise.all([
        paymentsApi.getPaymentsByRequestId(requestId),
        invoicesApi.getInvoicesByRequestId(requestId),
      ]);
      setPayments(payRes);
      setInvoices(invRes);
    } catch {
      setPayments([]);
      setInvoices([]);
    } finally {
      setLoadingFinancials(false);
    }
  }, [requestId]);

  const fetchTimeline = useCallback(async () => {
    if (!requestId) return;
    setLoadingTimeline(true);
    try {
      const res = await activityApi.getEntityHistory('ServiceRequest', requestId);
      setTimeline(res);
    } catch {
      setTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  }, [requestId]);

  const fetchVendors = useCallback(async () => {
    setLoadingVendors(true);
    try {
      const res = await vendorsApi.getVendorsList();
      setVendors(res);
    } catch {
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  useEffect(() => {
    if (isEnabled && requestId) {
      // Parallel execution of secondary data queries
      fetchSurveys();
      fetchEstimates();
      fetchWorkOrders();
      fetchFinancials();
      fetchTimeline();
      fetchVendors();
    }
  }, [isEnabled, requestId, fetchSurveys, fetchEstimates, fetchWorkOrders, fetchFinancials, fetchTimeline, fetchVendors]);

  return {
    surveys,
    loadingSurveys,
    refetchSurveys: fetchSurveys,

    estimates,
    loadingEstimates,
    refetchEstimates: fetchEstimates,

    workOrders,
    loadingWorkOrders,
    refetchWorkOrders: fetchWorkOrders,

    payments,
    invoices,
    loadingFinancials,
    refetchFinancials: fetchFinancials,

    timeline,
    loadingTimeline,
    refetchTimeline: fetchTimeline,

    vendors,
    loadingVendors,
    refetchVendors: fetchVendors,
  };
}
