import {
  DashboardMetric,
  DashboardActivity,
  DashboardAnnouncement,
  DashboardQuickAction,
} from '@/types/dashboard';

export const CUSTOMER_PLACEHOLDER_METRICS: DashboardMetric[] = [
  {
    id: 'metric-1',
    label: 'Overview Metrics A',
    value: '2',
    trend: 'Active',
    trendType: 'positive',
    icon: 'briefcase',
    description: 'Active items in system',
  },
  {
    id: 'metric-2',
    label: 'Overview Metrics B',
    value: '14',
    trend: 'Completed',
    trendType: 'positive',
    icon: 'check-circle',
    description: 'Total completed items',
  },
  {
    id: 'metric-3',
    label: 'Saved Locations',
    value: '3',
    trend: 'Primary',
    trendType: 'neutral',
    icon: 'home',
    description: 'Configured addresses',
  },
];

export const CUSTOMER_PLACEHOLDER_ACTIVITIES: DashboardActivity[] = [
  {
    id: 'act-1',
    title: 'Service confirmation #1082 issued',
    subtitle: 'Scheduled window confirmed',
    timestamp: '25 mins ago',
    type: 'success',
    statusLabel: 'Confirmed',
  },
  {
    id: 'act-2',
    title: 'Account detail update',
    subtitle: 'Primary contact phone updated',
    timestamp: 'Yesterday',
    type: 'info',
    statusLabel: 'Saved',
  },
];

export const CUSTOMER_PLACEHOLDER_ANNOUNCEMENTS: DashboardAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Customer Application Active',
    message: 'Phase 3 Customer Mobile Application Shell is active.',
    category: 'Customer Portal',
    date: '2026-07-23',
  },
];

export const CUSTOMER_PLACEHOLDER_QUICK_ACTIONS: DashboardQuickAction[] = [
  {
    id: 'qa-1',
    title: 'Overview',
    icon: 'grid',
    href: '/',
  },
  {
    id: 'qa-2',
    title: 'Profile',
    icon: 'user',
    href: '/profile',
  },
  {
    id: 'qa-3',
    title: 'Settings',
    icon: 'settings',
    href: '/settings',
  },
];
