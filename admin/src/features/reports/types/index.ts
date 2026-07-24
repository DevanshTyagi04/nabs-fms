import { DashboardMetric } from '@/reports/core/types';

export interface DashboardMetricsDomain {
  metrics: DashboardMetric[];
  trendSeries: Array<{ label: string; value: number }>;
}

export interface ReportFilters {
  timeRange: '7D' | '30D' | 'YTD' | 'ALL';
}
