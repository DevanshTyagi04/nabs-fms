'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/dashboard-api';
import { ServiceAnalyticsResponse } from '@/lib/types/dashboard.types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusChartProps {
  refreshTrigger?: number;
}

const COLORS: Record<string, string> = {
  ASSIGNED: '#006591',
  IN_PROGRESS: '#39b8fd',
  SURVEYED: '#39b8fd',
  COMPLETED: '#10B981',
  WORK_COMPLETED: '#10B981',
  CREATED: '#cbd5e1',
};

export function StatusChart({ refreshTrigger }: StatusChartProps) {
  const [analytics, setAnalytics] = useState<ServiceAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await dashboardApi.getServiceAnalytics();
      setAnalytics(data);
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
        const data = await dashboardApi.getServiceAnalytics();
        if (isMounted) {
          setAnalytics(data);
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
      <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 shadow-sm min-h-[220px] flex flex-col justify-center">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-slate-300 animate-spin mx-auto"></div>
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 shadow-sm min-h-[220px] flex flex-col items-center justify-center text-center">
        <p className="text-xs text-red-600 font-medium mb-2">Unable to load status distribution</p>
        <button
          onClick={fetchAnalytics}
          className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const rawDist = analytics.serviceRequestDistribution || [];
  const totalCount = rawDist.reduce((sum, item) => sum + item.count, 0);

  if (totalCount === 0) {
    return (
      <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 shadow-sm min-h-[220px] flex flex-col justify-center items-center">
        <h2 className="text-[13px] font-bold text-[#0b1c30] mb-4 self-start">Service Request Status</h2>
        <div className="text-xs text-[#76777d]">No chart data available</div>
      </div>
    );
  }

  const chartData = rawDist.map((item) => ({
    name: item.status,
    value: item.count,
    percentage: Math.round((item.count / totalCount) * 100),
  }));

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 shadow-sm">
      <h2 className="text-[13px] font-bold text-[#0b1c30] mb-4">Service Request Status</h2>
      <div className="flex items-center justify-between gap-6">
        <div className="relative w-36 h-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || '#94A3B8'}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: unknown) => [
                  typeof value === 'number' ? value.toLocaleString() : String(value ?? 0),
                  'Requests',
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-[#0b1c30] leading-none">{totalCount.toLocaleString()}</span>
            <span className="text-[9px] uppercase font-bold text-[#45464d] mt-0.5">Requests</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 gap-2 text-xs">
          {chartData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: COLORS[item.name] || '#94A3B8' }}
                ></div>
                <span className="text-[#45464d] font-medium text-[11px] capitalize">
                  {item.name.toLowerCase().replace('_', ' ')}
                </span>
              </div>
              <span className="font-bold text-[#0b1c30] text-[11px]">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
