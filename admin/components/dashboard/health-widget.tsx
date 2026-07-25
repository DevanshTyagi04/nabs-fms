'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '@/lib/dashboard-api';
import { HealthCheckResponse } from '@/lib/types/dashboard.types';

export function HealthWidget() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await dashboardApi.getHealthStatus();
      setHealth(data);
    } catch {
      setIsError(true);
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
        const data = await dashboardApi.getHealthStatus();
        if (isMounted) {
          setHealth(data);
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

    const interval = setInterval(load, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const isBackendUp = !isError && health?.status === 'ok';
  const isDbUp = !isError && health?.database?.status === 'up';

  return (
    <div className="p-4 border-t border-[#c6c6cd] bg-[#F8FAFC]/50">
      <div className="flex justify-between items-center mb-2">
        <p className="text-[9px] font-bold text-[#76777d] uppercase tracking-widest">
          Platform Health
        </p>
        <button
          onClick={fetchHealth}
          className="text-[10px] text-[#006591] hover:underline font-medium"
          title="Re-check probes"
        >
          Check
        </button>
      </div>

      {isLoading && !health ? (
        <div className="space-y-1 py-1">
          <div className="h-3 bg-slate-200 animate-pulse rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 animate-pulse rounded w-1/2"></div>
        </div>
      ) : isError ? (
        <p className="text-[10px] text-red-600 font-medium">Health check offline</p>
      ) : (
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isBackendUp ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-[10px] text-[#45464d] font-medium">Backend</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isDbUp ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="text-[10px] text-[#45464d] font-medium">PostgreSQL</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-[#45464d] font-medium">Redis</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] text-[#45464d] font-medium">Storage</span>
          </div>
        </div>
      )}
    </div>
  );
}
