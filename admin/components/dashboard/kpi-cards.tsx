'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/dashboard-api';
import { DashboardSummaryData } from '@/lib/types/dashboard.types';
import { CheckCircle, Clock } from 'lucide-react';

interface KpiCardsProps {
  onRefreshFinished?: () => void;
  refreshTrigger?: number;
}

export function KpiCards({ refreshTrigger }: KpiCardsProps) {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const summaryData = await dashboardApi.getSummaryMetrics();
      setData(summaryData);
    } catch (err: unknown) {
      setIsError(true);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load executive summary metrics');
    } flex: {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const summaryData = await dashboardApi.getSummaryMetrics();
        if (isMounted) {
          setData(summaryData);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setIsError(true);
          setErrorMsg(err instanceof Error ? err.message : 'Failed to load executive summary metrics');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border border-slate-200 bg-white p-3 rounded-xl space-y-2 animate-pulse">
            <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{errorMsg || 'Unable to load executive metrics'}</span>
        </div>
        <button
          onClick={fetchMetrics}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { serviceRequests, users, surveys, estimates, financials } = data.summary;
  const pendingQa = (surveys?.submitted || 0) + (estimates?.pendingApproval || 0);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '₹0';
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Requests */}
      <div className="card-stat border border-[#e2e8f0] bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow transition-all">
        <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-1">Total Requests</p>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-[#0b1c30]">{serviceRequests.total.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-[#006591]">Live</span>
        </div>
      </div>

      {/* Open Requests */}
      <div className="card-stat border border-[#e2e8f0] bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow transition-all">
        <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-1">Open Requests</p>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-[#ba1a1a]">{serviceRequests.open.toLocaleString()}</span>
          {serviceRequests.open > 0 && (
            <span className="text-[9px] bg-[#ffdad6] text-[#93000a] px-1.5 py-0.5 rounded-sm font-bold">URGENT</span>
          )}
        </div>
      </div>

      {/* Assigned Requests */}
      <div className="card-stat border border-[#e2e8f0] bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow transition-all">
        <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-1">Assigned Requests</p>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-[#0b1c30]">{serviceRequests.assigned.toLocaleString()}</span>
          <span className="text-[10px] text-[#45464d] font-medium">Active</span>
        </div>
      </div>

      {/* Completed Jobs */}
      <div className="card-stat border border-[#e2e8f0] border-l-4 border-l-emerald-500 bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow transition-all">
        <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-1">Completed Jobs</p>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-emerald-600">{serviceRequests.completed.toLocaleString()}</span>
          <span className="material-symbols-outlined text-[18px] text-emerald-600"><CheckCircle /></span>
        </div>
      </div>

      {/* Total Customers */}
      <div className="card-stat border border-[#e2e8f0] bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow transition-all">
        <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-1">Total Customers</p>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-[#0b1c30]">{users.totalCustomers.toLocaleString()}</span>
          <span className="text-[10px] text-[#45464d] font-medium">Registered</span>
        </div>
      </div>

      {/* Active Vendors */}
      <div className="card-stat border border-[#e2e8f0] bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow transition-all">
        <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-1">Active Vendors</p>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-[#0b1c30]">{users.totalVendors.toLocaleString()}</span>
          <span className="text-[10px] text-[#45464d] font-medium">Platform</span>
        </div>
      </div>

      {/* Pending QA Reviews */}
      <div className="card-stat border border-[#e2e8f0] bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow transition-all">
        <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-1">Pending QA Reviews</p>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-[#0b1c30]">{pendingQa.toLocaleString()}</span>
          <span className="text-[9px] bg-[#e5eeff] text-[#006591] px-1.5 py-0.5 rounded-sm font-bold">REVIEWS</span>
        </div>
      </div>

      {/* Outstanding Payments */}
      <div className="card-stat border border-[#e2e8f0] bg-white p-3 md:p-4 rounded-xl shadow-sm hover:shadow transition-all">
        <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-1">Outstanding Payments</p>
        <div className="flex items-end justify-between">
          <span className="text-xl font-bold text-[#0b1c30]">{formatCurrency(financials.outstandingAmount)}</span>
          <span className="material-symbols-outlined text-[18px] text-[#45464d]"><Clock /></span>
        </div>
      </div>
    </div>
  );
}
