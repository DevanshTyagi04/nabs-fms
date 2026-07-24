export interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  trendPercent?: number;
  isPositive?: boolean;
  category: 'REVENUE' | 'WORK_ORDERS' | 'SERVICES' | 'PAYMENTS';
  icon: string;
}

export interface WidgetConfig {
  widgetId: string;
  type: 'KPI' | 'BAR_CHART' | 'LINE_CHART' | 'PIE_CHART' | 'TABLE';
  title: string;
  drillDownRoute: string;
}

export interface ReportSession {
  timeRange: '7D' | '30D' | 'YTD' | 'ALL';
  selectedDashboard: string;
}
