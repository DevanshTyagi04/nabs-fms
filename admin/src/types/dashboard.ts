import { IconName } from '@packages/shared-types';

export interface DashboardMetric {
  id: string;
  label: string;
  value: string | number;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: IconName;
  description?: string;
}

export interface DashboardActivity {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  statusLabel?: string;
}

export interface DashboardAnnouncement {
  id: string;
  title: string;
  message: string;
  category: string;
  date: string;
}

export interface DashboardQuickAction {
  id: string;
  title: string;
  icon: IconName;
  href: string;
  disabled?: boolean;
}
