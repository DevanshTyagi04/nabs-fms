'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/dashboard-api';
import { DashboardSummaryData } from '@/lib/types/dashboard.types';
import { BadgeCheck, Calculator, ClipboardList, UserSearch } from 'lucide-react';

interface NeedsAttentionProps {
  refreshTrigger?: number;
}

export function NeedsAttention({ refreshTrigger }: NeedsAttentionProps) {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const result = await dashboardApi.getSummaryMetrics();
      setData(result);
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
        const result = await dashboardApi.getSummaryMetrics();
        if (isMounted) {
          setData(result);
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
      <div className="bg-white border border-[#c6c6cd] rounded-lg p-4 flex flex-col shadow-sm">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-white border border-[#c6c6cd] rounded-lg p-5 flex flex-col items-center justify-center text-center shadow-sm">
        <p className="text-xs text-red-600 font-medium mb-3">Unable to load worklist items</p>
        <button
          onClick={fetchMetrics}
          className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { serviceRequests, surveys, estimates, workOrders } = data.summary;

  const items = [
    {
      icon: <UserSearch />,
      title: 'Vendor Assignment',
      count: serviceRequests?.open || 0,
    },
    {
      icon: <ClipboardList />,
      title: 'Surveys for QA',
      count: surveys?.submitted || 0,
    },
    {
      icon: <Calculator />,
      title: 'Pending Estimates',
      count: estimates?.pendingApproval || 0,
    },
    {
      icon: <BadgeCheck />,
      title: 'WO Verification',
      count: workOrders?.active || 0,
    },
  ];

  const totalCount = items.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="bg-white border border-[#c6c6cd] rounded-lg flex flex-col shadow-sm">
      <div className="px-5 py-3 border-b border-[#c6c6cd] bg-white">
        <h2 className="text-[14px] font-bold text-[#0b1c30]">Needs Attention</h2>
      </div>

      <div className="p-3 space-y-2 flex-1">
        {totalCount === 0 ? (
          <div className="p-6 text-center text-xs text-[#76777d]">
            No pending action items
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={idx}
              className="action-card flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#c6c6cd] hover:bg-[#eff6ff] hover:border-[#006591] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#006591] text-[18px]">
                  {item.icon}
                </span>
                <span className="text-[12px] font-medium text-[#0b1c30]">{item.title}</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#006591] text-white font-mono">
                {String(item.count).padStart(2, '0')}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-[#c6c6cd]">
        <a
          href="/service-requests"
          className="block w-full text-center py-2 text-[11px] font-bold text-[#006591] border border-[#006591] rounded-lg hover:bg-[#006591]/5 transition-colors"
        >
          View Worklist
        </a>
      </div>
    </div>
  );
}
