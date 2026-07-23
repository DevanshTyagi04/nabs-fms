import {
  DashboardMetric,
  DashboardActivity,
  DashboardAnnouncement,
  DashboardQuickAction,
} from '@/types/dashboard';

export const VENDOR_PLACEHOLDER_METRICS: DashboardMetric[] = [
  {
    id: 'metric-1',
    label: 'Active Dispatches',
    value: '4',
    trend: '+1',
    trendType: 'positive',
    icon: 'briefcase',
    description: 'Assigned items for today',
  },
  {
    id: 'metric-2',
    label: 'Completed Cycle',
    value: '28',
    trend: '+5',
    trendType: 'positive',
    icon: 'check-circle',
    description: 'Current cycle total',
  },
  {
    id: 'metric-3',
    label: 'Quality Score',
    value: '4.9',
    trend: 'Top 5%',
    trendType: 'positive',
    icon: 'grid',
    description: 'System rating average',
  },
];

export const VENDOR_PLACEHOLDER_ACTIVITIES: DashboardActivity[] = [
  {
    id: 'act-1',
    title: 'Dispatch item #2014 acknowledged',
    subtitle: 'Location: Zone B Sector 4',
    timestamp: '15 mins ago',
    type: 'info',
    statusLabel: 'Acknowledged',
  },
  {
    id: 'act-2',
    title: 'Scheduled maintenance check',
    subtitle: 'Routine system validation',
    timestamp: '1 hour ago',
    type: 'success',
    statusLabel: 'Completed',
  },
];

export const VENDOR_PLACEHOLDER_ANNOUNCEMENTS: DashboardAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Mobile App Foundation Active',
    message: 'Expo v57 design system and session framework are fully configured.',
    category: 'Mobile System',
    date: '2026-07-23',
  },
];

export const VENDOR_PLACEHOLDER_QUICK_ACTIONS: DashboardQuickAction[] = [
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
