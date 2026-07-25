'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/dashboard-api';
import { RevenueAnalyticsResponse } from '@/lib/types/dashboard.types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  refreshTrigger?: number;
}

export function RevenueChart({ refreshTrigger }: RevenueChartProps) {
  const [data, setData] = useState<RevenueAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchRevenue = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const analytics = await dashboardApi.getRevenueAnalytics();
      setData(analytics);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoading(true);
      setIsError(false);
      try {
        const analytics = await dashboardApi.getRevenueAnalytics();
        if (isMounted) {
          setData(analytics);
        }
      } catch {
        if (isMounted) {
          setIsError(true);
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
      <div className="bg-[#ffffff] border border-[#c6c6cd] rounded-lg p-5 shadow-sm min-h-[220px] flex flex-col justify-center">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="h-32 bg-slate-100 animate-pulse rounded"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 shadow-sm min-h-[220px] flex flex-col items-center justify-center text-center">
        <p className="text-xs text-red-600 font-medium mb-2">Unable to load revenue analytics</p>
        <button
          onClick={fetchRevenue}
          className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const byMethod = Array.isArray(data.revenueByPaymentMethod) ? data.revenueByPaymentMethod : [];

  if (byMethod.length === 0) {
    return (
      <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 shadow-sm min-h-[220px] flex flex-col justify-center items-center">
        <div className="flex justify-between items-center w-full mb-4">
          <h2 className="text-[13px] font-bold text-[#0b1c30]">Revenue Breakdown</h2>
          <span className="text-[10px] text-[#45464d] font-bold px-2 py-0.5 bg-[#F8FAFC] rounded border border-[#c6c6cd]">
            {data.period || 'THIS_MONTH'}
          </span>
        </div>
        <div className="text-xs text-[#76777d]">No chart data available</div>
      </div>
    );
  }

  const chartData = byMethod.map((item) => ({
    method: item.paymentMethod,
    amount: parseFloat(item.totalAmount) || 0,
    count: item.transactionCount,
  }));

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[13px] font-bold text-[#0b1c30]">Revenue by Payment Method</h2>
        <span className="text-[10px] text-[#45464d] font-bold px-2 py-0.5 bg-[#F8FAFC] rounded border border-[#c6c6cd]">
          {data.period || 'THIS_MONTH'}
        </span>
      </div>

      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="method" tick={{ fontSize: 10, fill: '#45464d' }} />
            <YAxis tick={{ fontSize: 10, fill: '#45464d' }} />
            <Tooltip
              formatter={(value: unknown) => [
                `₹${typeof value === 'number' ? value.toLocaleString('en-IN') : String(value ?? 0)}`,
                'Revenue',
              ]}
            />
            <Bar dataKey="amount" fill="#006591" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
