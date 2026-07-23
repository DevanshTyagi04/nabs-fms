'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Breadcrumb } from './Breadcrumb';
import { UserMenu } from './UserMenu';
import { NavigationRegistry, NavItem } from '@/navigation/registry';
import { useAuth } from '@/auth/hooks/useAuth';
import { cn } from '@/utils/cn';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  items?: NavItem[];
}

export function Sidebar({ collapsed, onToggle, items }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();
  const navItems = items || NavigationRegistry.getItems(role);

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-30 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-900 dark:bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              NABS
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight">Admin Console</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-blue-900 dark:bg-blue-600 flex items-center justify-center text-white font-bold text-xs mx-auto">
            N
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size="sm" />
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isDisabled = item.disabled;

          if (isDisabled) {
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium opacity-40 cursor-not-allowed text-slate-400',
                  collapsed && 'justify-center px-0'
                )}
                title={item.description}
              >
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} size="md" />
                  {!collapsed && <span>{item.title}</span>}
                </div>
                {!collapsed && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-mono">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
                collapsed && 'justify-center px-0'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon name={item.icon} size="md" />
                {!collapsed && <span>{item.title}</span>}
              </div>
              {!collapsed && item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

export function TopNavigation({ onMobileMenuToggle }: { onMobileMenuToggle: () => void }) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between sticky top-0 z-20 gap-4">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle navigation drawer"
        >
          <Icon name="menu" size="md" />
        </button>

        {/* Quick Search Placeholder */}
        <div className="hidden sm:block flex-1">
          <Input placeholder="Quick Search (Press /)..." leftIcon="search" className="h-9 text-xs" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell Icon Placeholder */}
        <button
          className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="View notifications"
        >
          <Icon name="bell" size="sm" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
        </button>

        {/* User Dropdown Menu */}
        <UserMenu />
      </div>
    </header>
  );
}

export interface AppLayoutProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AppLayout({ header, sidebar, breadcrumb, children, footer }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {sidebar || <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />}

      <div className={cn('flex-1 flex flex-col transition-all duration-300', collapsed ? 'md:ml-16' : 'md:ml-64')}>
        {header || <TopNavigation onMobileMenuToggle={() => setCollapsed(!collapsed)} />}

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-6">
          {breadcrumb !== null && (breadcrumb || <Breadcrumb />)}
          {children}
        </main>

        {footer && <footer className="p-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">{footer}</footer>}
      </div>
    </div>
  );
}
