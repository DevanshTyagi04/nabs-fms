import {
  DashboardMetric,
  DashboardActivity,
  DashboardAnnouncement,
  DashboardQuickAction,
} from '@/types/dashboard';

export const ADMIN_PLACEHOLDER_METRICS: DashboardMetric[] = [
  {
    id: 'metric-1',
    label: 'Overview Metrics A',
    value: '1,284',
    trend: '+12.5%',
    trendType: 'positive',
    icon: 'grid',
    description: 'Compared to previous cycle',
  },
  {
    id: 'metric-2',
    label: 'Overview Metrics B',
    value: '342',
    trend: '+4.1%',
    trendType: 'positive',
    icon: 'briefcase',
    description: 'Active items in queue',
  },
  {
    id: 'metric-3',
    label: 'Overview Metrics C',
    value: '98.4%',
    trend: '+0.8%',
    trendType: 'positive',
    icon: 'check-circle',
    description: 'Completion rate',
  },
  {
    id: 'metric-4',
    label: 'System Load',
    value: '24ms',
    trend: '-3.2%',
    trendType: 'positive',
    icon: 'refresh',
    description: 'Average latency',
  },
];

export const ADMIN_PLACEHOLDER_ACTIVITIES: DashboardActivity[] = [
  {
    id: 'act-1',
    title: 'System event log #4092 processed',
    subtitle: 'Automated background cycle executed',
    timestamp: '10 mins ago',
    type: 'success',
    statusLabel: 'Completed',
  },
  {
    id: 'act-2',
    title: 'Configuration updated',
    subtitle: 'Security parameter refresh',
    timestamp: '45 mins ago',
    type: 'info',
    statusLabel: 'Updated',
  },
  {
    id: 'act-3',
    title: 'Scheduled maintenance check',
    subtitle: 'Routine diagnostics routine',
    timestamp: '2 hours ago',
    type: 'warning',
    statusLabel: 'Pending',
  },
];

export const ADMIN_PLACEHOLDER_ANNOUNCEMENTS: DashboardAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'System Update Completed',
    message: 'Phase 3 dashboard foundation and navigation framework are active.',
    category: 'System',
    date: '2026-07-23',
  },
  {
    id: 'ann-2',
    title: 'Maintenance Schedule Window',
    message: 'Upcoming maintenance window scheduled for midnight UTC.',
    category: 'Maintenance',
    date: '2026-07-24',
  },
];

export const ADMIN_PLACEHOLDER_QUICK_ACTIONS: DashboardQuickAction[] = [
  {
    id: 'qa-1',
    title: 'View Overview',
    icon: 'grid',
    href: '/',
  },
  {
    id: 'qa-2',
    title: 'System Settings',
    icon: 'settings',
    href: '/settings',
  },
  {
    id: 'qa-3',
    title: 'Security Log',
    icon: 'lock',
    href: '#',
    disabled: true,
  },
  {
    id: 'qa-4',
    title: 'System Health',
    icon: 'check-circle',
    href: '#',
    disabled: true,
  },
];
