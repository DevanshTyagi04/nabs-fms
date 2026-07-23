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
    disabled: true,
    badge: 'Phase 7',
  },
  {
    id: 'vendor-profile',
    title: 'Profile',
    href: '/profile',
    icon: 'user',
    roles: ['VENDOR'],
    order: 3,
    requiresAuth: true,
  },
  {
    id: 'vendor-settings',
    title: 'Settings',
    href: '/settings',
    icon: 'settings',
    roles: ['VENDOR'],
    order: 4,
    requiresAuth: true,
  },
];

NavigationRegistry.registerItems(VENDOR_NAVIGATION_CONFIG);
