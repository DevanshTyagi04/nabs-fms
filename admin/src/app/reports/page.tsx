'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { PageToolbar } from '@/components/crud/PageToolbar';

import { useReports } from '@/features/reports/hooks';
import { ReportsService } from '@/features/reports/api/ReportsService';
import { MetricCard } from '@/reports/components/MetricCard';
import { TrendChart } from '@/reports/components/TrendChart';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

const TIME_RANGES = [
  { value: '7D', label: 'Last 7 Days' },
  { value: '30D', label: 'Last 30 Days' },
  { value: 'YTD', label: 'Year to Date' },
  { value: 'ALL', label: 'All Time' },
];

export default function AdminReportsPage() {
  const router = useRouter();
  const toast = useToast();
  const { data, loading, filters, setFilters } = useReports({
    timeRange: '30D',
  });

  const handleExport = (format: 'CSV' | 'PDF') => {
    const res = ReportsService.exportReport('EXECUTIVE_SUMMARY', format);
    toast.success('Report Exported', `Report generated: ${res.filename}`);
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['ADMIN']}>
        <AppLayout>
          <div className="space-y-6">
            {/* Page Header Toolbar */}
            <PageToolbar
              title="Executive Analytics & Financial Reports"
              description="Real-time KPI metrics, revenue trend analytics, service request status breakdowns, and report export tools."
            />

            {/* Time Range Selector & Export Actions Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {TIME_RANGES.map((r) => (
                  <Button
                    key={r.value}
                    variant={filters.timeRange === r.value ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilters({ ...filters, timeRange: r.value as any })}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleExport('CSV')}>
                  Export CSV
                </Button>
                <Button variant="secondary" size="sm" onClick={() => handleExport('PDF')}>
                  Export PDF Report
                </Button>
              </div>
            </div>

            {/* Dashboard KPI Grid & Trend Charts */}
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading executive analytics...</div>
            ) : !data ? (
              <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                Failed to load executive metrics data.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.metrics.map((m) => (
                    <MetricCard
                      key={m.id}
                      metric={m}
                      onDrillDown={(route) => router.push(route as any)}
                    />
                  ))}
                </div>

                {/* Revenue Trend Visual Chart */}
                <TrendChart
                  title="Revenue & Daily Transaction Volume Trend"
                  data={data.trendSeries}
                />
              </div>
            )}
          </div>
        </AppLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}
