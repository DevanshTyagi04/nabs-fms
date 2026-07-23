import { NavItem, NavigationRegistry } from './registry';

export const VENDOR_NAVIGATION_CONFIG: NavItem[] = [
  {
    id: 'vendor-home',
    title: 'Home',
    href: '/',
    icon: 'grid',
    roles: ['VENDOR'],
    order: 1,
    requiresAuth: true,
  },
  {
    id: 'vendor-jobs',
    title: 'Dispatches',
    href: '/work-orders',
    icon: 'briefcase',
    roles: ['VENDOR'],
    order: 2,
    requiresAuth: true,
  },
  {
    id: 'vendor-surveys',
    title: 'Surveys',
    href: '/surveys',
    icon: 'file-text',
    roles: ['VENDOR'],
    order: 3,
    requiresAuth: true,
  },
  {
    id: 'vendor-estimates',
    title: 'Estimates',
    href: '/estimates',
    icon: 'file-text',
    roles: ['VENDOR'],
    order: 4,
    requiresAuth: true,
    disabled: false,
    badge: 'Active',
  },
  {
    id: 'vendor-profile',
    title: 'Profile',
    href: '/profile',
    icon: 'user',
    roles: ['VENDOR'],
    order: 5,
    requiresAuth: true,
  },
  {
    id: 'vendor-settings',
    title: 'Settings',
    href: '/settings',
    icon: 'settings',
    roles: ['VENDOR'],
    order: 6,
    requiresAuth: true,
  },
];

NavigationRegistry.registerItems(VENDOR_NAVIGATION_CONFIG);
