'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { TopHeader } from '@/components/dashboard/top-header';
import { Sidebar } from '@/components/dashboard/sidebar';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { RecentRequestsTable } from '@/components/dashboard/recent-requests-table';
import { NeedsAttention } from '@/components/dashboard/needs-attention';
import { StatusChart } from '@/components/dashboard/status-chart';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { RefreshCcw } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setRefreshTrigger((prev) => prev + 1);
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-[#0b1c30] rounded-full animate-spin"></div>
          <p className="text-sm text-[#45464d] font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopHeader />
      <div className="flex min-h-screen pt-14">
        <Sidebar />

        <main className="lg:ml-60 flex-1 p-4 md:p-6 bg-[#F8FAFC] max-w-7xl mx-auto w-full">
          {/* Header Row */}
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0b1c30] tracking-tight font-sans">
                Operations Dashboard
              </h1>
              <p className="text-[13px] text-[#45464d]">Platform Overview & System Vitals</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-[#45464d] font-medium hidden sm:inline">
                Last updated: <span className="font-mono">{lastUpdated || '--:--:--'}</span>
              </span>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c6c6cd] rounded-lg hover:bg-[#e5eeff] transition-all active:scale-95 shadow-sm text-xs font-semibold text-[#0b1c30]"
              >
                <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
                  <RefreshCcw />
                </span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Section 1: KPI Stat Cards */}
          <KpiCards refreshTrigger={refreshTrigger} />

          {/* Section 2: Recent Requests Table & Needs Attention Worklist */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
            <div className="xl:col-span-3">
              <RecentRequestsTable refreshTrigger={refreshTrigger} />
            </div>
            <div className="xl:col-span-1">
              <NeedsAttention refreshTrigger={refreshTrigger} />
            </div>
          </div>

          {/* Section 3: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <StatusChart refreshTrigger={refreshTrigger} />
            <RevenueChart refreshTrigger={refreshTrigger} />
          </div>

          {/* Section 4: System Activity Feed */}
          <ActivityFeed refreshTrigger={refreshTrigger} />
        </main>
      </div>
    </div>
  );
}
